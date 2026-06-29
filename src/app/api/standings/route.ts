export const runtime = 'edge'

export interface StandingRow {
  teamName: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}

export async function GET() {
  try {
    const url = 'https://site.web.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026'
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return Response.json({ standings: {} })
    const data = await res.json()

    const result: Record<string, StandingRow[]> = {}

    for (const group of data.children ?? []) {
      // group.name = "Group A", "Group B", etc.
      const groupLetter: string = group.abbreviation?.replace('Group ', '') ?? group.name?.replace('Group ', '')
      if (!groupLetter) continue

      const seenTeams = new Set<string>()
      const rows: StandingRow[] = []
      for (const entry of group.standings?.entries ?? []) {
        const teamName: string = entry.team?.displayName ?? entry.team?.name ?? ''
        if (!teamName || seenTeams.has(teamName)) continue
        seenTeams.add(teamName)
        const stats: { name: string; value: number }[] = entry.stats ?? []
        const getStat = (name: string) => stats.find((s: { name: string }) => s.name === name)?.value ?? 0
        rows.push({
          teamName,
          gp: getStat('gamesPlayed'),
          w: getStat('wins'),
          d: getStat('ties'),
          l: getStat('losses'),
          gf: getStat('pointsFor'),
          ga: getStat('pointsAgainst'),
          gd: getStat('pointDifferential'),
          pts: getStat('points'),
        })
      }
      result[groupLetter] = rows
    }

    return Response.json(
      { standings: result, fetchedAt: Date.now() },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
    )
  } catch {
    return Response.json({ standings: {}, fetchedAt: Date.now() })
  }
}

