/**
 * Team primary colors for UI accents.
 * Returns a hex color for a given team ID.
 */
export function getTeamColor(teamId: string): string {
  const colors: Record<string, string> = {
    argentina: '#74ACDF',
    france: '#003189',
    brazil: '#009C3B',
    germany: '#000000',
    spain: '#c60b1e',
    england: '#CF081F',
    netherlands: '#FF6600',
    portugal: '#006600',
    usa: '#B22234',
    mexico: '#006847',
    japan: '#BC002D',
    morocco: '#C1272D',
  }
  return colors[teamId] ?? '#00d4ff'
}