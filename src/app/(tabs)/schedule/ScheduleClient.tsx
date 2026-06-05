'use client'

import { useState, useEffect, useMemo } from 'react'
import MatchCard from '@/components/MatchCard'
import type { Match } from '@/lib/types'

// Hardcoded demo "today" as specified
const TODAY = '2026-06-13'

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

export default function ScheduleClient({ matches }: { matches: Match[] }) {
  const [userTimezone, setUserTimezone] = useState('UTC')

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [matches]
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

  return (
    <div className="pb-10 px-3 sm:px-4 max-w-2xl mx-auto">
      {byDate.map(([isoDate, dayMatches]) => {
        const isToday = isoDate === TODAY
        return (
          <div key={isoDate} className="mt-8 first:mt-4">
            {/* Date header */}
            <div className={`flex items-center gap-2 px-1 mb-3`}>
              <span className={`text-sm font-semibold tracking-wide
                ${isToday ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                {formatDateHeader(isoDate, userTimezone)}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>

            {/* Match cards */}
            <div className="flex flex-col gap-2">
              {dayMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  userTimezone={userTimezone}
                  isToday={isToday}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

