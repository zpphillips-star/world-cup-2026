export const runtime = 'edge'

export interface ScoringEvent {
  playerName: string
  minute: string
  teamSide: 'home' | 'away'
  type: 'goal' | 'og' | 'pen'
}

export interface CardEvent {
  playerName: string
  minute: string
  teamSide: 'home' | 'away'
  cardType: 'red' | 'yellow-red'
}

export interface ScoreUpdate {
  homeScore: number
  awayScore: number
  status: 'upcoming' | 'live' | 'ft'
  clock?: string
  scorers: ScoringEvent[]
  redCards: CardEvent[]
  penaltyWinner?: 'home' | 'away'
}

import { normalize, resolveEspnName, ESPN_TO_SCHEDULE } from '@/lib/espnAliases'

// Generate all key variants for a team name so match keys resolve regardless of ESPN naming
function normalizeTeamName(name: string): string[] {
  const n = normalize(name)
  const resolved = resolveEspnName(name)
  const rn = normalize(resolved)
  const keys = new Set([n, rn])
  // Also add reverse aliases (schedule→ESPN) so we generate dual keys
  const lower = name.toLowerCase()
  for (const [espnKey, schedKey] of Object.entries(ESPN_TO_SCHEDULE)) {
    if (schedKey === lower) keys.add(normalize(espnKey))
  }
  return Array.from(keys)
}

function parseClock(raw?: string): string | undefined {
  if (!raw) return undefined
  // ESPN returns stoppage time as "90'+12'" or "45'+5'" — handle this first
  const stoppageMatch = raw.match(/^(\d+)'\+(\d+)'?/)
  if (stoppageMatch) return `${stoppageMatch[1]}+${stoppageMatch[2]}'`
  // Also handle legacy formats: "67:00" -> "67'", "45+3:00" -> "45+3'", "45+3" -> "45+3'", "90'" -> "90'"
  const match = raw.match(/^(\d+(?:\+\d+)?)/)
  return match ? `${match[1]}'` : raw
}

function getTournamentDates(): string[] {
  const dates: string[] = []
  // Fetch from tournament start (June 11, 2026 UTC) through tomorrow
  const start = new Date('2026-06-11T00:00:00Z')
  const now = new Date()
  const end = new Date(now)
  end.setUTCDate(end.getUTCDate() + 1)
  const cur = new Date(start)
  while (cur <= end) {
    const y = cur.getUTCFullYear()
    const m = String(cur.getUTCMonth() + 1).padStart(2, '0')
    const day = String(cur.getUTCDate()).padStart(2, '0')
    dates.push(`${y}${m}${day}`)
    cur.setUTCDate(cur.getUTCDate() + 1)
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
            statusName === 'STATUS_FINAL_AET' ||
            statusName === 'STATUS_EXTRA_TIME' && comp.status?.type?.completed === true ||
            comp.status?.type?.completed === true
          ) status = 'ft'

          // Parse scoring events from details
          const scorers: ScoringEvent[] = []
          const redCards: CardEvent[] = []
          for (const detail of comp.details ?? []) {
            const typeText: string = (detail.type?.text ?? '').toLowerCase()
            const playerName: string = detail.athletesInvolved?.[0]?.displayName ?? 'Unknown'
            const minute = parseClock(detail.clock?.displayValue) ?? '?'
            const teamSide: 'home' | 'away' = detail.team?.id === home.team.id ? 'home' : 'away'

            if (detail.scoringPlay) {
              const type: 'goal' | 'og' | 'pen' =
                typeText.includes('own') ? 'og' :
                typeText.includes('penalty') || typeText.includes('pen') ? 'pen' :
                'goal'
              scorers.push({ playerName, minute, teamSide, type })
            } else if (typeText.includes('red card') || typeText === 'red' || typeText.includes('second yellow')) {
              const cardType: 'red' | 'yellow-red' = typeText.includes('second yellow') || typeText.includes('yellow-red') ? 'yellow-red' : 'red'
              redCards.push({ playerName, minute, teamSide, cardType })
            }
          }

          // Fallback: if there are scoring events and status is still "upcoming", treat as live
          if (status === 'upcoming' && scorers.length > 0) {
            status = comp.status?.type?.completed === true ? 'ft' : 'live'
          }

          const homeNames = normalizeTeamName(home.team.displayName ?? home.team.name)
          const awayNames = normalizeTeamName(away.team.displayName ?? away.team.name)

          // Canonical key = ESPN's primary display name (index 0)
          const canonicalKey = `${homeNames[0]}|${awayNames[0]}`
          const scoreUpdate: ScoreUpdate = {
            homeScore: parseInt(home.score ?? '0', 10),
            awayScore: parseInt(away.score ?? '0', 10),
            status,
            clock: status === 'live'
              ? (statusName === 'STATUS_HALFTIME' ? 'HT' : parseClock(comp.status?.displayClock))
              : undefined,
            scorers,
            redCards,
          }
          // Detect penalty shootout winner from ESPN competitor.winner flag
          if (statusName === 'STATUS_FULL_PEN' || statusName === 'STATUS_FINAL_PEN') {
            if (home.winner === true) scoreUpdate.penaltyWinner = 'home'
            else if (away.winner === true) scoreUpdate.penaltyWinner = 'away'
          }
          scores[canonicalKey] = scoreUpdate

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
  } catch (err) {
    console.error('[live-scores] ESPN fetch failed:', err)
    return Response.json({ scores: {}, aliases: {}, fetchedAt: Date.now() })
  }
}

