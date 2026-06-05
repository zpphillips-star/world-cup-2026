import dataProvider from '@/lib/dataProvider'
import GroupsClient from './GroupsClient'

export default function GroupsPage() {
  const standings = dataProvider.getStandings()
  const groups = dataProvider.getGroups()
  const bracket = dataProvider.getBracket()
  return <GroupsClient standings={standings} groups={groups} bracket={bracket} />
}
