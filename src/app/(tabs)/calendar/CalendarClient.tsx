'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import MatchCard from '@/components/MatchCard'
import { FlagImg } from '@/components/FlagImg'
import { Backdrop } from '@/components/Backdrop'
import { mergeStandings } from '@/lib/standingsUtils'
import { applyLiveScores, getMatchScoreKey } from '@/lib/liveScores'
import { useEffectiveStandings } from '@/lib/useEffectiveStandings'

// ── Compact match preview card for the calendar day sheet ──────────────────
// Shows big flags + location. Tap → calls onOpen (MatchCard is rendered at root level to avoid stacking context issues).
function DayMatchCard({
  match,
  userTimezone,
  homeStats,
  awayStats,
  groupStandings,
  clock,
  scorers,
  redCards,
  onOpen,
}: {
  match: Match
  userTimezone: string
  homeStats?: TeamStats | null
  awayStats?: TeamStats | null
  groupStandings?: Standing[]
  clock?: string
  scorers?: ScoreUpdate['scorers']
  redCards?: import('@/app/api/live-scores/route').CardEvent[]
  onOpen: () => void
}) {
  // no local open state — parent controls MatchCard
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt

  const timeStr = (() => {
    try {
      return new Date(match.kickoff).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: userTimezone,
        timeZoneName: 'short',
      })
    } catch { return '' }
  })()

  return (
    <>
      <button
        onClick={onOpen}
        className="w-full text-left active:scale-[0.97] transition-transform mb-3"
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0a1628 0%, #13131a 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top bar — group + status */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            {match.group && (
              <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Group {match.group}
              </span>
            )}
            {isLive && (
              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                ● LIVE {clock && `· ${clock}`}
              </span>
            )}
            {isFt && (
              <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                FINAL
              </span>
            )}
            {match.status === 'upcoming' && (
              <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">{timeStr}</span>
            )}
          </div>

          {/* Flags + score row */}
          <div className="flex items-center justify-between px-5 py-3">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className="h-10 rounded-sm shadow-md" />
              <span className="text-[13px] font-semibold text-white text-center leading-tight max-w-[80px] line-clamp-2">
                {match.homeTeam.name}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-0.5 px-2">
              {hasScore ? (
                <span className={`text-4xl font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-2xl font-bold text-zinc-500">VS</span>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className="h-10 rounded-sm shadow-md" />
              <span className="text-[13px] font-semibold text-white text-center leading-tight max-w-[80px] line-clamp-2">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Goal scorers */}
          {(scorers && scorers.length > 0) && (
            <div className="flex flex-col gap-1 px-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Goals</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              {scorers.sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((e, i) => (
                <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                  <span className="text-[12px] text-white font-semibold text-right leading-none">
                    {e.teamSide === 'home' && <span>{e.playerName}</span>}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{e.minute}</span>
                  <span className="text-[12px] text-white font-semibold text-left leading-none">
                    {e.teamSide === 'away' && <span>{e.playerName}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Red cards — separated */}
          {(redCards && redCards.length > 0) && (
            <div className="flex flex-col gap-1 px-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-red-500/30" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">Red Cards</span>
                <div className="flex-1 h-px bg-red-500/30" />
              </div>
              {redCards.sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((c, i) => (
                <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                  <span className="text-[12px] text-white font-semibold text-right leading-none">
                    {c.teamSide === 'home' && <span>🟥 {c.playerName}</span>}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{c.minute}</span>
                  <span className="text-[12px] text-white font-semibold text-left leading-none">
                    {c.teamSide === 'away' && <span>{c.playerName} 🟥</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Location */}
          {match.venue && (
            <div className="flex items-center justify-center gap-1.5 pb-3 text-[11px] text-zinc-400">
              <span>📍</span>
              <span>{match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ''}</span>
            </div>
          )}
        </div>
      </button>
    </>
  )
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = [
  { year: 2026, month: 5, name: 'June 2026' },
  { year: 2026, month: 6, name: 'July 2026' },
]

export default function CalendarClient({
  matches,
  statsMap = {},
  standingsMap = {},
}: {
  matches: Match[]
  statsMap?: Record<string, TeamStats | null>
  standingsMap?: Record<string, Standing[]>
}) {
  const now = new Date()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [daySheetClosing, setDaySheetClosing] = useState(false)
  const daySheetClosingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [liveAliases, setLiveAliases] = useState<Record<string, string>>({})
  const [liveStandingsMap, setLiveStandingsMap] = useState<Record<string, Standing[]>>(standingsMap)
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
      setLiveStandingsMap(mergeStandings(standingsMap, data.standings ?? {}))
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

  // Fix #8: wrap in useMemo so these don't recompute on every render
  const liveMatches = useMemo(
    () => applyLiveScores(matches, liveScores, liveAliases),
    [matches, liveScores, liveAliases]
  )
  const sortedLiveMatches = useMemo(
    () => [...liveMatches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [liveMatches]
  )

  // Compute standings via shared hook — instant, no ESPN lag; ESPN overlay when it has more data
  const { effectiveStandingsMap } = useEffectiveStandings(liveMatches, standingsMap, liveStandingsMap)

  // Build match days index using LOCAL date so calendar day cells always match
  const matchDays: Record<string, Match[]> = {}
  for (const m of liveMatches) {
    const d = new Date(m.kickoff)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!matchDays[key]) matchDays[key] = []
    matchDays[key].push(m)
  }

  // Sorted match day keys for sheet swipe navigation
  const sortedMatchDayKeys = Object.keys(matchDays).sort((a, b) => {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    return new Date(ay, am, ad).getTime() - new Date(by, bm, bd).getTime()
  })

  // Day sheet swipe
  const sheetTouchStartX = useRef<number | null>(null)

  function handleSheetTouchStart(e: React.TouchEvent) {
    sheetTouchStartX.current = e.touches[0].clientX
  }

  function handleSheetTouchEnd(e: React.TouchEvent) {
    if (sheetTouchStartX.current === null || selectedDay === null) return
    const delta = e.changedTouches[0].clientX - sheetTouchStartX.current
    sheetTouchStartX.current = null
    if (Math.abs(delta) < 50) return
    const idx = sortedMatchDayKeys.indexOf(selectedDay)
    // Swipe left (delta < 0) = go forward; swipe right (delta > 0) = go back
    if (delta < 0 && idx < sortedMatchDayKeys.length - 1) {
      setSelectedDay(sortedMatchDayKeys[idx + 1])
    } else if (delta > 0 && idx > 0) {
      setSelectedDay(sortedMatchDayKeys[idx - 1])
    }
  }

  const sheetMatches = selectedDay
    ? [...(matchDays[selectedDay] ?? [])].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    : []
  const sheetDayIdx = selectedDay ? sortedMatchDayKeys.indexOf(selectedDay) : -1

  const handleCloseDaySheet = () => {
    if (daySheetClosing) return
    setDaySheetClosing(true)
    daySheetClosingTimerRef.current = setTimeout(() => {
      setSelectedDay(null)
      setDaySheetClosing(false)
    }, 260)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => { if (daySheetClosingTimerRef.current) clearTimeout(daySheetClosingTimerRef.current) }
  }, [])

  return (
    <>
      {/* Both months stacked on one scrollable page */}
      <div
        className="bg-[#0a0a0f] select-none"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        {MONTHS.map(({ year, month, name }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfWeek(year, month)

          return (
            <div key={name} className="px-4 py-4">
              <h2 className="text-xl font-bold text-center mb-4">{name}</h2>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const key = `${year}-${month}-${day}`
                  const dayMatches = matchDays[key] ?? []
                  const statuses = dayMatches.map(m => m.status)
                  const hasLive = statuses.includes('live')
                  const hasFt = statuses.includes('ft')
                  const hasUpcoming = statuses.includes('upcoming')
                  const hasMatches = dayMatches.length > 0
                  const isToday =
                    now.getFullYear() === year &&
                    now.getMonth() === month &&
                    now.getDate() === day

                  return (
                    <div
                      key={day}
                      onClick={() => hasMatches && setSelectedDay(key)}
                      className={[
                        'aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium',
                        hasMatches
                          ? 'bg-[#13131a] border border-gray-700 cursor-pointer active:scale-95 transition-transform'
                          : 'cursor-default text-gray-600',
                        isToday ? 'border-2 border-[#00d4ff]' : '',
                      ].join(' ')}
                    >
                      <span className={isToday ? 'text-[#00d4ff] font-bold' : ''}>{day}</span>
                      {hasMatches && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasLive && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />}
                          {hasFt && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 px-4 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Live
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500" /> Upcoming
          </div>
        </div>
      </div>

      {/* Day sheet */}
      {selectedDay && (
        <>
          <Backdrop onDismiss={handleCloseDaySheet} zIndex="z-[55]" bg="bg-black/60" />
          <div
            className={`fixed bottom-0 left-0 right-0 z-[60] max-h-[86vh] flex flex-col rounded-t-3xl overflow-hidden ${daySheetClosing ? 'animate-slide-down' : 'animate-slide-up'} bg-[#0f0f18]`}
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
              <h2 className="text-base font-bold">
                {(() => {
                  const [y, mo, d] = selectedDay.split('-').map(Number)
                  const dt = new Date(y, mo, d, 12)
                  return dt.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                })()}
              </h2>

            </div>
            <div className="overflow-y-auto px-4 pt-3" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              {sheetMatches.map(m => {
                const key = getMatchScoreKey(m)
                const liveData = liveScores[key] ?? liveScores[liveAliases[key]]
                return (
                  <DayMatchCard
                    key={m.id}
                    match={m}
                    userTimezone={userTimezone}
                    homeStats={statsMap[m.homeTeam.id]}
                    awayStats={statsMap[m.awayTeam.id]}
                    groupStandings={m.group ? effectiveStandingsMap[m.group] : undefined}
                    clock={liveData?.clock}
                    scorers={liveData?.scorers}
                    redCards={liveData?.redCards}
                    onOpen={() => setSelectedMatch(m)}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* MatchCard popup — rendered at root level (outside day sheet stacking context) so fixed positioning works correctly */}
      {selectedMatch && (() => {
        const key = getMatchScoreKey(selectedMatch)
        const liveData = liveScores[key] ?? liveScores[liveAliases[key]]
        return (
          <MatchCard
            match={selectedMatch}
            userTimezone={userTimezone}
            homeStats={statsMap[selectedMatch.homeTeam.id]}
            awayStats={statsMap[selectedMatch.awayTeam.id]}
            groupStandings={selectedMatch.group ? effectiveStandingsMap[selectedMatch.group] : undefined}
            groupMatches={selectedMatch.group ? liveMatches.filter(m => m.group === selectedMatch.group) : undefined}
            clock={liveData?.clock}
            scorers={liveData?.scorers}
            defaultOpen={true}
            onCloseExternal={() => setSelectedMatch(null)}
            allMatches={sortedLiveMatches}
            allStatsMap={statsMap}
            allStandingsMap={effectiveStandingsMap}
            allLiveData={liveScores}
            allLiveAliases={liveAliases}
          />
        )
      })()}
    </>
  )
}









