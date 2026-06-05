'use client'

import { useState, useEffect, useMemo } from 'react'
import MatchCard from '@/components/MatchCard'
import type { Match } from '@/lib/types'

function getLocalDateKey(kickoff: string, timezone: string): string {
  // Returns YYYY-MM-DD in the given timezone (en-CA locale gives ISO date format)
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(kickoff))
}

function formatDateHeader(isoDate: string, timezone: string): string {
  // Parse as local date (noon to avoid any DST edge-cases shifting the day)
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
      {byDate.map(([isoDate, dayMatches]) => (
        <div key={isoDate} className="mt-4 first:mt-0">
          <h2 className="sticky top-[70px] z-10 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 text-sm font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 tracking-wide">
            {formatDateHeader(isoDate, userTimezone)}
          </h2>
          <div className="rounded-b overflow-hidden border border-t-0 border-zinc-200 dark:border-zinc-800 mx-0">
            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} userTimezone={userTimezone} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
