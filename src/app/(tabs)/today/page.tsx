import dataProvider from '@/lib/dataProvider'
import TodayClient from './TodayClient'
import type { TeamStats, Standing } from '@/lib/types'

export default function TodayPage() {
  const matches = dataProvider.getMatches()
  const allTeamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeam.id, m.awayTeam.id])))
  const statsMap: Record<string, TeamStats | null> = {}
  for (const id of allTeamIds) statsMap[id] = dataProvider.getTeamStats(id)
  const standingsMap: Record<string, Standing[]> = dataProvider.getStandings()
  return <TodayClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
}
