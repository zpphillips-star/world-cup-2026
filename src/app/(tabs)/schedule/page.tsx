import dataProvider from '@/lib/dataProvider'
import ScheduleClient from './ScheduleClient'

export default function SchedulePage() {
  const matches = dataProvider.getMatches()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 px-4 border-b border-zinc-200 dark:border-zinc-800"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026 FIFA World Cup · June–July 2026</p>
      </div>
      <ScheduleClient matches={matches} />
    </div>
  )
}
