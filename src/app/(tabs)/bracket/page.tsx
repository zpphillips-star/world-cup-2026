import dataProvider from '@/lib/dataProvider'
import BracketClient from './BracketClient'
import type { TeamStats, Standing } from '@/lib/types'

export default function BracketPage() {
  const initialMatches = dataProvider.getMatches()

  const allTeamIds = Array.from(new Set(initialMatches.flatMap(m => [m.homeTeam.id, m.awayTeam.id])))
  const statsMap: Record<string, TeamStats | null> = {}
  for (const id of allTeamIds) {
    statsMap[id] = dataProvider.getTeamStats(id)
  }

  const standingsMap: Record<string, Standing[]> = dataProvider.getStandings()

  return <BracketClient initialMatches={initialMatches} statsMap={statsMap} standingsMap={standingsMap} />
}
