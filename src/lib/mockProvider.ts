import type { DataProvider, Match, Team, Venue, Group, Standing, BracketRound, BracketSlot, TeamStats } from './types'

const venues: Record<string, Venue> = {
  metlife: { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", country: "USA", timezone: "America/New_York" },
  sofi: { id: "sofi", name: "SoFi Stadium", city: "Inglewood", country: "USA", timezone: "America/Los_Angeles" },
  att: { id: "att", name: "AT&T Stadium", city: "Arlington", country: "USA", timezone: "America/Chicago" },
  nrg: { id: "nrg", name: "NRG Stadium", city: "Houston", country: "USA", timezone: "America/Chicago" },
  levis: { id: "levis", name: "Levi's Stadium", city: "Santa Clara", country: "USA", timezone: "America/Los_Angeles" },
  lumen: { id: "lumen", name: "Lumen Field", city: "Seattle", country: "USA", timezone: "America/Los_Angeles" },
  lincoln: { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", timezone: "America/New_York" },
  arrowhead: { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", timezone: "America/Chicago" },
  hardrock: { id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "USA", timezone: "America/New_York" },
  mercedesbenz: { id: "mercedesbenz", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", timezone: "America/New_York" },
  gillette: { id: "gillette", name: "Gillette Stadium", city: "Foxborough", country: "USA", timezone: "America/New_York" },
  bcplace: { id: "bcplace", name: "BC Place", city: "Vancouver", country: "Canada", timezone: "America/Vancouver" },
  bmo: { id: "bmo", name: "BMO Field", city: "Toronto", country: "Canada", timezone: "America/Toronto" },
  azteca: { id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City" },
  akron: { id: "akron", name: "Estadio Akron", city: "Guadalajara", country: "Mexico", timezone: "America/Mexico_City" },
  bbva: { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "Mexico", timezone: "America/Monterrey" },
}

const teams: Record<string, Team> = {
  usa: { id: "usa", name: "USA", flag: "🇺🇸", group: "A" },
  mexico: { id: "mexico", name: "Mexico", flag: "🇲🇽", group: "A" },
  panama: { id: "panama", name: "Panama", flag: "🇵🇦", group: "A" },
  morocco: { id: "morocco", name: "Morocco", flag: "🇲🇦", group: "A" },
  germany: { id: "germany", name: "Germany", flag: "🇩🇪", group: "B" },
  japan: { id: "japan", name: "Japan", flag: "🇯🇵", group: "B" },
  australia: { id: "australia", name: "Australia", flag: "🇦🇺", group: "B" },
  senegal: { id: "senegal", name: "Senegal", flag: "🇸🇳", group: "B" },
  england: { id: "england", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "C" },
  algeria: { id: "algeria", name: "Algeria", flag: "🇩🇿", group: "C" },
  ecuador: { id: "ecuador", name: "Ecuador", flag: "🇪🇨", group: "C" },
  czechia: { id: "czechia", name: "Czech Republic", flag: "🇨🇿", group: "C" },
  france: { id: "france", name: "France", flag: "🇫🇷", group: "D" },
  argentina: { id: "argentina", name: "Argentina", flag: "🇦🇷", group: "D" },
  southkorea: { id: "southkorea", name: "South Korea", flag: "🇰🇷", group: "D" },
  nigeria: { id: "nigeria", name: "Nigeria", flag: "🇳🇬", group: "D" },
  brazil: { id: "brazil", name: "Brazil", flag: "🇧🇷", group: "E" },
  netherlands: { id: "netherlands", name: "Netherlands", flag: "🇳🇱", group: "E" },
  chile: { id: "chile", name: "Chile", flag: "🇨🇱", group: "E" },
  iran: { id: "iran", name: "Iran", flag: "🇮🇷", group: "E" },
  spain: { id: "spain", name: "Spain", flag: "🇪🇸", group: "F" },
  portugal: { id: "portugal", name: "Portugal", flag: "🇵🇹", group: "F" },
  uruguay: { id: "uruguay", name: "Uruguay", flag: "🇺🇾", group: "F" },
  cameroon: { id: "cameroon", name: "Cameroon", flag: "🇨🇲", group: "F" },
  belgium: { id: "belgium", name: "Belgium", flag: "🇧🇪", group: "G" },
  croatia: { id: "croatia", name: "Croatia", flag: "🇭🇷", group: "G" },
  venezuela: { id: "venezuela", name: "Venezuela", flag: "🇻🇪", group: "G" },
  egypt: { id: "egypt", name: "Egypt", flag: "🇪🇬", group: "G" },
  italy: { id: "italy", name: "Italy", flag: "🇮🇹", group: "H" },
  colombia: { id: "colombia", name: "Colombia", flag: "🇨🇴", group: "H" },
  ivorycoast: { id: "ivorycoast", name: "Ivory Coast", flag: "🇨🇮", group: "H" },
  canada: { id: "canada", name: "Canada", flag: "🇨🇦", group: "H" },
  serbia: { id: "serbia", name: "Serbia", flag: "🇷🇸", group: "I" },
  poland: { id: "poland", name: "Poland", flag: "🇵🇱", group: "I" },
  peru: { id: "peru", name: "Peru", flag: "🇵🇪", group: "I" },
  saudiarabia: { id: "saudiarabia", name: "Saudi Arabia", flag: "🇸🇦", group: "I" },
  switzerland: { id: "switzerland", name: "Switzerland", flag: "🇨🇭", group: "J" },
  denmark: { id: "denmark", name: "Denmark", flag: "🇩🇰", group: "J" },
  bolivia: { id: "bolivia", name: "Bolivia", flag: "🇧🇴", group: "J" },
  tunisia: { id: "tunisia", name: "Tunisia", flag: "🇹🇳", group: "J" },
  turkey: { id: "turkey", name: "Turkey", flag: "🇹🇷", group: "K" },
  ukraine: { id: "ukraine", name: "Ukraine", flag: "🇺🇦", group: "K" },
  honduras: { id: "honduras", name: "Honduras", flag: "🇭🇳", group: "K" },
  ghana: { id: "ghana", name: "Ghana", flag: "🇬🇭", group: "K" },
  sweden: { id: "sweden", name: "Sweden", flag: "🇸🇪", group: "L" },
  norway: { id: "norway", name: "Norway", flag: "🇳🇴", group: "L" },
  costarica: { id: "costarica", name: "Costa Rica", flag: "🇨🇷", group: "L" },
  newzealand: { id: "newzealand", name: "New Zealand", flag: "🇳🇿", group: "L" },
}

const matches: Match[] = [
  { id: "a1", homeTeam: teams.usa, awayTeam: teams.morocco, kickoff: "2026-06-11T20:00:00Z", venue: venues.metlife, group: "A", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 0, matchday: 1 },
  { id: "a2", homeTeam: teams.mexico, awayTeam: teams.panama, kickoff: "2026-06-12T00:00:00Z", venue: venues.azteca, group: "A", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "a3", homeTeam: teams.usa, awayTeam: teams.panama, kickoff: "2026-06-16T20:00:00Z", venue: venues.arrowhead, group: "A", round: "Group Stage", status: "live", homeScore: 2, awayScore: 0, matchday: 2 },
  { id: "a4", homeTeam: teams.morocco, awayTeam: teams.mexico, kickoff: "2026-06-17T00:00:00Z", venue: venues.hardrock, group: "A", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "a5", homeTeam: teams.panama, awayTeam: teams.morocco, kickoff: "2026-06-21T20:00:00Z", venue: venues.gillette, group: "A", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "a6", homeTeam: teams.usa, awayTeam: teams.mexico, kickoff: "2026-06-21T20:00:00Z", venue: venues.metlife, group: "A", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "b1", homeTeam: teams.germany, awayTeam: teams.japan, kickoff: "2026-06-12T17:00:00Z", venue: venues.att, group: "B", round: "Group Stage", status: "ft", homeScore: 3, awayScore: 1, matchday: 1 },
  { id: "b2", homeTeam: teams.australia, awayTeam: teams.senegal, kickoff: "2026-06-12T23:00:00Z", venue: venues.sofi, group: "B", round: "Group Stage", status: "ft", homeScore: 0, awayScore: 2, matchday: 1 },
  { id: "b3", homeTeam: teams.germany, awayTeam: teams.senegal, kickoff: "2026-06-17T17:00:00Z", venue: venues.nrg, group: "B", round: "Group Stage", status: "live", homeScore: 1, awayScore: 1, matchday: 2 },
  { id: "b4", homeTeam: teams.japan, awayTeam: teams.australia, kickoff: "2026-06-17T21:00:00Z", venue: venues.levis, group: "B", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "b5", homeTeam: teams.senegal, awayTeam: teams.japan, kickoff: "2026-06-22T17:00:00Z", venue: venues.lincoln, group: "B", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "b6", homeTeam: teams.germany, awayTeam: teams.australia, kickoff: "2026-06-22T17:00:00Z", venue: venues.att, group: "B", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "c1", homeTeam: teams.england, awayTeam: teams.algeria, kickoff: "2026-06-13T17:00:00Z", venue: venues.metlife, group: "C", round: "Group Stage", status: "ft", homeScore: 4, awayScore: 0, matchday: 1 },
  { id: "c2", homeTeam: teams.ecuador, awayTeam: teams.czechia, kickoff: "2026-06-13T21:00:00Z", venue: venues.lumen, group: "C", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 2, matchday: 1 },
  { id: "c3", homeTeam: teams.england, awayTeam: teams.czechia, kickoff: "2026-06-18T17:00:00Z", venue: venues.lincoln, group: "C", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "c4", homeTeam: teams.algeria, awayTeam: teams.ecuador, kickoff: "2026-06-18T21:00:00Z", venue: venues.bcplace, group: "C", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "c5", homeTeam: teams.czechia, awayTeam: teams.algeria, kickoff: "2026-06-23T17:00:00Z", venue: venues.bmo, group: "C", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "c6", homeTeam: teams.england, awayTeam: teams.ecuador, kickoff: "2026-06-23T17:00:00Z", venue: venues.metlife, group: "C", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "d1", homeTeam: teams.france, awayTeam: teams.nigeria, kickoff: "2026-06-13T20:00:00Z", venue: venues.hardrock, group: "D", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 0, matchday: 1 },
  { id: "d2", homeTeam: teams.argentina, awayTeam: teams.southkorea, kickoff: "2026-06-14T00:00:00Z", venue: venues.mercedesbenz, group: "D", round: "Group Stage", status: "ft", homeScore: 3, awayScore: 0, matchday: 1 },
  { id: "d3", homeTeam: teams.france, awayTeam: teams.southkorea, kickoff: "2026-06-18T20:00:00Z", venue: venues.sofi, group: "D", round: "Group Stage", status: "live", homeScore: 0, awayScore: 0, matchday: 2 },
  { id: "d4", homeTeam: teams.nigeria, awayTeam: teams.argentina, kickoff: "2026-06-19T00:00:00Z", venue: venues.nrg, group: "D", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "d5", homeTeam: teams.southkorea, awayTeam: teams.nigeria, kickoff: "2026-06-23T20:00:00Z", venue: venues.att, group: "D", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "d6", homeTeam: teams.france, awayTeam: teams.argentina, kickoff: "2026-06-23T20:00:00Z", venue: venues.metlife, group: "D", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "e1", homeTeam: teams.brazil, awayTeam: teams.iran, kickoff: "2026-06-14T17:00:00Z", venue: venues.sofi, group: "E", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 0, matchday: 1 },
  { id: "e2", homeTeam: teams.netherlands, awayTeam: teams.chile, kickoff: "2026-06-14T21:00:00Z", venue: venues.arrowhead, group: "E", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 1, matchday: 1 },
  { id: "e3", homeTeam: teams.brazil, awayTeam: teams.chile, kickoff: "2026-06-19T17:00:00Z", venue: venues.gillette, group: "E", round: "Group Stage", status: "ft", homeScore: 3, awayScore: 1, matchday: 2 },
  { id: "e4", homeTeam: teams.iran, awayTeam: teams.netherlands, kickoff: "2026-06-19T21:00:00Z", venue: venues.levis, group: "E", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "e5", homeTeam: teams.chile, awayTeam: teams.iran, kickoff: "2026-06-24T17:00:00Z", venue: venues.bcplace, group: "E", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "e6", homeTeam: teams.brazil, awayTeam: teams.netherlands, kickoff: "2026-06-24T17:00:00Z", venue: venues.sofi, group: "E", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "f1", homeTeam: teams.spain, awayTeam: teams.cameroon, kickoff: "2026-06-14T20:00:00Z", venue: venues.metlife, group: "F", round: "Group Stage", status: "ft", homeScore: 3, awayScore: 0, matchday: 1 },
  { id: "f2", homeTeam: teams.portugal, awayTeam: teams.uruguay, kickoff: "2026-06-15T00:00:00Z", venue: venues.azteca, group: "F", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "f3", homeTeam: teams.spain, awayTeam: teams.uruguay, kickoff: "2026-06-19T20:00:00Z", venue: venues.hardrock, group: "F", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "f4", homeTeam: teams.cameroon, awayTeam: teams.portugal, kickoff: "2026-06-20T00:00:00Z", venue: venues.bmo, group: "F", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "f5", homeTeam: teams.uruguay, awayTeam: teams.cameroon, kickoff: "2026-06-24T20:00:00Z", venue: venues.lumen, group: "F", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "f6", homeTeam: teams.spain, awayTeam: teams.portugal, kickoff: "2026-06-24T20:00:00Z", venue: venues.metlife, group: "F", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "g1", homeTeam: teams.belgium, awayTeam: teams.egypt, kickoff: "2026-06-15T17:00:00Z", venue: venues.att, group: "G", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 0, matchday: 1 },
  { id: "g2", homeTeam: teams.croatia, awayTeam: teams.venezuela, kickoff: "2026-06-15T21:00:00Z", venue: venues.lincoln, group: "G", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 0, matchday: 1 },
  { id: "g3", homeTeam: teams.belgium, awayTeam: teams.venezuela, kickoff: "2026-06-20T17:00:00Z", venue: venues.mercedesbenz, group: "G", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "g4", homeTeam: teams.egypt, awayTeam: teams.croatia, kickoff: "2026-06-20T21:00:00Z", venue: venues.nrg, group: "G", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "g5", homeTeam: teams.venezuela, awayTeam: teams.egypt, kickoff: "2026-06-25T17:00:00Z", venue: venues.akron, group: "G", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "g6", homeTeam: teams.belgium, awayTeam: teams.croatia, kickoff: "2026-06-25T17:00:00Z", venue: venues.att, group: "G", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "h1", homeTeam: teams.italy, awayTeam: teams.canada, kickoff: "2026-06-15T20:00:00Z", venue: venues.bmo, group: "H", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 1, matchday: 1 },
  { id: "h2", homeTeam: teams.colombia, awayTeam: teams.ivorycoast, kickoff: "2026-06-16T00:00:00Z", venue: venues.sofi, group: "H", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "h3", homeTeam: teams.italy, awayTeam: teams.ivorycoast, kickoff: "2026-06-20T20:00:00Z", venue: venues.gillette, group: "H", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "h4", homeTeam: teams.canada, awayTeam: teams.colombia, kickoff: "2026-06-21T00:00:00Z", venue: venues.bmo, group: "H", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "h5", homeTeam: teams.ivorycoast, awayTeam: teams.canada, kickoff: "2026-06-25T20:00:00Z", venue: venues.bcplace, group: "H", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "h6", homeTeam: teams.italy, awayTeam: teams.colombia, kickoff: "2026-06-25T20:00:00Z", venue: venues.metlife, group: "H", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "i1", homeTeam: teams.serbia, awayTeam: teams.saudiarabia, kickoff: "2026-06-16T17:00:00Z", venue: venues.arrowhead, group: "I", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "i2", homeTeam: teams.poland, awayTeam: teams.peru, kickoff: "2026-06-16T21:00:00Z", venue: venues.bbva, group: "I", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 0, matchday: 1 },
  { id: "i3", homeTeam: teams.serbia, awayTeam: teams.peru, kickoff: "2026-06-21T17:00:00Z", venue: venues.levis, group: "I", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "i4", homeTeam: teams.saudiarabia, awayTeam: teams.poland, kickoff: "2026-06-21T21:00:00Z", venue: venues.hardrock, group: "I", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "i5", homeTeam: teams.peru, awayTeam: teams.saudiarabia, kickoff: "2026-06-26T17:00:00Z", venue: venues.lincoln, group: "I", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "i6", homeTeam: teams.serbia, awayTeam: teams.poland, kickoff: "2026-06-26T17:00:00Z", venue: venues.arrowhead, group: "I", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "j1", homeTeam: teams.switzerland, awayTeam: teams.bolivia, kickoff: "2026-06-16T20:00:00Z", venue: venues.lumen, group: "J", round: "Group Stage", status: "ft", homeScore: 3, awayScore: 0, matchday: 1 },
  { id: "j2", homeTeam: teams.denmark, awayTeam: teams.tunisia, kickoff: "2026-06-17T00:00:00Z", venue: venues.mercedesbenz, group: "J", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "j3", homeTeam: teams.switzerland, awayTeam: teams.tunisia, kickoff: "2026-06-21T20:00:00Z", venue: venues.bcplace, group: "J", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "j4", homeTeam: teams.bolivia, awayTeam: teams.denmark, kickoff: "2026-06-22T00:00:00Z", venue: venues.azteca, group: "J", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "j5", homeTeam: teams.tunisia, awayTeam: teams.bolivia, kickoff: "2026-06-26T20:00:00Z", venue: venues.bbva, group: "J", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "j6", homeTeam: teams.switzerland, awayTeam: teams.denmark, kickoff: "2026-06-26T20:00:00Z", venue: venues.lumen, group: "J", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "k1", homeTeam: teams.turkey, awayTeam: teams.ghana, kickoff: "2026-06-17T17:00:00Z", venue: venues.gillette, group: "K", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 1, matchday: 1 },
  { id: "k2", homeTeam: teams.ukraine, awayTeam: teams.honduras, kickoff: "2026-06-17T21:00:00Z", venue: venues.akron, group: "K", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 0, matchday: 1 },
  { id: "k3", homeTeam: teams.turkey, awayTeam: teams.honduras, kickoff: "2026-06-22T17:00:00Z", venue: venues.att, group: "K", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "k4", homeTeam: teams.ghana, awayTeam: teams.ukraine, kickoff: "2026-06-22T21:00:00Z", venue: venues.nrg, group: "K", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "k5", homeTeam: teams.honduras, awayTeam: teams.ghana, kickoff: "2026-06-27T17:00:00Z", venue: venues.bmo, group: "K", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "k6", homeTeam: teams.turkey, awayTeam: teams.ukraine, kickoff: "2026-06-27T17:00:00Z", venue: venues.gillette, group: "K", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "l1", homeTeam: teams.sweden, awayTeam: teams.newzealand, kickoff: "2026-06-17T20:00:00Z", venue: venues.arrowhead, group: "L", round: "Group Stage", status: "ft", homeScore: 2, awayScore: 0, matchday: 1 },
  { id: "l2", homeTeam: teams.norway, awayTeam: teams.costarica, kickoff: "2026-06-18T00:00:00Z", venue: venues.hardrock, group: "L", round: "Group Stage", status: "ft", homeScore: 1, awayScore: 1, matchday: 1 },
  { id: "l3", homeTeam: teams.sweden, awayTeam: teams.costarica, kickoff: "2026-06-22T20:00:00Z", venue: venues.sofi, group: "L", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "l4", homeTeam: teams.newzealand, awayTeam: teams.norway, kickoff: "2026-06-23T00:00:00Z", venue: venues.levis, group: "L", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "l5", homeTeam: teams.costarica, awayTeam: teams.newzealand, kickoff: "2026-06-27T20:00:00Z", venue: venues.mercedesbenz, group: "L", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "l6", homeTeam: teams.sweden, awayTeam: teams.norway, kickoff: "2026-06-27T20:00:00Z", venue: venues.arrowhead, group: "L", round: "Group Stage", status: "upcoming", matchday: 3 },
]

function computeStandings(groupId: string): Standing[] {
  const groupTeamIds = Object.values(teams)
    .filter(t => t.group === groupId)
    .map(t => t.id)

  const standingMap: Record<string, Standing> = {}
  for (const tid of groupTeamIds) {
    standingMap[tid] = {
      team: teams[tid],
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    }
  }

  const groupMatches = matches.filter(m => m.group === groupId && m.status === "ft")
  for (const m of groupMatches) {
    const h = standingMap[m.homeTeam.id]
    const a = standingMap[m.awayTeam.id]
    if (!h || !a) continue
    const hg = m.homeScore ?? 0
    const ag = m.awayScore ?? 0
    h.played++; a.played++
    h.goalsFor += hg; h.goalsAgainst += ag
    a.goalsFor += ag; a.goalsAgainst += hg
    if (hg > ag) { h.won++; h.points += 3; a.lost++ }
    else if (hg < ag) { a.won++; a.points += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.points++; a.points++ }
  }

  for (const s of Object.values(standingMap)) {
    s.goalDiff = s.goalsFor - s.goalsAgainst
  }

  return Object.values(standingMap).sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
  )
}

function getBracket(): BracketRound[] {
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"]
  const r32Slots: BracketSlot[] = []
  for (let i = 0; i < groups.length; i += 2) {
    const g1 = groups[i]
    const g2 = groups[i+1]
    r32Slots.push({
      id: `r32-${i/2+1}a`,
      home: `Winner Group ${g1}`,
      away: `Runner-up Group ${g2}`,
      status: "tbd",
    })
    r32Slots.push({
      id: `r32-${i/2+1}b`,
      home: `Winner Group ${g2}`,
      away: `Runner-up Group ${g1}`,
      status: "tbd",
    })
  }

  const r16Slots: BracketSlot[] = Array.from({ length: 16 }, (_, i) => ({
    id: `r16-${i+1}`,
    home: `Winner R32 Match ${i*2+1}`,
    away: `Winner R32 Match ${i*2+2}`,
    status: "tbd" as const,
  }))

  const qfSlots: BracketSlot[] = Array.from({ length: 8 }, (_, i) => ({
    id: `qf-${i+1}`,
    home: `Winner R16 Match ${i*2+1}`,
    away: `Winner R16 Match ${i*2+2}`,
    status: "tbd" as const,
  }))

  const sfSlots: BracketSlot[] = Array.from({ length: 2 }, (_, i) => ({
    id: `sf-${i+1}`,
    home: `Winner QF ${i*2+1}`,
    away: `Winner QF ${i*2+2}`,
    status: "tbd" as const,
  }))

  return [
    { name: "Round of 32", matches: r32Slots },
    { name: "Round of 16", matches: r16Slots },
    { name: "Quarter-Finals", matches: qfSlots },
    { name: "Semi-Finals", matches: sfSlots },
    { name: "Third Place", matches: [{ id: "3rd", home: "SF Loser 1", away: "SF Loser 2", status: "tbd" }] },
    { name: "Final", matches: [{ id: "final", home: "SF Winner 1", away: "SF Winner 2", status: "tbd" }] },
  ]
}

const teamStats: Record<string, TeamStats> = {
  usa:         { fifaRank: 11, worldCupAppearances: 11, wcWins: 10, wcDraws: 7,  wcLosses: 12, wcGoalsFor: 38,  wcGoalsAgainst: 42,  bestFinish: "3rd (1930)" },
  mexico:      { fifaRank: 15, worldCupAppearances: 17, wcWins: 16, wcDraws: 14, wcLosses: 27, wcGoalsFor: 60,  wcGoalsAgainst: 101, bestFinish: "QF (×5)" },
  panama:      { fifaRank: 49, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 1,  wcLosses: 5,  wcGoalsFor: 4,   wcGoalsAgainst: 14,  bestFinish: "Group Stage" },
  morocco:     { fifaRank: 14, worldCupAppearances: 7,  wcWins: 6,  wcDraws: 5,  wcLosses: 9,  wcGoalsFor: 16,  wcGoalsAgainst: 27,  bestFinish: "4th (2022)" },
  germany:     { fifaRank: 12, worldCupAppearances: 20, wcWins: 67, wcDraws: 20, wcLosses: 20, wcGoalsFor: 226, wcGoalsAgainst: 125, bestFinish: "Champions (×4)" },
  japan:       { fifaRank: 17, worldCupAppearances: 8,  wcWins: 9,  wcDraws: 5,  wcLosses: 10, wcGoalsFor: 27,  wcGoalsAgainst: 33,  bestFinish: "R16 (×4)" },
  australia:   { fifaRank: 23, worldCupAppearances: 6,  wcWins: 5,  wcDraws: 2,  wcLosses: 12, wcGoalsFor: 19,  wcGoalsAgainst: 39,  bestFinish: "QF (2006)" },
  senegal:     { fifaRank: 20, worldCupAppearances: 3,  wcWins: 4,  wcDraws: 3,  wcLosses: 3,  wcGoalsFor: 11,  wcGoalsAgainst: 10,  bestFinish: "QF (2002)" },
  england:     { fifaRank: 5,  worldCupAppearances: 16, wcWins: 28, wcDraws: 18, wcLosses: 16, wcGoalsFor: 87,  wcGoalsAgainst: 53,  bestFinish: "Champions (1966)" },
  algeria:     { fifaRank: 36, worldCupAppearances: 4,  wcWins: 3,  wcDraws: 3,  wcLosses: 7,  wcGoalsFor: 13,  wcGoalsAgainst: 21,  bestFinish: "R16 (2014)" },
  ecuador:     { fifaRank: 34, worldCupAppearances: 4,  wcWins: 4,  wcDraws: 2,  wcLosses: 7,  wcGoalsFor: 14,  wcGoalsAgainst: 22,  bestFinish: "QF (2006)" },
  czechia:     { fifaRank: 37, worldCupAppearances: 9,  wcWins: 12, wcDraws: 6,  wcLosses: 12, wcGoalsFor: 46,  wcGoalsAgainst: 45,  bestFinish: "2nd (1934, 1962)" },
  france:      { fifaRank: 2,  worldCupAppearances: 16, wcWins: 34, wcDraws: 14, wcLosses: 14, wcGoalsFor: 120, wcGoalsAgainst: 68,  bestFinish: "Champions (×2)" },
  argentina:   { fifaRank: 1,  worldCupAppearances: 18, wcWins: 45, wcDraws: 14, wcLosses: 16, wcGoalsFor: 145, wcGoalsAgainst: 76,  bestFinish: "Champions (×3)" },
  southkorea:  { fifaRank: 22, worldCupAppearances: 11, wcWins: 8,  wcDraws: 8,  wcLosses: 20, wcGoalsFor: 36,  wcGoalsAgainst: 74,  bestFinish: "4th (2002)" },
  nigeria:     { fifaRank: 39, worldCupAppearances: 7,  wcWins: 6,  wcDraws: 5,  wcLosses: 9,  wcGoalsFor: 21,  wcGoalsAgainst: 28,  bestFinish: "R16 (×3)" },
  brazil:      { fifaRank: 3,  worldCupAppearances: 22, wcWins: 73, wcDraws: 18, wcLosses: 19, wcGoalsFor: 237, wcGoalsAgainst: 105, bestFinish: "Champions (×5)" },
  netherlands: { fifaRank: 7,  worldCupAppearances: 11, wcWins: 27, wcDraws: 14, wcLosses: 13, wcGoalsFor: 90,  wcGoalsAgainst: 57,  bestFinish: "2nd (×3)" },
  chile:       { fifaRank: 53, worldCupAppearances: 9,  wcWins: 13, wcDraws: 6,  wcLosses: 14, wcGoalsFor: 48,  wcGoalsAgainst: 57,  bestFinish: "3rd (1962)" },
  iran:        { fifaRank: 21, worldCupAppearances: 6,  wcWins: 3,  wcDraws: 3,  wcLosses: 11, wcGoalsFor: 12,  wcGoalsAgainst: 34,  bestFinish: "Group Stage" },
  spain:       { fifaRank: 6,  worldCupAppearances: 16, wcWins: 30, wcDraws: 17, wcLosses: 16, wcGoalsFor: 104, wcGoalsAgainst: 74,  bestFinish: "Champions (2010)" },
  portugal:    { fifaRank: 6,  worldCupAppearances: 9,  wcWins: 17, wcDraws: 7,  wcLosses: 9,  wcGoalsFor: 62,  wcGoalsAgainst: 41,  bestFinish: "3rd (1966)" },
  uruguay:     { fifaRank: 18, worldCupAppearances: 14, wcWins: 23, wcDraws: 8,  wcLosses: 17, wcGoalsFor: 89,  wcGoalsAgainst: 68,  bestFinish: "Champions (×2)" },
  cameroon:    { fifaRank: 43, worldCupAppearances: 8,  wcWins: 4,  wcDraws: 5,  wcLosses: 15, wcGoalsFor: 22,  wcGoalsAgainst: 47,  bestFinish: "QF (1990)" },
  belgium:     { fifaRank: 4,  worldCupAppearances: 14, wcWins: 18, wcDraws: 10, wcLosses: 20, wcGoalsFor: 68,  wcGoalsAgainst: 72,  bestFinish: "3rd (2018)" },
  croatia:     { fifaRank: 10, worldCupAppearances: 6,  wcWins: 14, wcDraws: 4,  wcLosses: 8,  wcGoalsFor: 46,  wcGoalsAgainst: 32,  bestFinish: "2nd (2018)" },
  venezuela:   { fifaRank: 56, worldCupAppearances: 0,  wcWins: 0,  wcDraws: 0,  wcLosses: 0,  wcGoalsFor: 0,   wcGoalsAgainst: 0,   bestFinish: "First appearance" },
  egypt:       { fifaRank: 35, worldCupAppearances: 3,  wcWins: 2,  wcDraws: 2,  wcLosses: 5,  wcGoalsFor: 10,  wcGoalsAgainst: 15,  bestFinish: "Group Stage" },
  italy:       { fifaRank: 9,  worldCupAppearances: 18, wcWins: 45, wcDraws: 21, wcLosses: 14, wcGoalsFor: 128, wcGoalsAgainst: 77,  bestFinish: "Champions (×4)" },
  colombia:    { fifaRank: 27, worldCupAppearances: 6,  wcWins: 9,  wcDraws: 5,  wcLosses: 9,  wcGoalsFor: 32,  wcGoalsAgainst: 28,  bestFinish: "QF (2014)" },
  ivorycoast:  { fifaRank: 30, worldCupAppearances: 4,  wcWins: 2,  wcDraws: 2,  wcLosses: 8,  wcGoalsFor: 11,  wcGoalsAgainst: 26,  bestFinish: "Group Stage" },
  canada:      { fifaRank: 47, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 0,  wcLosses: 4,  wcGoalsFor: 2,   wcGoalsAgainst: 10,  bestFinish: "Group Stage" },
  serbia:      { fifaRank: 33, worldCupAppearances: 13, wcWins: 16, wcDraws: 10, wcLosses: 18, wcGoalsFor: 64,  wcGoalsAgainst: 72,  bestFinish: "4th (×2)" },
  poland:      { fifaRank: 25, worldCupAppearances: 9,  wcWins: 15, wcDraws: 5,  wcLosses: 12, wcGoalsFor: 44,  wcGoalsAgainst: 40,  bestFinish: "3rd (×2)" },
  peru:        { fifaRank: 63, worldCupAppearances: 5,  wcWins: 4,  wcDraws: 3,  wcLosses: 8,  wcGoalsFor: 20,  wcGoalsAgainst: 35,  bestFinish: "3rd (1975 — CONMEBOL)" },
  saudiarabia: { fifaRank: 57, worldCupAppearances: 6,  wcWins: 4,  wcDraws: 3,  wcLosses: 11, wcGoalsFor: 17,  wcGoalsAgainst: 43,  bestFinish: "R16 (1994)" },
  switzerland: { fifaRank: 19, worldCupAppearances: 12, wcWins: 17, wcDraws: 10, wcLosses: 15, wcGoalsFor: 68,  wcGoalsAgainst: 65,  bestFinish: "QF (×3)" },
  denmark:     { fifaRank: 24, worldCupAppearances: 5,  wcWins: 8,  wcDraws: 5,  wcLosses: 7,  wcGoalsFor: 28,  wcGoalsAgainst: 28,  bestFinish: "QF (1998)" },
  bolivia:     { fifaRank: 77, worldCupAppearances: 3,  wcWins: 0,  wcDraws: 1,  wcLosses: 6,  wcGoalsFor: 1,   wcGoalsAgainst: 22,  bestFinish: "Group Stage" },
  tunisia:     { fifaRank: 32, worldCupAppearances: 6,  wcWins: 1,  wcDraws: 4,  wcLosses: 13, wcGoalsFor: 9,   wcGoalsAgainst: 31,  bestFinish: "Group Stage" },
  turkey:      { fifaRank: 29, worldCupAppearances: 3,  wcWins: 6,  wcDraws: 1,  wcLosses: 4,  wcGoalsFor: 24,  wcGoalsAgainst: 20,  bestFinish: "3rd (2002)" },
  ukraine:     { fifaRank: 28, worldCupAppearances: 2,  wcWins: 3,  wcDraws: 2,  wcLosses: 3,  wcGoalsFor: 11,  wcGoalsAgainst: 12,  bestFinish: "QF (2006)" },
  honduras:    { fifaRank: 76, worldCupAppearances: 3,  wcWins: 0,  wcDraws: 2,  wcLosses: 7,  wcGoalsFor: 3,   wcGoalsAgainst: 23,  bestFinish: "Group Stage" },
  ghana:       { fifaRank: 60, worldCupAppearances: 4,  wcWins: 4,  wcDraws: 4,  wcLosses: 6,  wcGoalsFor: 13,  wcGoalsAgainst: 23,  bestFinish: "QF (2010)" },
  sweden:      { fifaRank: 26, worldCupAppearances: 12, wcWins: 16, wcDraws: 8,  wcLosses: 18, wcGoalsFor: 74,  wcGoalsAgainst: 69,  bestFinish: "2nd (1958)" },
  norway:      { fifaRank: 38, worldCupAppearances: 3,  wcWins: 2,  wcDraws: 3,  wcLosses: 4,  wcGoalsFor: 7,   wcGoalsAgainst: 8,   bestFinish: "QF (1938)" },
  costarica:   { fifaRank: 58, worldCupAppearances: 6,  wcWins: 6,  wcDraws: 5,  wcLosses: 10, wcGoalsFor: 23,  wcGoalsAgainst: 33,  bestFinish: "QF (2014)" },
  newzealand:  { fifaRank: 96, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 1,  wcLosses: 5,  wcGoalsFor: 4,   wcGoalsAgainst: 17,  bestFinish: "Group Stage" },
}

export const mockProvider: DataProvider = {
  getMatches() { return matches },
  getMatch(id) { return matches.find(m => m.id === id) ?? null },
    const groupIds = ["A","B","C","D","E","F","G","H","I","J","K","L"]
    return groupIds.map(id => ({
      id,
      teams: Object.values(teams).filter(t => t.group === id),
      matches: matches.filter(m => m.group === id),
    }))
  },
  getStandings() {
    const result: Record<string, Standing[]> = {}
    for (const id of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
      result[id] = computeStandings(id)
    }
    return result
  },
  getBracket,
  getTeam(id) { return teams[id] ?? null },
  getTeamStats(id) { return teamStats[id] ?? null },
}
