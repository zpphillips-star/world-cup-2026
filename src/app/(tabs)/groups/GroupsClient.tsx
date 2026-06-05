'use client'

import { useState } from 'react'
import type { Standing, Group } from '@/lib/types'

// ── Standings table ────────────────────────────────────────────────────────

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
          {/* GF/GA/GD hidden on small screens */}
          <th className="hidden sm:table-cell text-center py-1.5 w-8">GF</th>
          <th className="hidden sm:table-cell text-center py-1.5 w-8">GA</th>
          <th className="text-center py-1.5 w-8">GD</th>
          <th className="text-center py-1.5 w-8 text-[#00d4ff] font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => {
          const advances = idx < 2
          return (
            <tr
              key={s.team.id}
              className={`border-b border-gray-800/60 last:border-b-0 transition-colors
                ${advances ? 'bg-green-950/20' : ''}
              `}
            >
              {/* Advance indicator left-border via inset box-shadow trick */}
              <td className="py-2 relative">
                {advances && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-r" />
                )}
                <span className={`pl-1.5 ${advances ? 'text-green-400' : 'text-gray-500'}`}>
                  {idx + 1}
                </span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{s.team.flag}</span>
                  <span className={`truncate max-w-[90px] font-medium ${advances ? 'text-white' : 'text-gray-300'}`}>
                    {s.team.name}
                  </span>
                </div>
              </td>
              <td className="text-center py-2 text-gray-300">{s.played}</td>
              <td className="text-center py-2 text-gray-300">{s.won}</td>
              <td className="text-center py-2 text-gray-300">{s.drawn}</td>
              <td className="text-center py-2 text-gray-300">{s.lost}</td>
              <td className="hidden sm:table-cell text-center py-2 text-gray-400">{s.goalsFor}</td>
              <td className="hidden sm:table-cell text-center py-2 text-gray-400">{s.goalsAgainst}</td>
              <td className="text-center py-2 text-gray-400">
                {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
              </td>
              <td className="text-center py-2 font-bold text-[#00d4ff]">{s.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Group accordion ────────────────────────────────────────────────────────

const GROUP_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#22c55e',
  E: '#14b8a6', F: '#3b82f6', G: '#8b5cf6', H: '#ec4899',
  I: '#f43f5e', J: '#06b6d4', K: '#84cc16', L: '#a855f7',
}

function GroupAccordion({ groupId, standings, group }: { groupId: string; standings: Standing[]; group: Group }) {
  const [open, setOpen] = useState(false)
  const completedMatches = group.matches.filter(m => m.status === 'ft')
  const accent = GROUP_COLORS[groupId] ?? '#00d4ff'

  return (
    <div
      className="mb-3 rounded-xl border border-gray-800 overflow-hidden"
      style={{ background: '#13131a' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Colored pill badge */}
          <span
            className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
          >
            GROUP {groupId}
          </span>
          {/* Top 2 team flags preview */}
          <div className="flex gap-0.5 text-base">
            {standings.slice(0, 2).map(s => (
              <span key={s.team.id}>{s.team.flag}</span>
            ))}
          </div>
        </div>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-800">
          {/* Advance indicator legend */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-green-500" />
            <span className="text-[10px] text-green-400 font-medium">Top 2 advance</span>
          </div>
          <div className="px-4 pb-4">
            <StandingsTable standings={standings} />
          </div>

          {completedMatches.length > 0 && (
            <div className="px-4 pb-4 border-t border-gray-800/60 pt-3 space-y-2">
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Results</p>
              {completedMatches.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span>{m.homeTeam.flag}</span>
                    <span className="text-gray-300">{m.homeTeam.name}</span>
                  </span>
                  <span className="font-bold text-white tabular-nums px-2">
                    {m.homeScore} – {m.awayScore}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-300 text-right">{m.awayTeam.name}</span>
                    <span>{m.awayTeam.flag}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
}

export default function GroupsClient({ standings, groups }: GroupsClientProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Groups</h1>
      </div>

      <div className="px-4 py-4">
        {Object.entries(standings).map(([groupId, groupStandings]) => {
          const group = groups.find(g => g.id === groupId)!
          return (
            <GroupAccordion key={groupId} groupId={groupId} standings={groupStandings} group={group} />
          )
        })}
      </div>
    </div>
  )
}

