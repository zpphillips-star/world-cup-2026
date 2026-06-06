export const runtime = 'edge'

export interface ScoringEvent {
  playerName: string
  minute: string
  teamSide: 'home' | 'away'
  type: 'goal' | 'og' | 'pen'
}

export interface ScoreUpdate {
  homeScore: number
  awayScore: number
  status: 'upcoming' | 'live' | 'ft'
  clock?: string
  scorers: ScoringEvent[]
}

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseClock(raw?: string): string | undefined {
  if (!raw) return undefined
  // "67:00" -> "67'", "90:30" -> "90+'"
  const match = raw.match(/^(\d+)/)
  return match ? `${match[1]}'` : raw
}

function getTournamentDates(): string[] {
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

          // Parse scoring events from details
          const scorers: ScoringEvent[] = []
          for (const detail of comp.details ?? []) {
            if (!detail.scoringPlay) continue
            const playerName: string = detail.athletesInvolved?.[0]?.displayName ?? 'Unknown'
            const minute = parseClock(detail.clock?.displayValue) ?? '?'
            const teamSide: 'home' | 'away' = detail.team?.id === home.team.id ? 'home' : 'away'
            const typeText: string = (detail.type?.text ?? '').toLowerCase()
            const type: 'goal' | 'og' | 'pen' =
              typeText.includes('own') ? 'og' :
              typeText.includes('penalty') || typeText.includes('pen') ? 'pen' :
              'goal'
            scorers.push({ playerName, minute, teamSide, type })
          }

          const key = `${normalize(home.team.displayName ?? home.team.name)}|${normalize(away.team.displayName ?? away.team.name)}`
          scores[key] = {
            homeScore: parseInt(home.score ?? '0', 10),
            awayScore: parseInt(away.score ?? '0', 10),
            status,
            clock: status === 'live' ? parseClock(comp.status?.displayClock) : undefined,
            scorers,
          }
        }
      })
    )

    // No real live games yet — inject demo so the live UI can be previewed
    const hasRealLive = Object.values(scores).some(s => s.status === 'live')
    if (!hasRealLive) {
      Object.assign(scores, getDemoScores())
    }

    return Response.json(
      { scores, fetchedAt: Date.now() },
      { headers: { 'Cache-Control': 's-maxage=2, stale-while-revalidate=3' } }
    )
  } catch {
    return Response.json({ scores: {}, fetchedAt: Date.now() })
  }
}

// Demo data injected when no real games are live (removes itself once WC starts)
function getDemoScores(): Record<string, ScoreUpdate> {
  return {
    'mexico|southafrica': {
      homeScore: 2,
      awayScore: 1,
      status: 'live',
      clock: "67'",
      scorers: [
        { playerName: 'Raúl Jiménez', minute: "23'", teamSide: 'home', type: 'goal' },
        { playerName: 'H. Lozano',    minute: "51'", teamSide: 'home', type: 'pen'  },
        { playerName: 'P. Wyngaard',  minute: "38'", teamSide: 'away', type: 'goal' },
      ],
    },
  }
}
