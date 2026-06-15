/**
 * Shared standings merge utility — single source of truth.
 *
 * Maps over base standings (which always has all 4 teams per group)
 * and updates each team's stats from ESPN data.
 * Uses teamNamesMatch() from espnAliases for consistent name resolution.
 *
 * WHY THIS APPROACH:
 *   - Iterating over baseGroup (not ESPN rows) guarantees no teams are lost
 *   - If ESPN doesn't return a team, base data is kept as-is
 *   - teamNamesMatch() handles Bosnia-Herzegovina vs Bosnia & Herzegovina, etc.
 */
import type { Standing } from '@/lib/types'
import type { StandingRow } from '@/app/api/standings/route'
import { teamNamesMatch } from '@/lib/espnAliases'

export function mergeStandings(
  base: Record<string, Standing[]>,
  espn: Record<string, StandingRow[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = { ...base }
  for (const [group, rows] of Object.entries(espn)) {
    const baseGroup = base[group]
    if (!baseGroup) continue

    // Always map over baseGroup — guarantees all teams stay in the list
    const merged: Standing[] = baseGroup.map(s => {
      const row = rows.find(r => teamNamesMatch(r.teamName, s.team.name))
      if (!row) return s  // keep base data if ESPN has no entry for this team
      return {
        team: s.team,
        played: row.gp, won: row.w, drawn: row.d, lost: row.l,
        goalsFor: row.gf, goalsAgainst: row.ga, goalDiff: row.gd, points: row.pts,
      }
    })

    merged.sort((a, b) =>
      b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
    )
    result[group] = merged
  }
  return result
}
