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
    <div className="pb-10 max-w-2xl mx-auto">
      {byDate.map(([isoDate, dayMatches]) => {
        const isToday = isoDate === TODAY
        return (
          <div key={isoDate}>
            {/* Date header */}
            <div className="px-4 pt-5 pb-2 border-b-2 border-zinc-200 dark:border-zinc-700">
              <span className={`text-sm tracking-wide
                ${isToday
                  ? 'font-bold text-zinc-700 dark:text-zinc-200'
                  : 'font-normal text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {formatDateHeader(isoDate, userTimezone)}
              </span>
            </div>

            {/* Match rows */}
            <div>
              {dayMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  userTimezone={userTimezone}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

