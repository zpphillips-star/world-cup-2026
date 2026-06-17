'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import MatchCard from '@/components/MatchCard'
import { FlagImg } from '@/components/FlagImg'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate, ScoringEvent } from '@/app/api/live-scores/route'
import { normalize } from '@/lib/espnAliases'
import { mergeStandings, computeStandingsFromMatches } from '@/lib/standingsUtils'

function getLocalDateKey(kickoff: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(kickoff))
}

function formatDateHeader(isoDate: string, timezone: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const d = new Date(year, month - 1, day, 12, 0, 0)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone })
  const mon = d.toLocaleDateString('en-US', { month: 'short', timeZone: timezone })
  return `${weekday} · ${mon} ${day}`
}

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

// ── Live Now sheet ──────────────────────────────────────────────────────────

function LiveNowSheet({
  liveMatches,
  liveScores,
  liveAliases,
  statsMap,
  standingsMap,
  onClose,
  userTimezone,
  allMatchesSorted,
}: {
  liveMatches: Match[]
  liveScores: Record<string, ScoreUpdate>
  liveAliases: Record<string, string>
  statsMap: Record<string, TeamStats | null>
  standingsMap: Record<string, Standing[]>
  onClose: () => void
  userTimezone: string
  allMatchesSorted: Match[]
}){
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[60] max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a0505] to-[#13131a] px-5 pt-4 pb-5 flex-shrink-0 border-b border-red-500/20">
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
          <button
            onClick={onClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >✕</button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <span className="relative block w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Live Now</h2>
              <p className="text-[11px] text-red-400/80">Scores updating every 2s</p>
            </div>
          </div>
        </div>

        {/* Live match cards */}
        <div
          className="overflow-y-auto bg-[#0f0f18] px-4 py-4 space-y-3 flex-1"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        >
          {liveMatches.map(m => {
            const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
            const liveData = liveScores[key] ?? liveScores[liveAliases[key]]
            const homeScorers = liveData?.scorers?.filter(s => s.teamSide === 'home') ?? []
            const awayScorers = liveData?.scorers?.filter(s => s.teamSide === 'away') ?? []
            const homeRedCards = liveData?.redCards?.filter(c => c.teamSide === 'home') ?? []
            const awayRedCards = liveData?.redCards?.filter(c => c.teamSide === 'away') ?? []

            return (
              <button
                key={m.id}
                className="w-full text-left bg-[#1a1a24] rounded-2xl overflow-hidden border border-red-500/20 active:scale-[0.98] transition-transform"
                onClick={() => setSelectedMatch(m)}
              >
                {/* Live badge + clock */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Live</span>
                    {liveData?.clock && (
                      <span className="text-[11px] font-semibold text-red-400">{liveData.clock}</span>
                    )}
                  </div>
                  {m.group && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
                      Group {m.group}
                    </span>
                  )}
                </div>

                {/* Score row */}
                <div className="flex items-center justify-between px-4 pb-3 gap-2">
                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-9" />
                    <span className="text-[12px] font-semibold text-white text-center leading-tight">{m.homeTeam.name}</span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center min-w-[64px]">
                    <span className="text-3xl font-black text-red-400 tabular-nums leading-none">
                      {m.homeScore} – {m.awayScore}
                    </span>
                  </div>

                  {/* Away */}
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-9" />
                    <span className="text-[12px] font-semibold text-white text-center leading-tight">{m.awayTeam.name}</span>
                  </div>
                </div>

                {/* Goal scorers + red cards — name always centered, ball left for home / right for away */}
                {(liveData?.scorers?.length ?? 0) > 0 && (
                  <div className="border-t border-zinc-800 mx-4 pt-2.5 pb-2 flex flex-col gap-1">
                    {(liveData?.scorers ?? []).sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((e, i) => (
                      <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                        <span className="text-[11px] text-zinc-300 text-right leading-none">
                          {e.teamSide === 'home' && <span>{e.playerName}</span>}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{e.minute}</span>
                        <span className="text-[11px] text-zinc-300 text-left leading-none">
                          {e.teamSide === 'away' && <span>{e.playerName}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(liveData?.redCards?.length ?? 0) > 0 && (
                  <div className="border-t border-zinc-800 mx-4 pt-2 pb-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Red Cards</span>
                      <div className="flex-1 h-px bg-red-500/20" />
                    </div>
                    {(liveData?.redCards ?? []).sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((c, i) => (
                      <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                        <span className="text-[11px] text-zinc-300 text-right leading-none">
                          {c.teamSide === 'home' && <span>🟥 {c.playerName}</span>}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{c.minute}</span>
                        <span className="text-[11px] text-zinc-300 text-left leading-none">
                          {c.teamSide === 'away' && <span>{c.playerName} 🟥</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Venue + tap hint */}
                <div className="bg-black/20 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">📍 {m.venue.name}, {m.venue.city}</span>
                  <span className="text-[10px] text-zinc-600">Tap for details →</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Full match detail — opened from a card tap */}
      {selectedMatch && (() => {
        const key = `${normalize(selectedMatch.homeTeam.name)}|${normalize(selectedMatch.awayTeam.name)}`
        const liveData = liveScores[key] ?? liveScores[liveAliases[key]]
        return (
          <MatchCard
            match={selectedMatch}
            userTimezone={userTimezone}
            homeStats={statsMap[selectedMatch.homeTeam.id]}
            awayStats={statsMap[selectedMatch.awayTeam.id]}
            groupStandings={selectedMatch.group ? standingsMap[selectedMatch.group] : undefined}
            groupMatches={selectedMatch.group ? liveMatches.filter(m => m.group === selectedMatch.group) : undefined}
            clock={liveData?.clock}
            scorers={liveData?.scorers}
            defaultOpen
            onCloseExternal={() => setSelectedMatch(null)}
            allMatches={allMatchesSorted}
            allStatsMap={statsMap}
            allStandingsMap={standingsMap}
            allLiveData={liveScores}
            allLiveAliases={liveAliases}
          />
        )
      })()}
    </>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ScheduleClient({
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
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [liveSheetOpen, setLiveSheetOpen] = useState(false)
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  // Snap to today instantly on mount (after timezone resolves)
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [userTimezone])

  const fetchScores= useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
      setLiveAliases(data.aliases ?? {})
      setLastUpdated(Date.now())
    } catch { /* fail silently */ }
  }, [])

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('/api/standings')
      if (!res.ok) return
      const data = await res.json()
      setLiveStandingsMap(prev => mergeStandings(standingsMap, data.standings ?? {}))
    } catch { /* fail silently */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standingsMap])

  const liveScoresRef = useRef(liveScores)
  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])

  // Keep a ref to matches so the adaptive poller can check kickoff times without stale closure
  const matchesRef = useRef(matches)
  useEffect(() => { matchesRef.current = matches }, [matches])

  useEffect(() => {
    fetchScores()
    fetchStandings()
    let interval = setInterval(fetchScores, 30_000)
    const standingsInterval = setInterval(fetchStandings, 60_000)

    const adaptivePoller = setInterval(() => {
      const now = Date.now()

      // Fast polling if ESPN reports a live game
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')

      // ALSO fast poll if any match kicks off within the next 10 min (or started up to 120min ago and isn't marked ft)
      // This means we go fast BEFORE ESPN even notices, purely from our own schedule data
      const kickoffActive = matchesRef.current.some(m => {
        const kick = new Date(m.kickoff).getTime()
        const msSinceKick = now - kick
        return kick <= now + 10 * 60_000     // within 10 min of kickoff
            && msSinceKick < 120 * 60_000    // game can't be more than 120 min old
            && m.status !== 'ft'             // not already marked final in our data
      })

      const newRate = (hasLive || kickoffActive) ? 2_000 : 30_000
      clearInterval(interval)
      interval = setInterval(fetchScores, newRate)
    }, 5_000)

    return () => { clearInterval(interval); clearInterval(adaptivePoller); clearInterval(standingsInterval) }
  }, [fetchScores, fetchStandings])

  const liveMatches = useMemo(() => applyLiveScores(matches, liveScores, liveAliases), [matches, liveScores, liveAliases])
  const hasAnyLive = useMemo(() => Object.values(liveScores).some(s => s.status === 'live'), [liveScores])
  const liveCount = useMemo(() => Object.values(liveScores).filter(s => s.status === 'live').length, [liveScores])
  const currentlyLive = useMemo(() => liveMatches.filter(m => m.status === 'live'), [liveMatches])

  // Recompute standings from our own match data — instant, no API lag
  // ESPN standings are merged on top but our computed data wins for groups ESPN hasn't updated yet
  const computedStandingsMap = useMemo(
    () => computeStandingsFromMatches(liveMatches, standingsMap),
    [liveMatches, standingsMap]
  )
  const effectiveStandingsMap = useMemo(() => {
    const result = { ...computedStandingsMap }
    // For each group, prefer ESPN data only if it shows MORE games played than our computed data
    for (const [group, espnRows] of Object.entries(liveStandingsMap)) {
      const computed = computedStandingsMap[group]
      const espnPlayed = espnRows.reduce((s, r) => s + r.played, 0)
      const computedPlayed = computed?.reduce((s, r) => s + r.played, 0) ?? 0
      if (espnPlayed > computedPlayed) result[group] = espnRows
    }
    return result
  }, [computedStandingsMap, liveStandingsMap, standingsMap])

  const sortedMatches = useMemo(
    () => [...liveMatches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [liveMatches]
  )

  const byDate = useMemo(() => {
    const groups: Record<string, Match[]> = {}
    for (const m of sortedMatches) {
      const key = getLocalDateKey(m.kickoff, userTimezone)
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [sortedMatches, userTimezone])

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date())

  return (
    <div className="pb-16 max-w-2xl mx-auto">
      {/* Live banner — tappable */}
      {hasAnyLive && (
        <button
          className="w-full text-left relative overflow-hidden"
          onClick={() => setLiveSheetOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/60 via-red-900/30 to-transparent" />
          <div className="relative flex items-center justify-between px-4 py-3 border-b border-red-500/20">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                <span className="relative block w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white leading-tight tracking-wide">
                  {liveCount === 1 ? '1 match live' : `${liveCount} matches live`}
                </span>
                <span className="text-[10px] text-red-400/80 leading-tight">Scores updating every 2s</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">Tap to view</span>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full uppercase tracking-widest">
                Live
              </span>
            </div>
          </div>
        </button>
      )}

      {byDate.map(([isoDate, dayMatches], idx) => {
        const isToday = isoDate === today
        return (
          <div key={isoDate} ref={isToday ? todayRef : undefined}>
            {/* Day separator — spacer between days */}
            {idx > 0 && <div className="h-5" />}

            {/* Sticky date header */}
            <div
              className="sticky top-0 z-10 px-4 py-2.5 flex items-center gap-3"
              style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(8px)' }}
            >
              <span className={`text-[12px] uppercase tracking-widest font-bold ${isToday ? 'text-[#00d4ff]' : 'text-white'}`}>
                {formatDateHeader(isoDate, userTimezone)}
              </span>
              {isToday && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">Today</span>
              )}
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div>
              {dayMatches.map((match) => {
                const key = `${normalize(match.homeTeam.name)}|${normalize(match.awayTeam.name)}`
                const liveData = liveScores[key] ?? liveScores[liveAliases[key]]
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userTimezone={userTimezone}
                    homeStats={statsMap[match.homeTeam.id]}
                    awayStats={statsMap[match.awayTeam.id]}
                    groupStandings={match.group ? effectiveStandingsMap[match.group] : undefined}
                    groupMatches={match.group ? liveMatches.filter(m => m.group === match.group) : undefined}
                    clock={liveData?.clock}
                    scorers={liveData?.scorers}
                    allMatches={sortedMatches}
                    allStatsMap={statsMap}
                    allStandingsMap={effectiveStandingsMap}
                    allLiveData={liveScores}
                    allLiveAliases={liveAliases}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {lastUpdated && (
        <p className="text-center text-[10px] text-zinc-600 py-4">
          Scores updated {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}

      {/* Live Now sheet */}
      {liveSheetOpen && (
        <LiveNowSheet
          liveMatches={currentlyLive}
          liveScores={liveScores}
          liveAliases={liveAliases}
          statsMap={statsMap}
          standingsMap={effectiveStandingsMap}
          onClose={() => setLiveSheetOpen(false)}
          userTimezone={userTimezone}
          allMatchesSorted={sortedMatches}
        />
      )}
    </div>
  )
}







