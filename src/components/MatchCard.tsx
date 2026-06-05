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

export default function MatchCard({ match, userTimezone = 'UTC' }: { match: Match; userTimezone?: string; isToday?: boolean }) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(match.kickoff, userTimezone)

  return (
    <div className="flex items-center px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">

      {/* Status / Time column */}
      <div className="w-[72px] flex-shrink-0 flex flex-col items-start justify-center">
        {isLive ? (
          <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase">LIVE</span>
        ) : isFt ? (
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">FINAL</span>
        ) : (
          <>
            <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 leading-tight">{time}</span>
            {tzAbbr && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">{tzAbbr}</span>
            )}
          </>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex-1 flex items-center min-w-0">
        {/* Home team */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate text-right">
            {match.homeTeam.name}
          </span>
          <span className="text-lg leading-none flex-shrink-0">{match.homeTeam.flag}</span>
        </div>

        {/* Score / vs */}
        <div className="w-14 flex-shrink-0 text-center">
          {hasScore ? (
            <span className={`text-[15px] font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="text-[13px] font-medium text-zinc-400">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{match.awayTeam.flag}</span>
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {match.awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  )
}
