'use client'

import { FlagImg } from '@/components/FlagImg'
import { TeamSheet } from '@/components/TeamSheet'
import PageHeader from '@/components/PageHeader'

import { useState, useEffect, useMemo } from 'react'
import type { Match, Team } from '@/lib/types'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

// Returns "YYYY-MM-DD" in the given timezone
function getLocalDateKey(kickoff: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(kickoff))
}

// Converts a DayKey {year, month(0-indexed), day} → "YYYY-MM-DD"
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

interface DayKey { year: number; month: number; day: number }

export default function CalendarClient({ matches }: { matches: Match[] }) {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null)
  const [teamSheet, setTeamSheet] = useState<Team | null>(null)
  const [userTimezone, setUserTimezone] = useState('UTC')

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  // Build map: "YYYY-MM-DD" (local tz) -> Match[]
  const matchDayMap = useMemo(() => {
    const map: Record<string, Match[]> = {}
    for (const m of matches) {
      const key = getLocalDateKey(m.kickoff, userTimezone)
      if (!map[key]) map[key] = []
      map[key].push(m)
    }
    return map
  }, [matches, userTimezone])

  const months = [
    { year: 2026, month: 5, name: 'June 2026' },
    { year: 2026, month: 6, name: 'July 2026' },
  ]

  const selectedKey = selectedDay
    ? dayKeyToIso(selectedDay.year, selectedDay.month, selectedDay.day)
    : null
  const selectedMatches = selectedKey
    ? [...(matchDayMap[selectedKey] ?? [])].sort(
        (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      )
    : []

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <PageHeader subtitle="FIFA World Cup 2026 · June–July 2026" />
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

      {/* Day sheet — hidden while team sheet is open */}
      {selectedDay && !teamSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedDay(null)}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[82vh] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up"
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
                {selectedKey ? formatDayHeading(selectedKey) : ''}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5 font-medium">
                {selectedMatches.length} {selectedMatches.length === 1 ? 'Match' : 'Matches'}
              </p>
            </div>

            {/* Scrollable match cards */}
            <div className="overflow-y-auto bg-[#13131a] px-4 py-3 space-y-3 flex-1" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>
              {selectedMatches.map(m => {
                const isLive = m.status === 'live'
                const isFt = m.status === 'ft'
                const hasScore = isLive || isFt

                return (
                  <div key={m.id} className="bg-[#0a0a0f] rounded-xl p-4 border border-gray-800">
                    {/* Header row: group label + status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
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
                        <span className="text-[11px] text-gray-400">{formatMatchTime(m.kickoff, userTimezone)}</span>
                      )}
                    </div>

                    {/* Teams + score */}
                    <div className="flex items-center gap-3">
                      {/* Home team */}
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <button
                          className="active:scale-90 transition-transform"
                          onClick={() => setTeamSheet(m.homeTeam)}
                        >
                          <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-9" />
                        </button>
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
                            <span className="text-[11px] text-gray-500 mt-0.5">{formatMatchTime(m.kickoff, userTimezone)}</span>
                          </>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <button
                          className="active:scale-90 transition-transform"
                          onClick={() => setTeamSheet(m.awayTeam)}
                        >
                          <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-9" />
                        </button>
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
            </div>
          </div>
        </>
      )}

      {/* Team sheet — closes back to day sheet */}
      {teamSheet && (
        <TeamSheet team={teamSheet} onClose={() => setTeamSheet(null)} />
      )}
    </div>
  )
}
