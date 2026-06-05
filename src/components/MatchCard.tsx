'use client'

import { useState } from 'react'
import type { Match, TeamStats, Standing } from '@/lib/types'

function formatTime(kickoff: string, timezone: string): { time: string; tzAbbr: string } {
  try {
    const date = new Date(kickoff)
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
    const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? ''
    return { time, tzAbbr }
  } catch {
    return { time: '--:--', tzAbbr: '' }
  }
}

import { FlagImg } from '@/components/FlagImg'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#0d0d15] rounded-xl px-3 py-2.5 min-w-[44px]">
      <span className="text-[18px] font-bold text-white tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">{label}</span>
    </div>
  )
}

function TeamPanel({ team, stats, side }: {
  team: { id: string; name: string; flag: string }
  stats: TeamStats | null
  side: 'home' | 'away'
}) {
  return (
    <div className={`flex-1 flex flex-col gap-3 ${side === 'away' ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
        <FlagImg teamId={team.id} fallback={team.flag} className="h-10 w-auto" />
        <span className="text-[15px] font-bold text-white leading-tight">{team.name}</span>
      </div>
      {!stats ? (
        <span className="text-xs text-zinc-600">No data</span>
      ) : (
        <>
          <div className={`flex flex-wrap gap-1.5 ${side === 'away' ? 'justify-end' : ''}`}>
            <span className="text-[11px] font-bold bg-[#00d4ff]/10 text-[#00d4ff] px-2 py-0.5 rounded-full">
              #{stats.fifaRank} FIFA
            </span>
            <span className="text-[11px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">
              {stats.worldCupAppearances} WC apps
            </span>
          </div>
          <div className={`flex gap-1.5 flex-wrap ${side === 'away' ? 'justify-end' : ''}`}>
            <StatBox label="W" value={stats.wcWins} />
            <StatBox label="D" value={stats.wcDraws} />
            <StatBox label="L" value={stats.wcLosses} />
            <StatBox label="GF" value={stats.wcGoalsFor} />
            <StatBox label="GA" value={stats.wcGoalsAgainst} />
          </div>
          <div className={`flex items-center gap-1 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
            <span className="text-base">🏆</span>
            <span className="text-[12px] text-zinc-300 font-medium">{stats.bestFinish}</span>
          </div>
        </>
      )}
    </div>
  )
}

function GroupTable({ groupId, standings, highlightIds }: {
  groupId: string
  standings: Standing[]
  highlightIds: string[]
}) {
  return (
    <div className="mt-6">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">
        Group {groupId} Standings
      </p>
      <div className="rounded-2xl overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="grid bg-zinc-800/60 px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
          style={{ gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 28px 32px' }}>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GF</span>
          <span className="text-center">GA</span>
          <span className="text-center">Pts</span>
        </div>
        {standings.map((s, i) => {
          const isHighlighted = highlightIds.includes(s.team.id)
          const isTop2 = i < 2
          return (
            <div
              key={s.team.id}
              className={`grid items-center px-3 py-2.5 border-t border-zinc-800/60 text-[13px] transition-colors
                ${isHighlighted
                  ? 'bg-[#00d4ff]/8 border-l-2 border-l-[#00d4ff]'
                  : isTop2
                    ? 'bg-zinc-800/20'
                    : 'bg-[#0f0f18]'
                }`}
              style={{ gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 28px 32px' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-zinc-600 w-3 flex-shrink-0">{i + 1}</span>
                <span className="text-base leading-none flex-shrink-0"><FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4 w-auto" /></span>
                <span className={`truncate font-medium ${isHighlighted ? 'text-white' : isTop2 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                  {s.team.name}
                </span>
                {isTop2 && !isHighlighted && (
                  <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded flex-shrink-0">ADV</span>
                )}
              </div>
              <span className="text-center text-zinc-400 tabular-nums">{s.played}</span>
              <span className="text-center text-zinc-300 tabular-nums">{s.won}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.drawn}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.lost}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.goalsFor}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.goalsAgainst}</span>
              <span className={`text-center font-bold tabular-nums ${isHighlighted ? 'text-[#00d4ff]' : isTop2 ? 'text-white' : 'text-zinc-400'}`}>
                {s.points}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2 text-center">Top 2 advance · ADV = advancing position</p>
    </div>
  )
}

export default function MatchCard({
  match,
  userTimezone = 'UTC',
  homeStats,
  awayStats,
  groupStandings,
}: {
  match: Match
  userTimezone?: string
  homeStats?: TeamStats | null
  awayStats?: TeamStats | null
  groupStandings?: Standing[]
}) {
  const [open, setOpen] = useState(false)
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(match.kickoff, userTimezone)

  return (
    <>
      {/* Match row */}
      <div
        className="flex items-center px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer select-none"
        onClick={() => setOpen(true)}
      >
        <div className="w-[72px] flex-shrink-0 flex flex-col items-start justify-center">
          {isLive ? (
            <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase">LIVE</span>
          ) : isFt ? (
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">FINAL</span>
          ) : (
            <>
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 leading-tight">{time}</span>
              {tzAbbr && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">{tzAbbr}</span>}
            </>
          )}
        </div>

        <div className="flex-1 flex items-center min-w-0">
          <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate text-right">{match.homeTeam.name}</span>
            <span className="text-lg leading-none flex-shrink-0"><FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className="h-5 w-auto" /></span>
          </div>
          <div className="w-14 flex-shrink-0 text-center">
            {hasScore ? (
              <span className={`text-[15px] font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="text-[13px] font-medium text-zinc-400">vs</span>
            )}
          </div>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="text-lg leading-none flex-shrink-0"><FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className="h-5 w-auto" /></span>
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">{match.awayTeam.name}</span>
          </div>
        </div>

        <div className="ml-2 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Slide-up sheet */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />

          <div
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-b from-[#0a1628] to-[#13131a] px-5 pt-4 pb-5 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >✕</button>

              <div className="flex items-center gap-2 mb-2">
                {match.group && (
                  <span className="text-[11px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Group {match.group}
                  </span>
                )}
                {isLive && <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                {isFt && <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">FINAL</span>}
                {match.status === 'upcoming' && (
                  <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">{time} {tzAbbr}</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className="h-10 w-auto" />
                  <span className="text-[13px] font-semibold text-white text-center leading-tight">{match.homeTeam.name}</span>
                </div>
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  {hasScore ? (
                    <span className={`text-4xl font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                      {match.homeScore} – {match.awayScore}
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-zinc-500">vs</span>
                      <span className="text-[10px] text-zinc-600 text-center leading-tight">{time}<br />{tzAbbr}</span>
                    </>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className="h-10 w-auto" />
                  <span className="text-[13px] font-semibold text-white text-center leading-tight">{match.awayTeam.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <span className="text-sm">📍</span>
                <span className="text-[12px] text-zinc-400">{match.venue.name}, {match.venue.city}</span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto bg-[#0f0f18] px-4 pt-5 flex-1" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
              {/* Team stats */}
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Team Stats</p>
              <div className="flex gap-4 items-start">
                <TeamPanel team={match.homeTeam} stats={homeStats ?? null} side="home" />
                <div className="w-px bg-zinc-800 self-stretch" />
                <TeamPanel team={match.awayTeam} stats={awayStats ?? null} side="away" />
              </div>

              {/* Group standings */}
              {match.group && groupStandings && groupStandings.length > 0 && (
                <GroupTable
                  groupId={match.group}
                  standings={groupStandings}
                  highlightIds={[match.homeTeam.id, match.awayTeam.id]}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
