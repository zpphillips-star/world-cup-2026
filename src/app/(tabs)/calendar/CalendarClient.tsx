'use client'

import { FlagImg } from '@/components/FlagImg'
import MatchCard from '@/components/MatchCard'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Match, Team, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function getLocalDateKey(kickoff: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(kickoff))
}

function dayKeyToIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDayHeading(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  const date = new Date(y, mo - 1, d, 12, 0, 0)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatMatchTime(kickoff: string, timezone: string): string {
  try {
    return new Date(kickoff).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: timezone,
    })
  } catch {
    return '--:--'
  }
}

function applyLiveScores(matches: Match[], scores: Record<string, ScoreUpdate>): Match[] {
  if (Object.keys(scores).length === 0) return matches
  return matches.map(m => {
    const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
    const update = scores[key]
    if (!update) return m
    return { ...m, homeScore: update.homeScore, awayScore: update.awayScore, status: update.status }
  })
}

interface DayKey { year: number; month: number; day: number }

export default function CalendarClient({
  matches,
  statsMap = {},
  standingsMap = {},
}: {
  matches: Match[]
  statsMap?: Record<string, TeamStats | null>
  standingsMap?: Record<string, Standing[]>
}) {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const sheetTouchStartX = useRef<number | null>(null)
  const sheetTouchStartY = useRef<number | null>(null)
  const liveScoresRef = useRef(liveScores)

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
    } catch { /* fail silently */ }
  }, [])

  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])

  useEffect(() => {
    fetchScores()
    let interval = setInterval(fetchScores, 30_000)
    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')
      const newRate = hasLive ? 2_000 : 30_000
      clearInterval(interval)
      interval = setInterval(fetchScores, newRate)
    }, 5_000)
    return () => { clearInterval(interval); clearInterval(adaptivePoller) }
  }, [fetchScores])

  const liveMatches = useMemo(() => applyLiveScores(matches, liveScores), [matches, liveScores])

  const matchDayMap = useMemo(() => {
    const map: Record<string, Match[]> = {}
    for (const m of liveMatches) {
      const key = getLocalDateKey(m.kickoff, userTimezone)
      if (!map[key]) map[key] = []
      map[key].push(m)
    }
    return map
  }, [liveMatches, userTimezone])

  // Sorted list of all days that have matches
  const matchDays = useMemo(() =>
    Object.keys(matchDayMap).sort(),
    [matchDayMap]
  )

  const months = [
    { year: 2026, month: 5, name: 'June 2026' },
    { year: 2026, month: 6, name: 'July 2026' },
  ]

  const todayKey = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  const selectedKey = selectedDay
    ? dayKeyToIso(selectedDay.year, selectedDay.month, selectedDay.day)
    : null
  const selectedMatches = selectedKey
    ? [...(matchDayMap[selectedKey] ?? [])].sort(
        (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      )
    : []

  function handleSheetTouchStart(e: React.TouchEvent) {
    sheetTouchStartX.current = e.touches[0].clientX
    sheetTouchStartY.current = e.touches[0].clientY
  }

  function handleSheetTouchEnd(e: React.TouchEvent) {
    if (sheetTouchStartX.current === null || sheetTouchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - sheetTouchStartX.current
    const dy = e.changedTouches[0].clientY - sheetTouchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50 && selectedKey) {
      const currentIdx = matchDays.indexOf(selectedKey)
      if (dx < 0 && currentIdx < matchDays.length - 1) {
        const next = matchDays[currentIdx + 1]
        const [y, mo, d] = next.split('-').map(Number)
        setSelectedDay({ year: y, month: mo - 1, day: d })
      } else if (dx > 0 && currentIdx > 0) {
        const prev = matchDays[currentIdx - 1]
        const [y, mo, d] = prev.split('-').map(Number)
        setSelectedDay({ year: y, month: mo - 1, day: d })
      }
    }
    sheetTouchStartX.current = null
    sheetTouchStartY.current = null
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]">

      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-white tracking-tight">Calendar</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">FIFA World Cup 2026 · June–July 2026</p>
      </div>
      <div className="px-4 pt-2 pb-4 space-y-12">
        {months.map(({ year, month, name }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfWeek(year, month)

          return (
            <div key={name}>
              <h2 className="text-lg font-bold mb-3 text-white">{name}</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const isoKey = dayKeyToIso(year, month, day)
                  const dayMatches = matchDayMap[isoKey] ?? []
                  const statuses = dayMatches.map(m => m.status)
                  const hasLive = statuses.includes('live')
                  const hasFt = statuses.includes('ft')
                  const hasUpcoming = statuses.includes('upcoming')
                  const hasMatches = dayMatches.length > 0
                  const isToday = isoKey === todayKey

                  let cellClass = 'aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all '
                  if (isToday) {
                    cellClass += 'border-2 border-[#00d4ff] '
                  }
                  if (hasMatches) {
                    cellClass += `bg-[#13131a] ${isToday ? '' : 'border border-gray-700 '} hover:border-[#00d4ff] cursor-pointer active:scale-95`
                  } else {
                    cellClass += 'text-gray-600 cursor-default'
                  }

                  return (
                    <button
                      key={day}
                      onClick={() => hasMatches && setSelectedDay({ year, month, day })}
                      className={cellClass}
                    >
                      <span className={hasMatches ? 'text-white' : ''}>{day}</span>
                      {hasMatches && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasLive && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />}
                          {hasFt && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-4 text-xs text-gray-400 pb-2">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Live</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500" /> Upcoming</div>
        </div>
      </div>

      {/* Day sheet */}
      {selectedDay && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedDay(null)}
          />

          <div
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[82vh] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up"
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
          >
            <div className="relative bg-gradient-to-b from-[#0c2540] to-[#13131a] px-5 pt-4 pb-4 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />

              <button
                onClick={() => setSelectedDay(null)}
                className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-white pr-10">
                {selectedKey ? formatDayHeading(selectedKey) : ''}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5 font-medium">
                {selectedMatches.length} {selectedMatches.length === 1 ? 'Match' : 'Matches'} · Tap a game for details
              </p>
            </div>

            <div className="overflow-y-auto bg-[#13131a] px-4 py-3 space-y-3 flex-1" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>
              {selectedMatches.map(m => {
                const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
                const liveData = liveScores[key]
                const isLive = m.status === 'live'
                const isFt = m.status === 'ft'
                const hasScore = isLive || isFt

                return (
                  <button
                    key={m.id}
                    className="w-full text-left bg-[#0a0a0f] rounded-xl border border-gray-800 active:scale-[0.98] transition-transform overflow-hidden"
                    onClick={() => setSelectedMatch(m)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          {m.group ? `Group ${m.group}` : m.round}
                        </span>
                        {isLive && (
                          <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                            🔴 LIVE
                          </span>
                        )}
                        {isFt && (
                          <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                            FINAL
                          </span>
                        )}
                        {m.status === 'upcoming' && (
                          <span className="text-[11px] text-gray-400">{formatMatchTime(m.kickoff, userTimezone)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-9" />
                          <span className="text-xs font-semibold text-white text-center leading-tight">
                            {m.homeTeam.name}
                          </span>
                        </div>

                        <div className="flex flex-col items-center min-w-[64px]">
                          {hasScore ? (
                            <>
                              <span className={`text-2xl font-bold tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                                {m.homeScore} – {m.awayScore}
                              </span>
                              {isLive && liveData?.clock && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[11px] font-bold text-red-400">{liveData.clock}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-medium text-gray-500">vs</span>
                              <span className="text-[11px] text-gray-500 mt-0.5">{formatMatchTime(m.kickoff, userTimezone)}</span>
                            </>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-9" />
                          <span className="text-xs font-semibold text-white text-center leading-tight">
                            {m.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      <p className="text-center text-[11px] text-gray-500 mt-3">
                        📍 {m.venue.name}, {m.venue.city}
                      </p>
                    </div>

                    {/* Live score bar */}
                    {isLive && hasScore && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-red-950/30 border-t border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        {liveData?.clock && <span className="text-[11px] font-bold text-red-400">{liveData.clock}</span>}
                        {liveData?.scorers && liveData.scorers.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-400 truncate">
                            <span>⚽</span>
                            {liveData.scorers.map((s, i) => (
                              <span key={i}>{s.playerName} {s.minute}{i < liveData.scorers.length - 1 ? ',' : ''}</span>
                            ))}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-zinc-600">Tap for details →</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Full match detail — opened from tapping a game card */}
      {selectedMatch && (() => {
        const key = `${normalize(selectedMatch.homeTeam.name)}|${normalize(selectedMatch.awayTeam.name)}`
        const liveData = liveScores[key]
        return (
          <MatchCard
            match={selectedMatch}
            userTimezone={userTimezone}
            homeStats={statsMap[selectedMatch.homeTeam.id]}
            awayStats={statsMap[selectedMatch.awayTeam.id]}
            groupStandings={selectedMatch.group ? standingsMap[selectedMatch.group] : undefined}
            clock={liveData?.clock}
            scorers={liveData?.scorers}
            defaultOpen
            onCloseExternal={() => setSelectedMatch(null)}
          />
        )
      })()}
    </div>
  )
}

