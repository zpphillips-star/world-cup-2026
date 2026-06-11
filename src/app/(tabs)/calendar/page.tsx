import dataProvider from '@/lib/dataProvider'
import CalendarClient from './CalendarClient'

export default function CalendarPage() {
  const matches = dataProvider.getMatches()
  const statsMap = dataProvider.getTeamStats()
  const standingsMap = dataProvider.getStandings()
  return <CalendarClient matches={matches} statsMap={statsMap} standingsMap={standingsMap} />
}
