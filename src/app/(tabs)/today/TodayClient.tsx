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
  const homeRedCards = liveData?.redCards?.filter(c => c.teamSide === 'home') ?? []
  const awayRedCards = liveData?.redCards?.filter(c => c.teamSide === 'away') ?? []

  // Scorer surname only (pro apps never show full name)
  const surname = (name: string) => name.split(' ').slice(-1)[0]

  return (
    <button
      onClick={onClick}
      className="w-full text-left active:scale-[0.98] transition-transform"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: isFt ? '#141418' : isLive ? '#1a1a24' : '#141820',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          borderLeft: isLive ? '3px solid #e8003d' : '1px solid rgba(255,255,255,0.07)',
          opacity: isFt ? 0.82 : 1,
        }}
      >
        {/* Header row: venue left, status right */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 min-w-0">
            {match.group && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-shrink-0">
                Group {match.group}
              </span>
            )}
            <span className="text-[10px] text-zinc-600 truncate">
              · {match.venue.name}, {match.venue.city}
            </span>
          </div>

          {isLive && (
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8003d]" style={{ animation: 'liveDotPulse 1.8s ease-in-out infinite' }} />
              <span className="text-[11px] font-black text-[#e8003d] uppercase tracking-wider">Live</span>
              {liveData?.clock && (
                <span className="text-[11px] font-bold text-zinc-400 tabular-nums">{liveData.clock}</span>
              )}
            </div>
          )}
          {isFt && (
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-shrink-0 ml-2">FT</span>
          )}
          {!hasScore && (
            <span className="text-[11px] font-semibold text-[#00d4ff] flex-shrink-0 ml-2">{kickoffTime}</span>
          )}
        </div>

        {/* Main match row: flag · name | score | name · flag */}
        <div className="flex items-center px-4 py-4 gap-3">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <FlagImg
              teamId={match.homeTeam.id}
              fallback={match.homeTeam.flag}
              className={`${featured ? 'h-16 w-24' : 'h-10 w-16'} object-cover rounded-md shadow`}
            />
            <span className={`${featured ? 'text-[13px]' : 'text-[12px]'} font-bold text-white text-center leading-tight`}>
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-0.5 min-w-[72px]">
            {hasScore ? (
              <>
                <span
                  className={`${featured ? 'text-[40px]' : 'text-[28px]'} font-extrabold tabular-nums leading-none text-white`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {match.homeScore}–{match.awayScore}
                </span>
                {isFt && <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">Full Time</span>}
              </>
            ) : (
              <span className="text-[18px] font-black text-zinc-500">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <FlagImg
              teamId={match.awayTeam.id}
              fallback={match.awayTeam.flag}
              className={`${featured ? 'h-16 w-24' : 'h-10 w-16'} object-cover rounded-md shadow`}
            />
            <span className={`${featured ? 'text-[13px]' : 'text-[12px]'} font-bold text-white text-center leading-tight`}>
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Goal scorers + red cards — name always centered, ball left for home / right for away */}
        {((liveData?.scorers?.length ?? 0) > 0 || (liveData?.redCards?.length ?? 0) > 0) && (
          <div className="flex flex-col gap-1 px-4 pb-3 border-t border-white/[0.04] pt-2">
            {[...(liveData?.scorers ?? []).map(s => ({ ...s, kind: 'goal' as const })),
              ...(liveData?.redCards ?? []).map(c => ({ ...c, kind: 'card' as const }))]
              .sort((a, b) => parseInt(a.minute) - parseInt(b.minute))
              .map((e, i) => (
                <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                  <span className="flex items-center justify-end pr-8 text-[11px] leading-none">{e.teamSide === 'home' ? (e.kind === 'goal' ? '⚽' : '🟥') : ''}</span>
                  <span className="text-[11px] text-zinc-300 font-medium text-center leading-none">
                    {surname(e.playerName)} {e.minute}
                    {e.kind === 'goal' && e.type === 'og' && <span className="text-[9px] text-zinc-600 ml-1">(og)</span>}
                    {e.kind === 'goal' && e.type === 'pen' && <span className="text-[9px] text-zinc-600 ml-1">(p)</span>}
                    {e.kind === 'card' && e.cardType === 'yellow-red' && <span className="text-[9px] text-zinc-600 ml-1">(2Y)</span>}
                  </span>
                  <span className="flex items-center justify-start pl-8 text-[11px] leading-none">{e.teamSide === 'away' ? (e.kind === 'goal' ? '⚽' : '🟥') : ''}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* Upcoming: stadium only — time already in header */}
        {!hasScore && (
          <div className="px-4 pb-3 text-center">
            <span className="text-[11px] text-zinc-600">{match.venue.city}</span>
          </div>
        )}
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
          allMatches={todayMatches}
          allStatsMap={statsMap}
          allStandingsMap={effectiveStandingsMap}
          allLiveData={liveScores}
          allLiveAliases={liveAliases}
        />
      )}
    </div>
  )
}
