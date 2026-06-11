import dataProvider from '@/lib/dataProvider'
import CalendarClient from './CalendarClient'

export default function CalendarPage() {
  const matches = dataProvider.getMatches()
  const groups = dataProvider.getGroups()
  const standingsMap = dataProvider.getStandings()

  const statsMap: Record<string, import('@/lib/types').TeamStats | null> = {}
  for (const group of groups) {
    for (const team of group.teams) {
      statsMap[team.id] = dataProvider.getTeamStats(team.id)
    }
  }

  return <CalendarClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
}
