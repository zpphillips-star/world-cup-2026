import dataProvider from '@/lib/dataProvider'
import MatchCard from '@/components/MatchCard'

function groupByDate(matches: ReturnType<typeof dataProvider.getMatches>) {
  const byDate: Record<string, typeof matches> = {}
  for (const m of matches) {
    const date = new Date(m.kickoff).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      timeZone: 'America/New_York',
    })
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(m)
  }
  return byDate
}

export default function SchedulePage() {
  const matches = dataProvider.getMatches().sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  )
  const byDate = groupByDate(matches)
  const dateEntries = Object.entries(byDate)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-20 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026 FIFA World Cup · June–July 2026</p>
      </div>

      <div className="pb-8">
        {dateEntries.map(([date, dayMatches], index) => (
          <div key={date} className={index > 0 ? 'mt-8' : ''}>
            <h2 className="sticky top-14 z-10 bg-zinc-200 dark:bg-zinc-700 px-4 py-3 text-xl font-bold text-zinc-900 dark:text-white">
              {date}
            </h2>
            <div className="px-4 pt-2">
              {dayMatches.map((match, i) => (
                <div key={match.id} className={i < dayMatches.length - 1 ? 'border-b border-white/5' : ''}>
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
