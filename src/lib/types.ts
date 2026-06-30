export interface Team {
  id: string
  name: string
  flag: string
  group?: string
}

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  timezone: string
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  kickoff: string
  venue: Venue
  group?: string
  round: string
  status: "upcoming" | "live" | "ft"
  homeScore?: number
  awayScore?: number
  matchday?: number
  /** Set when a knockout match is decided on penalties ("home" or "away" won the shootout) */
  penaltyWinner?: "home" | "away"
}

export interface Group {
  id: string
  teams: Team[]
  matches: Match[]
}

export interface Standing {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface BracketSlot {
  id: string
  home: string | Team
  away: string | Team
  kickoff?: string
  venue?: Venue
  homeScore?: number
  awayScore?: number
  status: "upcoming" | "live" | "ft" | "tbd"
  /** Set when the match was decided on penalties */
  penaltyWinner?: "home" | "away"
}

export interface BracketRound {
  name: string
  matches: BracketSlot[]
  /** For each slot in the NEXT round, the two source slot indices from THIS round.
   *  e.g. [[0,1],[2,3]] means slot 0 of next round is fed by slots 0&1 here.
   *  If omitted, connector falls back to sequential pairing. */
  feedPairs?: [number, number][]
}

export interface TeamStats {
  fifaRank: number
  worldCupAppearances: number
  wcWins: number
  wcDraws: number
  wcLosses: number
  wcGoalsFor: number
  wcGoalsAgainst: number
  bestFinish: string
}

export interface DataProvider {
  getMatches(): Match[]
  getMatch(id: string): Match | null
  getGroups(): Group[]
  getStandings(): Record<string, Standing[]>
  getBracket(liveGroupMatches?: Match[]): BracketRound[]
  getTeam(id: string): Team | null
  getTeamStats(teamId: string): TeamStats | null
}
