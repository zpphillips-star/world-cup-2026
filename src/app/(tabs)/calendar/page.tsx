import dataProvider from '@/lib/dataProvider'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const matches = dataProvider.getMatches()

  const matchDays: Record<string, string[]> = {}
  for (const m of matches) {
    const d = new Date(m.kickoff)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    if (!matchDays[key]) matchDays[key] = []
    matchDays[key].push(m.status)
  }

  const months = [
    { year: 2026, month: 5, name: 'June 2026' },
    { year: 2026, month: 6, name: 'July 2026' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Calendar</h1>
      </div>

      <div className="px-4 py-4 space-y-8">
        {months.map(({ year, month, name }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfWeek(year, month)

          return (
            <div key={name}>
              <h2 className="text-lg font-bold mb-3 text-[#00d4ff]">{name}</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const key = `${year}-${month}-${day}`
                  const statuses = matchDays[key] ?? []
                  const hasLive = statuses.includes('live')
                  const hasFt = statuses.includes('ft')
                  const hasUpcoming = statuses.includes('upcoming')

                  return (
                    <div
                      key={day}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium
                        ${statuses.length > 0 ? 'bg-[#13131a] border border-gray-700' : ''}
                      `}
                    >
                      <span>{day}</span>
                      {statuses.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {hasLive && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />}
                          {hasFt && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Live
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500" /> Upcoming
          </div>
        </div>
      </div>
    </div>
  )
}
