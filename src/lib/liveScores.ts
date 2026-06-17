/**
 * Shared live-score utilities — single source of truth.
 *
 * Extracted from the 4 client copies to eliminate duplication and
 * ensure consistent key construction across all tabs.
 */
import type { Match } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import { normalize } from '@/lib/espnAliases'

/**
 * Returns the lookup key for a match in the live-scores map.
 * Format: "normalized_home|normalized_away"
 */
export function getMatchScoreKey(match: Match): string {
  return `${normalize(match.homeTeam.name)}|${normalize(match.awayTeam.name)}`
}

/**
 * Applies live score updates to an array of matches.
 * Returns a new array with homeScore, awayScore, and status updated where data is available.
 */
export function applyLiveScores(
  matches: Match[],
  scores: Record<string, ScoreUpdate>,
  aliases: Record<string, string> = {}
): Match[] {
  if (Object.keys(scores).length === 0) return matches
  return matches.map(m => {
    const key = getMatchScoreKey(m)
    const update = scores[key] ?? scores[aliases[key]]
    if (!update) return m
    return { ...m, homeScore: update.homeScore, awayScore: update.awayScore, status: update.status }
  })
}
