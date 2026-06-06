// Primary jersey/flag color per team — used for ad card backgrounds
// Dark-mode friendly: use at low opacity over #0f0f18

export const teamColors: Record<string, string> = {
  // Group A
  mexico:        '#006847',
  southkorea:    '#C60C30',
  southafrica:   '#007A4D',
  czechrepublic: '#D7141A',
  // Group B
  canada:        '#FF0000',
  switzerland:   '#FF0000',
  qatar:         '#8D1B3D',
  bosnia:        '#002395',
  // Group C
  brazil:        '#009C3B',
  morocco:       '#C1272D',
  scotland:      '#0065BD',
  haiti:         '#00209F',
  // Group D
  usa:           '#002868',
  australia:     '#00843D',
  paraguay:      '#D52B1E',
  turkey:        '#E30A17',
  // Group E
  germany:       '#888888',
  ecuador:       '#FFD100',
  ivorycoast:    '#F77F00',
  curacao:       '#002B7F',
  // Group F
  netherlands:   '#FF4F00',
  japan:         '#BC002D',
  tunisia:       '#E70013',
  sweden:        '#006AA7',
  // Group G
  belgium:       '#C8102E',
  iran:          '#239F40',
  egypt:         '#CE1126',
  newzealand:    '#00247D',
  // Group H
  spain:         '#C60B1E',
  uruguay:       '#5EB6E4',
  saudiarabia:   '#006C35',
  capeverde:     '#003893',
  // Group I
  france:        '#002395',
  senegal:       '#00853F',
  norway:        '#EF2B2D',
  iraq:          '#007A3D',
  // Group J
  argentina:     '#74ACDF',
  austria:       '#ED2939',
  algeria:       '#006233',
  jordan:        '#007A3D',
  // Group K
  portugal:      '#006600',
  colombia:      '#FCD116',
  uzbekistan:    '#1EB53A',
  drcongo:       '#007FFF',
  // Group L
  england:       '#CF081F',
  croatia:       '#CC0000',
  panama:        '#DA121A',
  ghana:         '#006B3F',
}

/** Returns hex color for a team, falling back to cyan brand color */
export function getTeamColor(teamId: string): string {
  return teamColors[teamId] ?? '#00d4ff'
}
