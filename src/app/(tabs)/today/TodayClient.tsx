'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import type { StandingRow } from '@/app/api/standings/route'
import MatchCard from '@/components/MatchCard'
import { FlagImg } from '@/components/FlagImg'
import { normalize } from '@/lib/espnAliases'
import { computeStandingsFromMatches, mergeStandings } from '@/lib/standingsUtils'

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

// ── Featured match card ───────────────────────────────────────────────────────
function FeaturedMatchCard({
  match,
  liveData,
  onClick,
  userTimezone,
  featured = false,
}: {
  match: Match
  liveData?: ScoreUpdate
  onClick: () => void
  userTimezone: string
  featured?: boolean
}) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt

  const kickoffTime = new Date(match.kickoff).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: userTimezone,
  })

  const homeScorers = liveData?.scorers?.filter(s => s.teamSide === 'home') ?? []
  const awayScorers = liveData?.scorers?.filter(s => s.teamSide === 'away') ?? []

  return (
    <button
      onClick={onClick}
      className="w-full text-left active:scale-[0.97] transition-transform relative"
    >
      {/* Animated glow ring for live */}
      {isLive && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: '0 0 0 2px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.35)',
            animation: 'liveCardGlow 2s ease-in-out infinite',
            borderRadius: '1.5rem',
          }}
        />
      )}
      <div
        className={`rounded-3xl overflow-hidden relative`}
        style={{
          background: isLive
            ? 'linear-gradient(160deg, #13131a 0%, #0f0f16 100%)'
            : isFt
            ? 'linear-gradient(160deg, #111118 0%, #0d0d14 100%)'
            : 'linear-gradient(160deg, #0d1420 0%, #0a0d14 100%)',
          border: isLive
            ? '1.5px solid rgba(239,68,68,0.35)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: isLive
            ? '0 0 0 1px rgba(239,68,68,0.08), 0 8px 32px rgba(239,68,68,0.12), 0 2px 12px rgba(0,0,0,0.8)'
            : '0 2px 16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Live: full-width pulsing red top bar */}
        {isLive && (
          <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        )}

        {/* Top row: group badge + status */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {match.group && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${isLive ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-zinc-500'}`}>
                Group {match.group}
              </span>
            )}
            <span className="text-[10px] text-zinc-600 truncate max-w-[160px]">
              {match.venue.name}, {match.venue.city}
            </span>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[12px] font-black text-red-400 uppercase tracking-wider">Live</span>
              {liveData?.clock && (
                <span className="text-[12px] font-bold text-red-300 tabular-nums">{liveData.clock}</span>
              )}
            </div>
          )}
          {isFt && (
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Final
            </span>
          )}
          {!hasScore && (
            <span className="text-[11px] font-semibold text-[#00d4ff]">{kickoffTime}</span>
          )}
        </div>

        {/* Main score/matchup row */}
        <div className="flex items-center justify-between px-5 py-3 gap-2">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className={`${featured ? 'h-20' : 'h-10'} rounded shadow-lg`} />
            <span className={`${featured ? 'text-[15px]' : 'text-[12px]'} font-bold text-white text-center leading-tight max-w-[90px]`}>
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 px-2 min-w-[80px]">
            {hasScore ? (
              <>
                <span className={`${featured ? 'text-[52px]' : 'text-[32px]'} font-black tabular-nums leading-none text-white`}>
                  {match.homeScore}–{match.awayScore}
                </span>
                {isFt && (
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Full Time</span>
                )}
              </>
            ) : (
              <>
                <span className="text-[22px] font-black text-zinc-500">vs</span>
                <span className="text-[10px] text-zinc-600 text-center leading-tight">
                  {new Date(match.kickoff).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', timeZone: userTimezone,
                  })}
                </span>
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className={`${featured ? 'h-20' : 'h-10'} rounded shadow-lg`} />
            <span className={`${featured ? 'text-[15px]' : 'text-[12px]'} font-bold text-white text-center leading-tight max-w-[90px]`}>
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Goal scorers — visible on the card, no tap needed */}
        {(homeScorers.length > 0 || awayScorers.length > 0) && (
          <div className="mx-5 mb-4 pt-3 border-t border-white/5">
            <div className="flex gap-3">
              {/* Home scorers */}
              <div className="flex-1 space-y-1">
                {homeScorers.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-sm leading-none">⚽</span>
                    <span className="text-[11px] font-medium text-zinc-300 truncate">{s.playerName}</span>
                    <span className="text-[10px] text-zinc-500 flex-shrink-0">{s.minute}</span>
                    {s.type !== 'goal' && (
                      <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1 rounded flex-shrink-0">
                        {s.type === 'og' ? 'OG' : 'pen'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Away scorers */}
              <div className="flex-1 space-y-1 flex flex-col items-end">
                {awayScorers.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 flex-row-reverse">
                    <span className="text-sm leading-none">⚽</span>
                    <span className="text-[11px] font-medium text-zinc-300 truncate">{s.playerName}</span>
                    <span className="text-[10px] text-zinc-500 flex-shrink-0">{s.minute}</span>
                    {s.type !== 'goal' && (
                      <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1 rounded flex-shrink-0">
                        {s.type === 'og' ? 'OG' : 'pen'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming — countdown feel */}
        {!hasScore && (
          <div className="px-5 pb-4 flex items-center justify-center gap-2">
            <span className="text-[11px] text-zinc-500">Kickoff at</span>
            <span className="text-[13px] font-bold text-[#00d4ff]">{kickoffTime}</span>
            <span className="text-[11px] text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-500">{match.venue.city}</span>
          </div>
        )}

        {/* Tap hint */}
        <div className="px-5 pb-3 flex justify-end">
          <span className="text-[10px] text-zinc-700">Tap for details ›</span>
        </div>
      </div>
    </button>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label, color, count, pulse }: {
  label: string
  color: string
  count?: number
  pulse?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className={`w-2.5 h-2.5 rounded-sm ${color} ${pulse ? 'animate-pulse' : ''}`} />
      <span className={`text-[13px] font-black uppercase tracking-widest text-white`}>{label}</span>
      {count != null && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${pulse ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-zinc-400'}`}>
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

  useEffect(() => { setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) }, [])

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
      clearInterval(interval)
      interval = setInterval(fetchScores, hasLive ? 2_000 : 30_000)
    }, 5_000)
    return () => { clearInterval(interval); clearInterval(adaptivePoller); clearInterval(standingsInterval) }
  }, [fetchScores, fetchStandings])

  const liveMatches = useMemo(
    () => applyLiveScores(matches, liveScores, liveAliases),
    [matches, liveScores, liveAliases]
  )

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

  const todayMatches = useMemo(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date())
    return liveMatches
      .filter(m => new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date(m.kickoff)) === today)
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
  }, [liveMatches, userTimezone])

  const liveToday    = todayMatches.filter(m => m.status === 'live')
  const finishedToday = todayMatches.filter(m => m.status === 'ft')
  const upcomingToday = todayMatches.filter(m => m.status === 'upcoming')

  const getLiveData = (m: Match) => {
    const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
    return liveScores[key] ?? liveScores[liveAliases[key]]
  }

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', timeZone: userTimezone,
  })

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>

      {/* Header — matches Schedule/Groups/Calendar style */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-white tracking-tight">Today</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">FIFA World Cup 2026 · {todayLabel}</p>
      </div>

      {todayMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-5">
            <span className="text-4xl">⚽</span>
          </div>
          <p className="text-white font-bold text-xl">No matches today</p>
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">Check the Schedule tab for upcoming games</p>
        </div>
      ) : (
        <div className="px-4 space-y-8">

          {/* FINISHED — top, already happened */}
          {finishedToday.length > 0 && (
            <div>
              <SectionHeader label="Final" color="bg-zinc-500" count={finishedToday.length} />
              <div className="space-y-4">
                {finishedToday.map(m => (
                  <FeaturedMatchCard
                    key={m.id}
                    match={m}
                    liveData={getLiveData(m)}
                    userTimezone={userTimezone}
                    onClick={() => setSelectedMatch(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* LIVE — middle, most featured */}
          {liveToday.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 animate-pulse" />
                <span className="text-[14px] font-black uppercase tracking-widest text-red-400">Live Now</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                  {liveToday.length}
                </span>
                <div className="flex-1 h-px bg-red-500/20" />
              </div>
              <div className="space-y-4 -mx-1">
                {liveToday.map(m => (
                  <FeaturedMatchCard
                    key={m.id}
                    match={m}
                    liveData={getLiveData(m)}
                    userTimezone={userTimezone}
                    featured={true}
                    onClick={() => setSelectedMatch(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING — bottom */}
          {upcomingToday.length > 0 && (
            <div>
              <SectionHeader label="Upcoming" color="bg-[#00d4ff]" count={upcomingToday.length} />
              <div className="space-y-4">
                {upcomingToday.map(m => (
                  <FeaturedMatchCard
                    key={m.id}
                    match={m}
                    userTimezone={userTimezone}
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
          clock={getLiveData(selectedMatch)?.clock}
          scorers={getLiveData(selectedMatch)?.scorers}
          defaultOpen
          onCloseExternal={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}
