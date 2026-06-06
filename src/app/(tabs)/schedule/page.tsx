import dataProvider from '@/lib/dataProvider'
import ScheduleClient from './ScheduleClient'
import PageHeader from '@/components/PageHeader'
import type { TeamStats, Standing } from '@/lib/types'

export default function SchedulePage() {
  const matches = dataProvider.getMatches()

  const allTeamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeam.id, m.awayTeam.id])))
  const statsMap: Record<string, TeamStats | null> = {}
  for (const id of allTeamIds) {
    statsMap[id] = dataProvider.getTeamStats(id)
  }

  const standingsMap: Record<string, Standing[]> = dataProvider.getStandings()

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <PageHeader subtitle="FIFA World Cup 2026 · June–July 2026" />
      <ScheduleClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
    </div>
  )
}
