import dataProvider from '@/lib/dataProvider'
import CalendarClient from './CalendarClient'

export default function CalendarPage() {
  const matches = dataProvider.getMatches()
  return <CalendarClient matches={matches} />
}
