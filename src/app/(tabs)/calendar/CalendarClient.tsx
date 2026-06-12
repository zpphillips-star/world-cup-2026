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

// ESPN uses different names for some teams — map them to our schedule names
const ESPN_NAME_ALIASES: Record<string, string> = {
  'czechia': 'czech republic',
  'korea republic': 'south korea',
  'republic of ireland': 'ireland',
  'usa': 'united states',
  'united states of america': 'united states',
}
function normalizeTeamName(name: string): string {
  const lower = name.toLowerCase()
  return ESPN_NAME_ALIASES[lower] ?? lower
}

function mergeStandings(
  base: Record<string, Standing[]>,
  espn: Record<string, StandingRow[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = { ...base }
  for (const [group, rows] of Object.entries(espn)) {
    const baseGroup = base[group]
    if (!baseGroup) continue
    const merged: Standing[] = []
    for (const row of rows) {
      const normalized = normalizeTeamName(row.teamName)
      const existing = baseGroup.find(s => {
        const sn = s.team.name.toLowerCase()
        return sn === normalized || sn.includes(normalized) || normalized.includes(sn)
      })
      if (!existing) continue // skip unmatched — don't fall back to wrong team
      merged.push({
        team: existing.team,
        played: row.gp, won: row.w, drawn: row.d, lost: row.l,
        goalsFor: row.gf, goalsAgainst: row.ga, goalDiff: row.gd, points: row.pts,
      })
    }
    // only replace if we matched all 4 teams; otherwise keep base to avoid partial table
    if (merged.length === baseGroup.length) result[group] = merged
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
  const defaultMonthIdx = now.getMonth() === 6 ? 1 : 0
  const [monthIdx, setMonthIdx] = useState(defaultMonthIdx)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
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

  // Build match days index: key = "year-utcMonth-utcDate"
  const matchDays: Record<string, Match[]> = {}
  for (const m of liveMatches) {
    const d = new Date(m.kickoff)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    if (!matchDays[key]) matchDays[key] = []
    matchDays[key].push(m)
  }

  // Sorted match day keys for sheet prev/next navigation
  const sortedMatchDayKeys = Object.keys(matchDays).sort((a, b) => {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    return new Date(ay, am, ad).getTime() - new Date(by, bm, bd).getTime()
  })

  // ── Calendar month swipe ─────────────────────────────────────────────────
  const calTouchStartX = useRef<number | null>(null)

  function handleCalTouchStart(e: React.TouchEvent) {
    calTouchStartX.current = e.touches[0].clientX
  }

  function handleCalTouchEnd(e: React.TouchEvent) {
    if (calTouchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - calTouchStartX.current
    calTouchStartX.current = null
    if (Math.abs(delta) < 50) return
    if (delta > 0) {
      // finger moves right → previous month (past)
      setMonthIdx(i => Math.max(0, i - 1))
    } else {
      // finger moves left → next month (future)
      setMonthIdx(i => Math.min(MONTHS.length - 1, i + 1))
    }
  }

  // ── Day sheet swipe ──────────────────────────────────────────────────────
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
      // finger moves right → next match day
      setSelectedDay(sortedMatchDayKeys[idx + 1])
    } else if (delta < 0 && idx > 0) {
      // finger moves left → previous match day
      setSelectedDay(sortedMatchDayKeys[idx - 1])
    }
  }

  const { year, month, name } = MONTHS[monthIdx]
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const sheetMatches = selectedDay ? (matchDays[selectedDay] ?? []) : []
  const sheetDayIdx = selectedDay ? sortedMatchDayKeys.indexOf(selectedDay) : -1

  return (
    <>
      {/* ── Calendar ─────────────────────────────────────────────────────── */}
      <div
        className="min-h-screen bg-[#0a0a0f] select-none"
        onTouchStart={handleCalTouchStart}
        onTouchEnd={handleCalTouchEnd}
      >
        <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
          <h1 className="text-xl font-bold text-center">{name}</h1>
        </div>

        <div className="px-4 py-4">
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
                    isToday ? 'ring-1 ring-[#00d4ff]/60' : '',
                  ].join(' ')}
                >
                  <span className={isToday ? 'text-[#00d4ff]' : ''}>{day}</span>
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

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-6">
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
      </div>

      {/* ── Day sheet ────────────────────────────────────────────────────── */}
      {selectedDay && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedDay(null)}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#0f0f18] rounded-t-2xl max-h-[75vh] flex flex-col"
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
          >
            {/* Sheet header */}
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
              {/* Dot indicators for which match day we're on */}
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

            {/* Matches */}
            <div className="overflow-y-auto px-4 pt-3 pb-20">
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

      {/* Full-detail popup when tapping a match */}
      {selectedMatch && (() => {
        const key = `${normalize(selectedMatch.homeTeam.name)}|${normalize(selectedMatch.awayTeam.name)}`
        const liveData = liveScores[key]
        return (
          <MatchCard
            match={selectedMatch}
            userTimezone={userTimezone}
            homeStats={statsMap[selectedMatch.homeTeam.id]}
            awayStats={statsMap[selectedMatch.awayTeam.id]}
            groupStandings={selectedMatch.group ? liveStandingsMap[selectedMatch.group] : undefined}
            clock={liveData?.clock}
            scorers={liveData?.scorers}
            defaultOpen
            onCloseExternal={() => setSelectedMatch(null)}
          />
        )
      })()}
    </>
  )
}
