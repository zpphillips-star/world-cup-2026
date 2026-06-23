/**
 * Shared standings utilities — single source of truth.
 *
 * Two strategies:
 *
 * 1. computeStandingsFromMatches() — calculates standings directly from match
 *    results we already have (including live scores). Always current — no API lag.
 *    Use this as primary so standings update the moment a game ends, without
 *    waiting for ESPN's standings API to catch up (can lag minutes after FT).
 *
 * 2. mergeStandings() — overlays ESPN standings API data on base standings.
 *    Use as secondary/fallback; ESPN has authoritative tiebreaker ordering but lags.
 */
import type { Standing, Match } from "@/lib/types"
import type { StandingRow } from "@/app/api/standings/route"
import { teamNamesMatch } from "@/lib/espnAliases"

/**
 * Compute standings from match results directly.
 * Only counts matches with status "ft" (finished).
 * Preserves Team objects from base standings.
 */
export function computeStandingsFromMatches(
  matches: Match[],
  base: Record<string, Standing[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = {}

  for (const [group, baseTeams] of Object.entries(base)) {
    const map: Record<string, Standing> = {}
    for (const s of baseTeams) {
      map[s.team.id] = {
        team: s.team,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      }
    }

    const groupMatches = matches.filter(m => m.group === group && m.status === "ft")
    for (const m of groupMatches) {
      const h = map[m.homeTeam.id]
      const a = map[m.awayTeam.id]
      if (!h || !a) continue
      const hg = m.homeScore ?? 0
      const ag = m.awayScore ?? 0
      h.played++; a.played++
      h.goalsFor += hg; h.goalsAgainst += ag
      a.goalsFor += ag; a.goalsAgainst += hg
      if (hg > ag) { h.won++; h.points += 3; a.lost++ }
      else if (ag > hg) { a.won++; a.points += 3; h.lost++ }
      else { h.drawn++; h.points++; a.drawn++; a.points++ }
    }

    for (const s of Object.values(map)) {
      s.goalDiff = s.goalsFor - s.goalsAgainst
    }

    result[group] = Object.values(map).sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
    )
  }

  return result
}

/**
 * Merges computed standings (from match data) with live ESPN standings.
 * Prefers ESPN data only when it shows MORE games played than our computed data.
 * Used by all 4 client tabs to avoid duplicating this blending logic.
 */
export function computeEffectiveStandingsMap(
  computedStandingsMap: Record<string, Standing[]>,
  liveStandingsMap: Record<string, Standing[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = { ...computedStandingsMap }
  for (const [group, espnRows] of Object.entries(liveStandingsMap)) {
    const espnPlayed = espnRows.reduce((s, r) => s + r.played, 0)
    const computedPlayed = computedStandingsMap[group]?.reduce((s, r) => s + r.played, 0) ?? 0
    if (espnPlayed > computedPlayed) result[group] = espnRows
  }
  return result
}

/**
 * Overlay ESPN standings API data on base standings.
 * Used as a secondary source; always maps over base teams so no team is lost.
 */
export function mergeStandings(
  base: Record<string, Standing[]>,
  espn: Record<string, StandingRow[]>
): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = { ...base }
  for (const [group, rows] of Object.entries(espn)) {
    const baseGroup = base[group]
    if (!baseGroup) continue

    const merged: Standing[] = baseGroup.map(s => {
      const row = rows.find(r => teamNamesMatch(r.teamName, s.team.name))
      if (!row) return s
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
