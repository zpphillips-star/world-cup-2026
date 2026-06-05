'use client'

import { useState } from 'react'
import type { Match } from '@/lib/types'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDayHeading(year: number, month: number, day: number): string {
  const d = new Date(year, month, day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatMatchTime(kickoff: string): string {
  try {
    const d = new Date(kickoff)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return '--:--'
  }
}

interface DayKey { year: number; month: number; day: number }

export default function CalendarClient({ matches }: { matches: Match[] }) {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null)

  // Build map: "year-month-day" (UTC) → Match[]
  const matchDayMap: Record<string, Match[]> = {}
  for (const m of matches) {
    const d = new Date(m.kickoff)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    if (!matchDayMap[key]) matchDayMap[key] = []
    matchDayMap[key].push(m)
  }

  const months = [
    { year: 2026, month: 5, name: 'June 2026' },
    { year: 2026, month: 6, name: 'July 2026' },
  ]

  const selectedKey = selectedDay
    ? `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`
    : null
  const selectedMatches = selectedKey ? (matchDayMap[selectedKey] ?? []) : []

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Calendar</h1>
      </div>

      <div className="px-4 py-4 space-y-8">
        {months.map(({ year, month, name }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfWeek(year, month)

          return (
            <div key={name}>
              <h2 className="text-lg font-bold mb-3 text-[#00d4ff]">{name}</h2>
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
                  const key = `${year}-${month}-${day}`
                  const dayMatches = matchDayMap[key] ?? []
                  const statuses = dayMatches.map(m => m.status)
                  const hasLive = statuses.includes('live')
                  const hasFt = statuses.includes('ft')
                  const hasUpcoming = statuses.includes('upcoming')
                  const hasMatches = dayMatches.length > 0

                  return (
                    <button
                      key={day}
                      onClick={() => hasMatches && setSelectedDay({ year, month, day })}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${hasMatches
                          ? 'bg-[#13131a] border border-gray-700 hover:border-[#00d4ff] cursor-pointer active:scale-95'
                          : 'text-gray-600 cursor-default'
                        }`}
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

      {/* ── Bottom sheet overlay ── */}
      {selectedDay && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedDay(null)}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[82vh] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up"
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-b from-[#0c2540] to-[#13131a] px-5 pt-4 pb-4 flex-shrink-0">
              {/* drag handle */}
              <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />

              <button
                onClick={() => setSelectedDay(null)}
                className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-white pr-10">
                {formatDayHeading(selectedDay.year, selectedDay.month, selectedDay.day)}
              </h2>
              <p className="text-sm text-[#00d4ff] mt-0.5 font-medium">
                {selectedMatches.length} {selectedMatches.length === 1 ? 'Match' : 'Matches'}
              </p>
            </div>

            {/* Scrollable match cards */}
            <div className="overflow-y-auto bg-[#13131a] px-4 py-3 space-y-3 flex-1">
              {selectedMatches.map(m => {
                const isLive = m.status === 'live'
                const isFt = m.status === 'ft'
                const hasScore = isLive || isFt

                return (
                  <div key={m.id} className="bg-[#0a0a0f] rounded-xl p-4 border border-gray-800">
                    {/* Header row: group label + status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-[#00d4ff] uppercase tracking-wider">
                        {m.group ? `Group ${m.group}` : m.round}
                      </span>
                      {isLive && (
                        <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                          ● LIVE
                        </span>
                      )}
                      {isFt && (
                        <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                          FINAL
                        </span>
                      )}
                      {m.status === 'upcoming' && (
                        <span className="text-[11px] text-gray-400">{formatMatchTime(m.kickoff)}</span>
                      )}
                    </div>

                    {/* Teams + score */}
                    <div className="flex items-center gap-3">
                      {/* Home team */}
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-4xl leading-none">{m.homeTeam.flag}</span>
                        <span className="text-xs font-semibold text-white text-center leading-tight">
                          {m.homeTeam.name}
                        </span>
                      </div>

                      {/* Score / vs */}
                      <div className="flex flex-col items-center min-w-[64px]">
                        {hasScore ? (
                          <span className={`text-2xl font-bold tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                            {m.homeScore} – {m.awayScore}
                          </span>
                        ) : (
                          <>
                            <span className="text-lg font-medium text-gray-500">vs</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">{formatMatchTime(m.kickoff)}</span>
                          </>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-4xl leading-none">{m.awayTeam.flag}</span>
                        <span className="text-xs font-semibold text-white text-center leading-tight">
                          {m.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Venue */}
                    <p className="text-center text-[11px] text-gray-500 mt-3">
                      📍 {m.venue.name}, {m.venue.city}
                    </p>
                  </div>
                )
              })}
              {/* Bottom safe-area spacer */}
              <div className="h-6" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
