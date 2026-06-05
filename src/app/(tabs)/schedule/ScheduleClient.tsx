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
      {byDate.map(([isoDate, dayMatches], index) => (
        <div key={isoDate} className={index > 0 ? 'mt-10' : ''}>
          <h2 className="sticky top-[70px] z-10 px-4 py-2 bg-gray-50 dark:bg-zinc-800 text-base font-semibold text-zinc-400 dark:text-zinc-300 border-b-2 border-zinc-300 dark:border-zinc-600">
            {formatDateHeader(isoDate, userTimezone)}
          </h2>
          <div className="px-4 pt-2">
            {dayMatches.map((match, i) => (
              <div key={match.id} className={i < dayMatches.length - 1 ? 'border-b border-white/5' : ''}>
                <MatchCard match={match} userTimezone={userTimezone} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
