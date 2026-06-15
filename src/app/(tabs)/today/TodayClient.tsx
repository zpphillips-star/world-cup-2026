'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import MatchCard from '@/components/MatchCard'
import { FlagImg } from '@/components/FlagImg'
import { normalize } from '@/lib/espnAliases'
import { computeStandingsFromMatches, mergeStandings } from '@/lib/standingsUtils'
import type { StandingRow } from '@/app/api/standings/route'

function applyLiveScores(
  matches: Match[],
  scores: Record<string, ScoreUpdate>,
  aliases: Record<string, string>
): Match[] {
  if (Object.keys(scores).length === 0) return matches
  return matches.map(m => {
    const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
    const update = scores[key] ?? scores[aliases[key]]
    if (!update) return m
    return { ...m, homeScore: update.homeScore, awayScore: update.awayScore, status: update.status }
  })
}

// Compact match row for Today view — tappable
function TodayMatchRow({
  match,
  liveData,
  onClick,
}: {
  match: Match
  liveData?: ScoreUpdate
  onClick: () => void
}) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt

  return (
    <button
      onClick={onClick}
      className="w-full text-left active:scale-[0.98] transition-transform"
    >
      <div
        className={`rounded-2xl overflow-hidden relative ${
          isLive
            ? 'border border-red-500/30 bg-gradient-to-r from-red-950/30 to-[#13131a]'
            : isFt
            ? 'border border-white/5 bg-[#13131a]'
            : 'border border-white/5 bg-[#13131a]'
        }`}
      >
        {/* Live pulse bar */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
        )}

        <div className="px-4 py-3 flex items-center gap-3">
          {/* Status badge */}
          <div className="w-14 flex-shrink-0 flex flex-col items-center gap-0.5">
            {isLive ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-red-400 uppercase">Live</span>
                </span>
                {liveData?.clock && (
                  <span className="text-[10px] text-red-400 tabular-nums">{liveData.clock}</span>
                )}
              </>
            ) : isFt ? (
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Final</span>
            ) : (
              <span className="text-[11px] text-zinc-400 text-center leading-tight">
                {new Date(match.kickoff).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
              </span>
            )}
          </div>

          {/* Home */}
          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
            <span className={`text-[13px] font-semibold truncate text-right ${hasScore ? 'text-white' : 'text-zinc-300'}`}>
              {match.homeTeam.name}
            </span>
            <FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className="h-5 flex-shrink-0" />
          </div>

          {/* Score / VS */}
          <div className="w-14 flex-shrink-0 flex items-center justify-center">
            {hasScore ? (
              <span className={`text-[15px] font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                {match.homeScore}–{match.awayScore}
              </span>
            ) : (
              <span className="text-[12px] text-zinc-500 font-medium">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className="h-5 flex-shrink-0" />
            <span className={`text-[13px] font-semibold truncate ${hasScore ? 'text-white' : 'text-zinc-300'}`}>
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Scorers strip */}
        {isLive && liveData?.scorers && liveData.scorers.length > 0 && (
          <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
            {liveData.scorers.map((s, i) => (
              <span key={i} className="text-[10px] text-zinc-400">
                ⚽ {s.playerName} {s.minute}{i < liveData.scorers!.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>
        )}

        {/* Group badge + venue */}
        <div className="px-4 pb-2 flex items-center gap-2">
          {match.group && (
            <span className="text-[9px] font-bold text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Group {match.group}
            </span>
          )}
          <span className="text-[10px] text-zinc-600 truncate">📍 {match.venue.name}</span>
        </div>
      </div>
    </button>
  )
}

export default function TodayClient({
  matches,
  statsMap = {},
  standingsMap = {},
}: {
  matches: Match[]
  statsMap?: Record<string, TeamStats | null>
  standingsMap?: Record<string, Standing[]>
}) {
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [liveAliases, setLiveAliases] = useState<Record<string, string>>({})
  const [liveStandingsMap, setLiveStandingsMap] = useState<Record<string, Standing[]>>(standingsMap)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const liveScoresRef = useRef(liveScores)
  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
      setLiveAliases(data.aliases ?? {})
    } catch { /* fail silently */ }
  }, [])

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('/api/standings')
      if (!res.ok) return
      const data = await res.json()
      setLiveStandingsMap(mergeStandings(standingsMap, data.standings as Record<string, StandingRow[]> ?? {}))
    } catch { /* fail silently */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standingsMap])

  useEffect(() => {
    fetchScores()
    fetchStandings()
    let interval = setInterval(fetchScores, 30_000)
    const standingsInterval = setInterval(fetchStandings, 60_000)
    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')
      const newRate = hasLive ? 2_000 : 30_000
      clearInterval(interval)
      interval = setInterval(fetchScores, newRate)
    }, 5_000)
    return () => { clearInterval(interval); clearInterval(adaptivePoller); clearInterval(standingsInterval) }
  }, [fetchScores, fetchStandings])

  const liveMatches = useMemo(
    () => applyLiveScores(matches, liveScores, liveAliases),
    [matches, liveScores, liveAliases]
  )

  // Compute live standings
  const computedStandingsMap = useMemo(
    () => computeStandingsFromMatches(liveMatches, standingsMap),
    [liveMatches, standingsMap]
  )
  const effectiveStandingsMap = useMemo(() => {
    const result = { ...computedStandingsMap }
    for (const [group, espnRows] of Object.entries(liveStandingsMap)) {
      const espnPlayed = espnRows.reduce((s, r) => s + r.played, 0)
      const computedPlayed = computedStandingsMap[group]?.reduce((s, r) => s + r.played, 0) ?? 0
      if (espnPlayed > computedPlayed) result[group] = espnRows
    }
    return result
  }, [computedStandingsMap, liveStandingsMap])

  // Filter to today's matches in user timezone
  const todayMatches = useMemo(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date())
    return liveMatches
      .filter(m => {
        const d = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date(m.kickoff))
        return d === today
      })
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
  }, [liveMatches, userTimezone])

  const finishedToday = todayMatches.filter(m => m.status === 'ft')
  const liveToday = todayMatches.filter(m => m.status === 'live')
  const upcomingToday = todayMatches.filter(m => m.status === 'upcoming')

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: userTimezone,
  })

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192-v2.png" className="w-8 h-8 rounded-xl" alt="WC26" />
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight leading-none">Today</h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">{todayLabel}</p>
          </div>
        </div>
      </div>

      {todayMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="text-5xl mb-4">⚽</span>
          <p className="text-zinc-400 font-semibold text-lg">No matches today</p>
          <p className="text-zinc-600 text-sm mt-1">Check the Schedule tab for upcoming games</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">

          {/* LIVE */}
          {liveToday.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Live Now</span>
                <span className="text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{liveToday.length}</span>
              </div>
              <div className="space-y-3">
                {liveToday.map(m => {
                  const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
                  return (
                    <TodayMatchRow
                      key={m.id}
                      match={m}
                      liveData={liveScores[key] ?? liveScores[liveAliases[key]]}
                      onClick={() => setSelectedMatch(m)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* FINISHED */}
          {finishedToday.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-sm bg-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Final</span>
              </div>
              <div className="space-y-3">
                {finishedToday.map(m => (
                  <TodayMatchRow
                    key={m.id}
                    match={m}
                    onClick={() => setSelectedMatch(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING */}
          {upcomingToday.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-sm bg-[#00d4ff]" />
                <span className="text-[11px] font-bold text-[#00d4ff] uppercase tracking-widest">Upcoming</span>
              </div>
              <div className="space-y-3">
                {upcomingToday.map(m => (
                  <TodayMatchRow
                    key={m.id}
                    match={m}
                    onClick={() => setSelectedMatch(m)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Match detail popup */}
      {selectedMatch && (
        <MatchCard
          match={selectedMatch}
          userTimezone={userTimezone}
          homeStats={statsMap[selectedMatch.homeTeam.id]}
          awayStats={statsMap[selectedMatch.awayTeam.id]}
          groupStandings={selectedMatch.group ? effectiveStandingsMap[selectedMatch.group] : undefined}
          groupMatches={selectedMatch.group ? liveMatches.filter(m => m.group === selectedMatch.group) : undefined}
          clock={(() => {
            const key = `${normalize(selectedMatch.homeTeam.name)}|${normalize(selectedMatch.awayTeam.name)}`
            return (liveScores[key] ?? liveScores[liveAliases[key]])?.clock
          })()}
          scorers={(() => {
            const key = `${normalize(selectedMatch.homeTeam.name)}|${normalize(selectedMatch.awayTeam.name)}`
            return (liveScores[key] ?? liveScores[liveAliases[key]])?.scorers
          })()}
          defaultOpen
          onCloseExternal={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}
