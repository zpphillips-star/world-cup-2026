import dataProvider from '@/lib/dataProvider'
import GroupsClient from './GroupsClient'

export default function GroupsPage() {
  const standings = dataProvider.getStandings()
  const groups = dataProvider.getGroups()
  // Build statsMap for all teams so GroupsClient can pass to MatchCard popups
  const allTeams = Object.values(groups).flatMap(g => g.teams)
  const statsMap = Object.fromEntries(allTeams.map(t => [t.id, dataProvider.getTeamStats(t.id)]))
  return <GroupsClient standings={standings} groups={groups} statsMap={statsMap} />
}
