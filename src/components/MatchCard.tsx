import type { Match } from '@/lib/types'

function formatTime(kickoff: string, timezone: string): { time: string; tzAbbr: string } {
  try {
    const date = new Date(kickoff)
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    })
    const tzAbbr =
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value ?? ''
    return { time, tzAbbr }
  } catch {
    return { time: '--:--', tzAbbr: '' }
  }
}

export default function MatchCard({ match, userTimezone = 'UTC', isToday = false }: { match: Match; userTimezone?: string; isToday?: boolean }) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(match.kickoff, userTimezone)
  const groupLabel = match.group ? `Group ${match.group}` : match.round

  return (
    <div className={[
      'flex items-center px-3 sm:px-5 py-4 rounded-xl bg-white dark:bg-zinc-900',
      'shadow-sm border transition-colors cursor-pointer',
      isToday
        ? 'border-l-[3px] border-green-500/70 border-t-zinc-200/80 border-r-zinc-200/80 border-b-zinc-200/80 dark:border-t-zinc-800/80 dark:border-r-zinc-800/80 dark:border-b-zinc-800/80 hover:bg-green-50/40 dark:hover:bg-green-950/20'
        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
    ].join(' ')}>

      {/* Status / Time column */}
      <div className="w-16 sm:w-20 flex-shrink-0 flex flex-col items-center justify-center gap-1">
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-white bg-red-500 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        ) : isFt ? (
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full tracking-wide">
            FINAL
          </span>
        ) : (
          <>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 leading-none">{time}</span>
            {tzAbbr && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">{tzAbbr}</span>
            )}
          </>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex-1 flex items-center gap-1 min-w-0 mx-2">
        {/* Home team */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100 truncate text-right leading-tight">
            {match.homeTeam.name}
          </span>
          <span className="text-2xl leading-none flex-shrink-0">{match.homeTeam.flag}</span>
        </div>

        {/* Score / vs */}
        <div className="w-16 flex-shrink-0 text-center">
          {hasScore ? (
            <span className={`text-2xl font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {match.homeScore}–{match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-semibold text-indigo-400 dark:text-indigo-400">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0">{match.awayTeam.flag}</span>
          <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Group + venue */}
      <div className="hidden sm:flex flex-col items-end flex-shrink-0 w-24 gap-1">
        {groupLabel && (
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full whitespace-nowrap">
            {groupLabel}
          </span>
        )}
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap truncate max-w-full">
          📍 {match.venue.city}
        </span>
      </div>
    </div>
  )
}
