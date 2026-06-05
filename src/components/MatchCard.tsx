import type { Match } from '@/lib/types'

function formatTime(kickoff: string, timezone?: string): string {
  try {
    return new Date(kickoff).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone ?? 'America/New_York',
    })
  } catch {
    return '--:--'
  }
}

export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live'
  const isFt = match.status === 'ft'
  const hasScore = isLive || isFt

  return (
    <div className="bg-[#13131a] rounded-xl p-4 mb-3 border border-gray-800 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          {match.group ? `Group ${match.group} · MD${match.matchday}` : match.round} · {match.venue.city}
        </span>
        {isLive && (
          <span className="text-xs text-[#00d4ff] font-bold animate-pulse bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        )}
        {isFt && <span className="text-xs text-gray-400">FT</span>}
        {!isLive && !isFt && (
          <span className="text-xs text-gray-400">
            {formatTime(match.kickoff, match.venue.timezone)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{match.homeTeam.flag}</span>
          <span className="font-semibold text-sm truncate">{match.homeTeam.name}</span>
        </div>

        <div className="text-center min-w-[60px]">
          {hasScore ? (
            <span className={`text-xl font-bold ${isLive ? 'text-[#00d4ff]' : 'text-white'}`}>
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">vs</span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="font-semibold text-sm truncate text-right">{match.awayTeam.name}</span>
          <span className="text-2xl">{match.awayTeam.flag}</span>
        </div>
      </div>
    </div>
  )
}
