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
    <div className="pb-8">
      {byDate.map(([isoDate, dayMatches]) => {
        const isToday = isoDate === TODAY
        return (
          <div key={isoDate} className="mt-4 first:mt-0">
            {/* Date header */}
            <h2 className={`sticky top-[70px] z-10 px-4 py-2 border-b flex items-center gap-2
              ${isToday
                ? 'bg-[#0a1a12] border-green-900/60 dark:bg-[#0a1a12]'
                : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <span className={`text-sm font-semibold tracking-wide
                ${isToday ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                {formatDateHeader(isoDate, userTimezone)}
              </span>
              {isToday && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white uppercase tracking-wider">
                  Today
                </span>
              )}
            </h2>

            {/* Match rows */}
            <div className={`rounded-b overflow-hidden border border-t-0 mx-0
              ${isToday
                ? 'border-green-900/40'
                : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {dayMatches.map((match) => (
                <div
                  key={match.id}
                  className={isToday ? 'border-l-[3px] border-green-500/70' : ''}
                >
                  <MatchCard match={match} userTimezone={userTimezone} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

