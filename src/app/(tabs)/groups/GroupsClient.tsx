'use client'

import { useState } from 'react'
import type { Standing, Group } from '@/lib/types'

// ── Standings table (used inside the sheet) ────────────────────────────────

function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-500 border-b border-gray-700 text-[11px] uppercase tracking-wider">
          <th className="text-left py-1.5 w-5">#</th>
          <th className="text-left py-1.5">Team</th>
          <th className="text-center py-1.5 w-7">P</th>
          <th className="text-center py-1.5 w-7">W</th>
          <th className="text-center py-1.5 w-7">D</th>
          <th className="text-center py-1.5 w-7">L</th>
          <th className="text-center py-1.5 w-8">GD</th>
          <th className="text-center py-1.5 w-8 text-[#00d4ff] font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => {
          const advances = idx < 2
          return (
            <tr key={s.team.id} className={`border-b border-gray-800/60 last:border-b-0 ${advances ? 'bg-green-950/20' : ''}`}>
              <td className="py-2 relative">
                {advances && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-r" />}
                <span className={`pl-1.5 ${advances ? 'text-green-400' : 'text-gray-500'}`}>{idx + 1}</span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{s.team.flag}</span>
                  <span className={`font-medium truncate max-w-[100px] ${advances ? 'text-white' : 'text-gray-300'}`}>
                    {s.team.name}
                  </span>
                </div>
              </td>
              <td className="text-center py-2 text-gray-300">{s.played}</td>
              <td className="text-center py-2 text-gray-300">{s.won}</td>
              <td className="text-center py-2 text-gray-300">{s.drawn}</td>
              <td className="text-center py-2 text-gray-300">{s.lost}</td>
              <td className="text-center py-2 text-gray-400">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
              <td className="text-center py-2 font-bold text-[#00d4ff]">{s.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Group button card (2-col grid item) ────────────────────────────────────

function GroupCard({
  groupId,
  standings,
  onOpen,
}: {
  groupId: string
  standings: Standing[]
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="relative flex flex-col items-start p-4 rounded-2xl border border-white/20 bg-[#13131a] active:scale-95 transition-transform overflow-hidden text-left hover:border-white/40 w-full h-full"
    >
      {/* Group label + thick white underline */}
      <div className="w-full mb-3 text-center">
        <span className="text-sm font-bold tracking-wide text-white leading-none">
          Group {groupId}
        </span>
        <div className="mt-1.5 h-[2px] w-full bg-white/70 rounded-full" />
      </div>

      {/* 2×2 flag + name grid */}
      <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 w-full mb-4 flex-1">
        {standings.map((s, idx) => (
          <div key={s.team.id} className="flex items-center gap-2 min-w-0">
            <span className="text-2xl leading-none flex-shrink-0">{s.team.flag}</span>
            <span className={`text-xs font-medium truncate ${idx < 2 ? 'text-white' : 'text-gray-400'}`}>
              {s.team.name}
            </span>
          </div>
        ))}
      </div>

      {/* "Top 2 advance" micro-label */}
      <div className="flex items-center gap-1 mt-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-[10px] text-green-400">Top 2 advance</span>
      </div>
    </button>
  )
}

// ── Bottom sheet ───────────────────────────────────────────────────────────

function GroupSheet({
  groupId,
  standings,
  group,
  onClose,
}: {
  groupId: string
  standings: Standing[]
  group: Group
  onClose: () => void
}) {
  const completedMatches = group.matches.filter(m => m.status === 'ft')
  const upcomingMatches = group.matches.filter(m => m.status === 'upcoming' || m.status === 'live')

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] max-h-[86vh] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative px-5 pt-4 pb-4 flex-shrink-0 bg-[#13131a] border-b border-white/10">
          <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />
          <button
            onClick={onClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ✕
          </button>

          {/* Title — matches schedule/calendar style */}
          <h2 className="text-xl font-bold text-white">Group {groupId}</h2>

          {/* All 4 flags large */}
          <div className="flex gap-4 mt-3">
            {standings.map((s, idx) => (
              <div key={s.team.id} className="flex flex-col items-center gap-0.5">
                <span className="text-3xl leading-none">{s.team.flag}</span>
                <span className={`text-[10px] font-medium ${idx < 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  {s.team.name.length > 6 ? s.team.name.slice(0, 6) + '…' : s.team.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto bg-[#13131a] flex-1 px-4 py-3 space-y-5"
          style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
        >
          {/* Standings */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-sm bg-green-500" />
              <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Top 2 advance to Round of 32</span>
            </div>
            <StandingsTable standings={standings} />
          </div>

          {/* Completed results */}
          {completedMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Results</p>
              <div className="space-y-2">
                {completedMatches.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60">
                    <span className="flex items-center gap-1.5 flex-1">
                      <span>{m.homeTeam.flag}</span>
                      <span className="text-gray-200 font-medium">{m.homeTeam.name}</span>
                    </span>
                    <span className="font-bold text-white tabular-nums px-3 text-sm">
                      {m.homeScore} – {m.awayScore}
                    </span>
                    <span className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className="text-gray-200 font-medium text-right">{m.awayTeam.name}</span>
                      <span>{m.awayTeam.flag}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming matches */}
          {upcomingMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Upcoming</p>
              <div className="space-y-2">
                {upcomingMatches.map(m => {
                  const time = new Date(m.kickoff).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
                  })
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60">
                      <span className="flex items-center gap-1.5 flex-1">
                        <span>{m.homeTeam.flag}</span>
                        <span className="text-gray-300">{m.homeTeam.name}</span>
                      </span>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-gray-500 font-medium">vs</span>
                        <span className="text-[10px] text-gray-600 text-center">{time}</span>
                      </div>
                      <span className="flex items-center gap-1.5 flex-1 justify-end">
                        <span className="text-gray-300 text-right">{m.awayTeam.name}</span>
                        <span>{m.awayTeam.flag}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
}

export default function GroupsClient({ standings, groups }: GroupsClientProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const activeStandings = activeGroup ? standings[activeGroup] : null
  const activeGroupData = activeGroup ? groups.find(g => g.id === activeGroup) : null

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Groups</h1>
      </div>

      {/* 2-column grid — fills full screen */}
      <div
        className="px-3 py-4 grid grid-cols-2 gap-3"
        style={{
          paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
          minHeight: 'calc(100dvh - 3.5rem - env(safe-area-inset-top))',
          gridAutoRows: '1fr',
        }}
      >
        {Object.entries(standings).map(([groupId, groupStandings]) => (
          <GroupCard
            key={groupId}
            groupId={groupId}
            standings={groupStandings}
            onOpen={() => setActiveGroup(groupId)}
          />
        ))}
      </div>

      {/* Bottom sheet */}
      {activeGroup && activeStandings && activeGroupData && (
        <GroupSheet
          groupId={activeGroup}
          standings={activeStandings}
          group={activeGroupData}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </div>
  )
}
