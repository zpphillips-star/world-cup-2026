import dataProvider from '@/lib/dataProvider'
import GroupsClient from './GroupsClient'

export default function GroupsPage() {
  const standings = dataProvider.getStandings()
  const groups = dataProvider.getGroups()
  return <GroupsClient standings={standings} groups={groups} />
}
