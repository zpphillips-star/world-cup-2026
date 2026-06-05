import dataProvider from '@/lib/dataProvider'
import ScheduleClient from './ScheduleClient'

export default function SchedulePage() {
  const matches = dataProvider.getMatches()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026 FIFA World Cup · June–July 2026</p>
      </div>
      <ScheduleClient matches={matches} />
    </div>
  )
}
