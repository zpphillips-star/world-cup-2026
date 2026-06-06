import dataProvider from '@/lib/dataProvider'
import ScheduleClient from './ScheduleClient'
import type { TeamStats, Standing } from '@/lib/types'

export default function SchedulePage() {
  const matches = dataProvider.getMatches()

  // teamId → historical WC stats
  const allTeamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeam.id, m.awayTeam.id])))
  const statsMap: Record<string, TeamStats | null> = {}
  for (const id of allTeamIds) {
    statsMap[id] = dataProvider.getTeamStats(id)
  }

  // groupId → standings array
  const standingsMap: Record<string, Standing[]> = dataProvider.getStandings()

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-white tracking-tight">Schedule</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">FIFA World Cup 2026 · June–July 2026</p>
      </div>
      <ScheduleClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
    </div>
  )
}
