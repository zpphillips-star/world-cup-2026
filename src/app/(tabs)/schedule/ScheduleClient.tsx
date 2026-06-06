'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import MatchCard from '@/components/MatchCard'
import type { Match, TeamStats, Standing } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

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

function applyLiveScores(matches: Match[], scores: Record<string, ScoreUpdate>): Match[] {
  if (Object.keys(scores).length === 0) return matches
  return matches.map(m => {
    const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
    const update = scores[key]
    if (!update) return m
    return {
      ...m,
      homeScore: update.homeScore,
      awayScore: update.awayScore,
      status: update.status,
    }
  })
}export default function ScheduleClient({
  matches,
  statsMap = {},
  standingsMap = {},
}: {
  matches: Match[]
  statsMap?: Record<string, TeamStats | null>
  standingsMap?: Record<string, Standing[]>
}) {
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
      setLastUpdated(Date.now())
    } catch {
      // fail silently — static data still shows
    }
  }, [])

  useEffect(() => {
    fetchScores()

    // Check every 30s if any game is live; if so, bump to 2s polling
    let interval = setInterval(fetchScores, 30_000)

    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScores).some(s => s.status === 'live')
      const newRate = hasLive ? 2_000 : 30_000
      clearInterval(interval)
      interval = setInterval(fetchScores, newRate)
    }, 5_000)

    return () => {
      clearInterval(interval)
      clearInterval(adaptivePoller)
    }
  }, [fetchScores, liveScores])

  const liveMatches = useMemo(() => applyLiveScores(matches, liveScores), [matches, liveScores])

  const hasAnyLive = useMemo(
    () => Object.values(liveScores).some(s => s.status === 'live'),
    [liveScores]
  )

  const sortedMatches = useMemo(
    () => [...liveMatches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [liveMatches]
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

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date())

  return (
    <div className="pb-16 max-w-2xl mx-auto">
      {/* Live indicator */}
      {hasAnyLive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Live now — updating every 2s</span>
        </div>
      )}

      {byDate.map(([isoDate, dayMatches]) => {
        const isToday = isoDate === today
        return (
          <div key={isoDate}>
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

            <div>
              {dayMatches.map((match) => {
                const key = `${normalize(match.homeTeam.name)}|${normalize(match.awayTeam.name)}`
                const liveData = liveScores[key]
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userTimezone={userTimezone}
                    homeStats={statsMap[match.homeTeam.id]}
                    awayStats={statsMap[match.awayTeam.id]}
                    groupStandings={match.group ? standingsMap[match.group] : undefined}
                    clock={liveData?.clock}
                    scorers={liveData?.scorers}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Last updated timestamp — subtle, bottom of list */}
      {lastUpdated && (
        <p className="text-center text-[10px] text-zinc-600 py-4">
          Scores updated {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
