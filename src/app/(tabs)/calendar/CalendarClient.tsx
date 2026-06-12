'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import type { StandingRow } from '@/app/api/standings/route'
import MatchCard from '@/components/MatchCard'

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
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

function mergeStandings(
  base: Record<string, Standing[]>,
  espn: Record<string, StandingRow[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = { ...base }
  for (const [group, rows] of Object.entries(espn)) {
    const baseGroup = base[group]
    if (!baseGroup) continue
    const seen = new Set<string>()
    const merged = rows
      .filter(row => {
        const key = row.teamName.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(row => {
        const existing = baseGroup.find(s =>
          s.team.name.toLowerCase().includes(row.teamName.toLowerCase()) ||
          row.teamName.toLowerCase().includes(s.team.name.toLowerCase())
        )
        if (!existing) return null
        return {
          team: existing.team,
          played: row.gp, won: row.w, drawn: row.d, lost: row.l,
          goalsFor: row.gf, goalsAgainst: row.ga, goalDiff: row.gd, points: row.pts,
        }
      })
      .filter((s): s is Standing => s !== null)
      .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
    if (merged.length > 0) result[group] = merged
  }
  return result
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
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
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

  const liveMatches = applyLiveScores(matches, liveScores)

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
    if (delta > 0 && idx < sortedMatchDayKeys.length - 1) {
      setSelectedDay(sortedMatchDayKeys[idx + 1])
    } else if (delta < 0 && idx > 0) {
      setSelectedDay(sortedMatchDayKeys[idx - 1])
    }
  }

  const sheetMatches = selectedDay ? (matchDays[selectedDay] ?? []) : []
  const sheetDayIdx = selectedDay ? sortedMatchDayKeys.indexOf(selectedDay) : -1

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
        <div className="fixed inset-0 z-[55]">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            onClick={() => setSelectedDay(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[86vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up bg-[#0f0f18]"
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
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
              {sortedMatchDayKeys.length > 1 && (
                <div className="flex gap-1.5 mt-2">
                  {sortedMatchDayKeys.map((k, i) => (
                    <span
                      key={k}
                      className={[
                        'w-1.5 h-1.5 rounded-full transition-all',
                        i === sheetDayIdx ? 'bg-[#00d4ff]' : 'bg-gray-700',
                      ].join(' ')}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="overflow-y-auto px-4 pt-3" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              {sheetMatches.map(m => {
                const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
                const liveData = liveScores[key]
                return (
                  <MatchCard
                    key={m.id}
                    match={m}
                    userTimezone={userTimezone}
                    homeStats={statsMap[m.homeTeam.id]}
                    awayStats={statsMap[m.awayTeam.id]}
                    groupStandings={m.group ? liveStandingsMap[m.group] : undefined}
                    clock={liveData?.clock}
                    scorers={liveData?.scorers}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

