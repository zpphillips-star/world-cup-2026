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
    <div className="min-h-screen bg-[#0a0a0f] pt-6" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
      <ScheduleClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
    </div>
  )
}
