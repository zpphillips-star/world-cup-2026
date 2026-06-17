/**
 * Shared live-scores utilities — single source of truth for applying ESPN live
 * score updates to our schedule match data.
 */
import { normalize } from '@/lib/espnAliases'
import type { Match } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'

/**
 * Apply live score updates to a list of matches.
 * Uses the aliases map to resolve alternate name variants from ESPN.
 */
export function applyLiveScores(
  matches: Match[],
  scores: Record<string, ScoreUpdate>,
  aliases: Record<string, string>
): Match[] {
  if (Object.keys(scores).length === 0) return matches
  return matches.map(m => {
    const key = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`
    const update = scores[key] ?? scores[aliases[key]]
    if (!update) return m
    return { ...m, homeScore: update.homeScore, awayScore: update.awayScore, status: update.status }
  })
}

/**
 * Build the canonical match score lookup key for a pair of team names.
 */
export function getMatchScoreKey(homeTeamName: string, awayTeamName: string): string {
  return `${normalize(homeTeamName)}|${normalize(awayTeamName)}`
}
