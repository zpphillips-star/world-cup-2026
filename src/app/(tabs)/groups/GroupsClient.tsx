'use client'

import { useState } from 'react'
import type { Standing, Group, BracketRound, BracketSlot } from '@/lib/types'

function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-400 border-b border-gray-700">
          <th className="text-left py-1 w-5">#</th>
          <th className="text-left py-1">Team</th>
          <th className="text-center py-1 w-7">P</th>
          <th className="text-center py-1 w-7">W</th>
          <th className="text-center py-1 w-7">D</th>
          <th className="text-center py-1 w-7">L</th>
          <th className="text-center py-1 w-8">GD</th>
          <th className="text-center py-1 w-7 text-[#00d4ff] font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => (
          <tr key={s.team.id} className={`border-b border-gray-800 ${idx < 2 ? 'text-white' : 'text-gray-400'}`}>
            <td className="py-1.5">{idx + 1}</td>
            <td className="py-1.5 flex items-center gap-1.5">
              <span>{s.team.flag}</span>
              <span className="truncate max-w-[100px]">{s.team.name}</span>
            </td>
            <td className="text-center py-1.5">{s.played}</td>
            <td className="text-center py-1.5">{s.won}</td>
            <td className="text-center py-1.5">{s.drawn}</td>
            <td className="text-center py-1.5">{s.lost}</td>
            <td className="text-center py-1.5">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
            <td className="text-center py-1.5 font-bold text-[#00d4ff]">{s.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GroupAccordion({ groupId, standings, group }: { groupId: string; standings: Standing[]; group: Group }) {
  const [open, setOpen] = useState(false)
  const completedMatches = group.matches.filter(m => m.status === 'ft')

  return (
    <div className="bg-[#13131a] rounded-xl mb-3 border border-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="font-bold text-base">Group {groupId}</span>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-3">
          <StandingsTable standings={standings} />
          {completedMatches.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-400 font-semibold">Results</p>
              {completedMatches.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-lg p-2">
                  <span>{m.homeTeam.flag} {m.homeTeam.name}</span>
                  <span className="font-bold text-white">{m.homeScore} - {m.awayScore}</span>
                  <span>{m.awayTeam.name} {m.awayTeam.flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BracketView({ bracket }: { bracket: BracketRound[] }) {
  return (
    <div className="space-y-6 overflow-x-auto">
      {bracket.map(round => (
        <div key={round.name}>
          <h3 className="text-sm font-bold text-[#00d4ff] mb-2">{round.name}</h3>
          <div className="space-y-2">
            {round.matches.map((slot: BracketSlot) => (
              <div key={slot.id} className="bg-[#13131a] border border-gray-800 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 truncate flex-1">
                    {typeof slot.home === 'string' ? slot.home : `${slot.home.flag} ${slot.home.name}`}
                  </span>
                  <span className="text-gray-500 mx-2 text-[10px]">vs</span>
                  <span className="text-gray-300 truncate flex-1 text-right">
                    {typeof slot.away === 'string' ? slot.away : `${slot.away.flag} ${slot.away.name}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
  bracket: BracketRound[]
}

export default function GroupsClient({ standings, groups, bracket }: GroupsClientProps) {
  const [view, setView] = useState<'groups' | 'bracket'>('groups')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold mb-3">Groups &amp; Bracket</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('groups')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'groups' ? 'bg-[#00d4ff] text-[#0a0a0f]' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setView('bracket')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'bracket' ? 'bg-[#00d4ff] text-[#0a0a0f]' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Bracket
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {view === 'groups' ? (
          <div>
            {Object.entries(standings).map(([groupId, groupStandings]) => {
              const group = groups.find(g => g.id === groupId)!
              return (
                <GroupAccordion key={groupId} groupId={groupId} standings={groupStandings} group={group} />
              )
            })}
          </div>
        ) : (
          <BracketView bracket={bracket} />
        )}
      </div>
    </div>
  )
}
