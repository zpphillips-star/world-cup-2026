/**
 * Shared hook for computing effective standings from live match data.
 *
 * Combines two strategies:
 * 1. computeStandingsFromMatches — derives standings directly from match results
 *    (instant, no ESPN API lag).
 * 2. computeEffectiveStandingsMap — overlays ESPN standings when they show more
 *    played games than our computed data (handles tiebreaker ordering).
 */
import { useMemo } from 'react'
import { computeStandingsFromMatches, computeEffectiveStandingsMap } from './standingsUtils'
import type { Match, Standing } from '@/lib/types'

export function useEffectiveStandings(
  liveMatches: Match[],
  standingsMap: Record<string, Standing[]>,
  liveStandingsMap: Record<string, Standing[]>
) {
  const computedStandingsMap = useMemo(
    () => computeStandingsFromMatches(liveMatches, standingsMap),
    [liveMatches, standingsMap]
  )

  const effectiveStandingsMap = useMemo(
    () => computeEffectiveStandingsMap(computedStandingsMap, liveStandingsMap),
    [computedStandingsMap, liveStandingsMap, standingsMap]
  )

  return { computedStandingsMap, effectiveStandingsMap }
}
