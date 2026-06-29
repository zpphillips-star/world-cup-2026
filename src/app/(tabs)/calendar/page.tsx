import dataProvider from '@/lib/dataProvider'
import CalendarClient from './CalendarClient'
import type { Standing } from '@/lib/types'

export default function CalendarPage() {
  const matches = dataProvider.getMatches()

  const allTeamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeam.id, m.awayTeam.id])))
  const statsMap: Record<string, import('@/lib/types').TeamStats | null> = {}
  for (const id of allTeamIds) {
    statsMap[id] = dataProvider.getTeamStats(id)
  }

  const standingsMap: Record<string, Standing[]> = dataProvider.getStandings()
  return <CalendarClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
}
