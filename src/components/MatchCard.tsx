'use client'

import { useState } from 'react'
import type { Match, TeamStats } from '@/lib/types'

function formatTime(kickoff: string, timezone: string): { time: string; tzAbbr: string } {
  try {
    const date = new Date(kickoff)
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    })
    const tzAbbr =
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value ?? ''
    return { time, tzAbbr }
  } catch {
    return { time: '--:--', tzAbbr: '' }
  }
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span className="text-[13px] font-bold text-zinc-100 tabular-nums">{value}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wide leading-none">{label}</span>
    </div>
  )
}

function TeamStatsPanel({ team, stats, align }: {
  team: { name: string; flag: string }
  stats: TeamStats | null
  align: 'left' | 'right'
}) {
  if (!stats) {
    return (
      <div className="flex-1 py-1 flex flex-col items-center gap-1 text-zinc-600 text-xs">
        No data
      </div>
    )
  }
  return (
    <div className={`flex-1 py-2 px-2 flex flex-col gap-2 ${align === 'right' ? 'items-end' : 'items-start'}`}>
      {/* Team name + rank */}
      <div className={`flex items-center gap-1.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="text-base">{team.flag}</span>
        <span className="text-[12px] font-semibold text-zinc-200 leading-tight">{team.name}</span>
      </div>
      <div className={`flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="text-[10px] font-bold bg-[#00d4ff]/10 text-[#00d4ff] px-1.5 py-0.5 rounded">
          #{stats.fifaRank} FIFA
        </span>
        <span className="text-[10px] text-zinc-500">
          {stats.worldCupAppearances} WC app.
        </span>
      </div>
      {/* W/D/L */}
      <div className={`flex gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <StatPill label="W" value={stats.wcWins} />
        <StatPill label="D" value={stats.wcDraws} />
        <StatPill label="L" value={stats.wcLosses} />
        <StatPill label="GF" value={stats.wcGoalsFor} />
        <StatPill label="GA" value={stats.wcGoalsAgainst} />
      </div>
      {/* Best finish */}
      <span className="text-[10px] text-zinc-500 leading-tight">🏆 {stats.bestFinish}</span>
    </div>
  )
}

export default function MatchCard({
  match,
  userTimezone = 'UTC',
  homeStats,
  awayStats,
}: {
  match: Match
  userTimezone?: string
  homeStats?: TeamStats | null
  awayStats?: TeamStats | null
}) {
  const [expanded, setExpanded] = useState(false)
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(match.kickoff, userTimezone)

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      {/* Main match row */}
      <div
        className="flex items-center px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Status / Time column */}
        <div className="w-[72px] flex-shrink-0 flex flex-col items-start justify-center">
          {isLive ? (
            <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase">LIVE</span>
          ) : isFt ? (
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">FINAL</span>
          ) : (
            <>
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 leading-tight">{time}</span>
              {tzAbbr && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">{tzAbbr}</span>
              )}
            </>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex-1 flex items-center min-w-0">
          {/* Home team */}
          <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate text-right">
              {match.homeTeam.name}
            </span>
            <span className="text-lg leading-none flex-shrink-0">{match.homeTeam.flag}</span>
          </div>

          {/* Score / vs */}
          <div className="w-14 flex-shrink-0 text-center">
            {hasScore ? (
              <span className={`text-[15px] font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="text-[13px] font-medium text-zinc-400">vs</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="text-lg leading-none flex-shrink-0">{match.awayTeam.flag}</span>
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div className="ml-2 flex-shrink-0">
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded stats panel */}
      {expanded && (
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 px-3 py-3">
          {/* Venue + group */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {match.group && (
              <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                Group {match.group}
              </span>
            )}
            <span className="text-[11px] text-zinc-400">
              📍 {match.venue.name}, {match.venue.city}
            </span>
          </div>

          {/* Two-column team stats */}
          <div className="flex gap-2 items-start">
            <TeamStatsPanel team={match.homeTeam} stats={homeStats ?? null} align="left" />
            <div className="w-px bg-zinc-200 dark:bg-zinc-800 self-stretch mx-1" />
            <TeamStatsPanel team={match.awayTeam} stats={awayStats ?? null} align="right" />
          </div>
        </div>
      )}
    </div>
  )
}
