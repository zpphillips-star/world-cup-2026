import dataProvider from '@/lib/dataProvider'
import MatchCard from '@/components/MatchCard'

function groupByDate(matches: ReturnType<typeof dataProvider.getMatches>) {
  const byDate: Record<string, typeof matches> = {}
  for (const m of matches) {
    const date = new Date(m.kickoff).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
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

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026 FIFA World Cup · June–July 2026</p>
      </div>

      <div className="px-4 py-4">
        {Object.entries(byDate).map(([date, dayMatches]) => (
          <div key={date} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 sticky top-14 bg-[#0a0a0f] py-1">{date}</h2>
            {dayMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
