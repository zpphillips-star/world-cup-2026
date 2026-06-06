'use client'

import { useState, useEffect } from 'react'
import type { Standing, Group, Team } from '@/lib/types'
import { FlagImg } from '@/components/FlagImg'
import { TeamSheet } from '@/components/TeamSheet'

// -- Standings table --------------------------------------------------------

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
                  <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4" />
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

// -- Group button card ------------------------------------------------------

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
      className="w-full text-left active:scale-[0.97] transition-transform"
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, #1a1a24 0%, #111118 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}
      >
        {/* Watermark group letter */}
        <span
          className="absolute right-2 bottom-[-4px] font-black text-[56px] leading-none select-none pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.04)' }}
        >
          {groupId}
        </span>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Group</span>
            <span className="text-[17px] font-bold text-white leading-none ml-1">{groupId}</span>
          </div>
          <span className="text-zinc-700 text-xs">›</span>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.04] mb-2.5" />

        {/* Teams */}
        <div className="px-4 pb-4 space-y-3">
          {standings.map((s) => (
            <div key={s.team.id} className="flex items-center gap-2.5">
              <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4 flex-shrink-0 rounded-[1px]" />
              <span className="text-[12.5px] font-medium text-zinc-200 leading-tight truncate">
                {s.team.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}

// -- Group bottom sheet -----------------------------------------------------

function GroupSheet({
  groupId,
  standings,
  group,
  onClose,
  onTeamOpen,
}: {
  groupId: string
  standings: Standing[]
  group: Group
  onClose: () => void
  onTeamOpen: (team: Team) => void
}) {
  const [userTimezone, setUserTimezone] = useState('UTC')
  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const completedMatches = group.matches.filter(m => m.status === 'ft')
  const upcomingMatches = group.matches.filter(m => m.status === 'upcoming' || m.status === 'live')

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

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

          <h2 className="text-xl font-bold text-white">Group {groupId}</h2>

          {/* Large flags — tappable */}
          <div className="flex gap-4 mt-3">
            {standings.map((s, idx) => (
              <button
                key={s.team.id}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                onClick={() => onTeamOpen(s.team)}
              >
                <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-8" />
                <span className={`text-[10px] font-medium ${idx < 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  {s.team.name.length > 6 ? s.team.name.slice(0, 6) + '…' : s.team.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto bg-[#13131a] flex-1 px-4 py-3 space-y-5"
          style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-sm bg-green-500" />
              <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Top 2 advance to Round of 32</span>
            </div>
            <StandingsTable standings={standings} />
          </div>

          {completedMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Results</p>
              <div className="space-y-2">
                {completedMatches.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60">
                    <span className="flex items-center gap-1.5 flex-1">
                      <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-5" />
                      <span className="text-gray-200 font-medium">{m.homeTeam.name}</span>
                    </span>
                    <span className="font-bold text-white tabular-nums px-3 text-sm">
                      {m.homeScore} – {m.awayScore}
                    </span>
                    <span className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className="text-gray-200 font-medium text-right">{m.awayTeam.name}</span>
                      <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Upcoming</p>
              <div className="space-y-2">
                {upcomingMatches.map(m => {
                  const time = new Date(m.kickoff).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
                    timeZone: userTimezone,
                  })
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60">
                      <span className="flex items-center gap-1.5 flex-1">
                        <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-5" />
                        <span className="text-gray-300">{m.homeTeam.name}</span>
                      </span>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-gray-500 font-medium">vs</span>
                        <span className="text-[10px] text-gray-600 text-center">{time}</span>
                      </div>
                      <span className="flex items-center gap-1.5 flex-1 justify-end">
                        <span className="text-gray-300 text-right">{m.awayTeam.name}</span>
                        <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-5" />
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

// -- Main export ------------------------------------------------------------

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
}

export default function GroupsClient({ standings, groups }: GroupsClientProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [teamSheet, setTeamSheet] = useState<Team | null>(null)

  const activeStandings = activeGroup ? standings[activeGroup] : null
  const activeGroupData = activeGroup ? groups.find(g => g.id === activeGroup) : null

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f]">
      <div className="px-5 pt-2 pb-3">
      <div
        className="grid grid-cols-2 gap-4 px-4"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
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

      {/* Group sheet — hidden while team sheet is open */}
      {activeGroup && activeStandings && activeGroupData && !teamSheet && (
        <GroupSheet
          groupId={activeGroup}
          standings={activeStandings}
          group={activeGroupData}
          onClose={() => setActiveGroup(null)}
          onTeamOpen={(team) => setTeamSheet(team)}
        />
      )}

      {/* Team sheet — closes back to group sheet */}
      {teamSheet && (
        <TeamSheet team={teamSheet} onClose={() => setTeamSheet(null)} />
      )}
    </div>
  )
}
