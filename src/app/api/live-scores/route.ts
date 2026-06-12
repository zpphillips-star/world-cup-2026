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

// ESPN uses different country names than FIFA/our schedule data — map them here
const ESPN_NAME_ALIASES: Record<string, string> = {
  'czechia': 'czech republic',
  'czech republic': 'czechia', // both directions so we generate dual keys
  'republic of ireland': 'ireland',
  'ir iran': 'iran',
  'usa': 'united states',
  'united states': 'usa',
  'côte divoire': 'ivory coast',
  'ivory coast': 'côte divoire',
  'trinidad & tobago': 'trinidad and tobago',
  'trinidad and tobago': 'trinidad & tobago',
  'dr congo': 'democratic republic of congo',
  'democratic republic of congo': 'dr congo',
  'korea republic': 'south korea',
  'south korea': 'korea republic',
}

function normalizeTeamName(name: string): string[] {
  const n = normalize(name)
  const lower = name.toLowerCase()
  const alias = ESPN_NAME_ALIASES[lower]
  return alias ? [n, normalize(alias)] : [n]
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
    // aliases[altKey] = canonicalKey — lets client resolve alternate name variants
    const aliases: Record<string, string> = {}

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
          const statusState: string = comp.status?.type?.state ?? ''
          let status: 'upcoming' | 'live' | 'ft' = 'upcoming'
          if (
            statusName === 'STATUS_IN_PROGRESS' ||
            statusName === 'STATUS_HALFTIME' ||
            statusState === 'in'
          ) status = 'live'
          else if (
            statusName === 'STATUS_FINAL' ||
            statusName === 'STATUS_FULL_TIME' ||
            statusName === 'STATUS_FULL_PEN' ||
            statusName === 'STATUS_EXTRA_TIME' && comp.status?.type?.completed === true ||
            comp.status?.type?.completed === true
          ) status = 'ft'

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

          // Fallback: if there are scoring events and status is still "upcoming", treat as live
          if (status === 'upcoming' && scorers.length > 0) {
            status = comp.status?.type?.completed === true ? 'ft' : 'live'
          }

          const homeNames = normalizeTeamName(home.team.displayName ?? home.team.name)
          const awayNames = normalizeTeamName(away.team.displayName ?? away.team.name)

          // Canonical key = ESPN's primary display name (index 0)
          const canonicalKey = `${homeNames[0]}|${awayNames[0]}`
          scores[canonicalKey] = {
            homeScore: parseInt(home.score ?? '0', 10),
            awayScore: parseInt(away.score ?? '0', 10),
            status,
            clock: status === 'live' ? parseClock(comp.status?.displayClock) : undefined,
            scorers,
          }

          // Register alias keys so clients using different name variants still resolve to canonical
          for (const h of homeNames) {
            for (const a of awayNames) {
              const k = `${h}|${a}`
              if (k !== canonicalKey) aliases[k] = canonicalKey
            }
          }
        }
      })
    )

    return Response.json(
      { scores, aliases, fetchedAt: Date.now() },
      { headers: { 'Cache-Control': 's-maxage=2, stale-while-revalidate=3' } }
    )
  } catch {
    return Response.json({ scores: {}, aliases: {}, fetchedAt: Date.now() })
  }
}
