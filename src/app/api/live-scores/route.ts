export const runtime = 'edge'

export interface ScoreUpdate {
  homeScore: number
  awayScore: number
  status: 'upcoming' | 'live' | 'ft'
  clock?: string  // e.g. "67'"
}

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getTournamentDates(): string[] {
  // Return today + yesterday in YYYYMMDD format (catches late games spanning midnight)
  const dates: string[] = []
  const now = new Date()
  for (let offset = -1; offset <= 1; offset++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() + offset)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    dates.push(`${y}${m}${day}`)
  }
  return dates
}

export async function GET() {
  try {
    const dates = getTournamentDates()
    const scores: Record<string, ScoreUpdate> = {}

    await Promise.all(
      dates.map(async (date) => {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}&limit=20`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()

        for (const event of data.events ?? []) {
          const comp = event.competitions?.[0]
          if (!comp) continue

          const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home')
          const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away')
          if (!home || !away) continue

          const statusName: string = comp.status?.type?.name ?? ''
          let status: 'upcoming' | 'live' | 'ft' = 'upcoming'
          if (statusName === 'STATUS_IN_PROGRESS') status = 'live'
          else if (statusName === 'STATUS_FINAL' || comp.status?.type?.completed === true) status = 'ft'

          // Key by normalized home|away names so we can match against our mockProvider data
          const key = `${normalize(home.team.displayName ?? home.team.name)}|${normalize(away.team.displayName ?? away.team.name)}`
          scores[key] = {
            homeScore: parseInt(home.score ?? '0', 10),
            awayScore: parseInt(away.score ?? '0', 10),
            status,
            clock: comp.status?.displayClock ?? undefined,
          }
        }
      })
    )

    return Response.json(
      { scores, fetchedAt: Date.now() },
      { headers: { 'Cache-Control': 's-maxage=2, stale-while-revalidate=3' } }
    )
  } catch {
    return Response.json({ scores: {}, fetchedAt: Date.now() })
  }
}
