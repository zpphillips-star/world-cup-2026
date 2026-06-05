import dataProvider from '@/lib/dataProvider'
import ScheduleClient from './ScheduleClient'

export default function SchedulePage() {
  const matches = dataProvider.getMatches()

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-20 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026 FIFA World Cup · June–July 2026</p>
      </div>
      <ScheduleClient matches={matches} />
    </div>
  )
}
