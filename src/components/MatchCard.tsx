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

export default function MatchCard({ match, userTimezone = 'UTC' }: { match: Match; userTimezone?: string }) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(match.kickoff, userTimezone)

  return (
    <div className="flex items-center px-3 sm:px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      {/* Status / Time column */}
      <div className="w-14 sm:w-16 flex-shrink-0 flex flex-col items-center justify-center gap-0.5">
        {isLive ? (
          <span className="text-[11px] font-bold tracking-wide text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded animate-pulse">
            LIVE
          </span>
        ) : isFt ? (
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
            FINAL
          </span>
        ) : (
          <>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 leading-none">{time}</span>
            {tzAbbr && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">{tzAbbr}</span>
            )}
          </>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex-1 flex items-center gap-1 min-w-0 mx-1">
        {/* Home team */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate text-right leading-tight">
            {match.homeTeam.name}
          </span>
          <span className="text-lg leading-none flex-shrink-0">{match.homeTeam.flag}</span>
        </div>

        {/* Score / vs */}
        <div className="w-14 flex-shrink-0 text-center">
          {hasScore ? (
            <span className={`text-sm font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{match.awayTeam.flag}</span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Group / venue — hidden on small screens */}
      <div className="hidden sm:flex flex-col items-end flex-shrink-0 w-20 gap-0.5">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
          {match.group ? `Group ${match.group}` : match.round}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap truncate max-w-full">
          {match.venue.city}
        </span>
      </div>
    </div>
  )
}
