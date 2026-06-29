/**
 * ESPN team name aliases — single source of truth.
 *
 * ESPN occasionally uses different names than our schedule data (FIFA official names).
 * Two resolution strategies are used together:
 *
 * 1. normalize() — strips all non-alphanumeric characters and lowercases.
 *    Handles: Bosnia-Herzegovina ↔ Bosnia & Herzegovina, Côte d'Ivoire ↔ Cote dIvoire, etc.
 *
 * 2. EXPLICIT_ALIASES — for genuinely different names (Czechia vs Czech Republic, etc.)
 *    Always map ESPN's name → our schedule name. Add new entries here when ESPN uses
 *    a name we don't recognise.
 *
 * HOW TO ADD A NEW ALIAS:
 *   1. Find what ESPN sends (check /api/standings or /api/live-scores in the browser)
 *   2. Add: 'espn name lowercase': 'our schedule name lowercase'
 *   3. That's it — all three routes import from here.
 */

/** Strip punctuation/spaces and lowercase — handles accents, hyphens, ampersands */
export function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Maps ESPN lowercase team name → our schedule lowercase team name.
 * Only needed when normalize() alone can't resolve the difference.
 */
export const ESPN_TO_SCHEDULE: Record<string, string> = {
  // Genuinely different names
  'czechia':                    'czech republic',
  'korea republic':             'south korea',
  'republic of ireland':        'ireland',
  'ir iran':                    'iran',
  'usa':                        'united states',

  // These are already handled by normalize() but kept here for documentation
  // 'bosnia-herzegovina'       → normalize → 'bosniaherzegovina' ✓
  // 'côte d\'ivoire'           → normalize → 'cotedivoire' ✓
  // 'türkiye'                  → normalize → 'trkiye' — still differs from 'turkey'!
  'türkiye':                    'turkey',
  'turkiye':                    'turkey',

  // Congo variants
  'congo dr':                   'dr congo',
  'dr. congo':                  'dr congo',
  'democratic republic of congo': 'dr congo',
  'democratic republic of the congo': 'dr congo',

  // Ivory Coast
  "cote d'ivoire":              'ivory coast',
  "côte d'ivoire":              'ivory coast',
  'cote divoire':               'ivory coast',

  // Misc
  'trinidad & tobago':          'trinidad and tobago',
  'cape verde islands':         'cape verde',
  'chinese taipei':             'taiwan',
  'north macedonia':            'north macedonia',   // already matches but explicit
  'curacao':                    'curaçao',
}

/**
 * Resolve an ESPN team name to our schedule team name (lowercase).
 * Tries explicit alias first, then returns the original lowercased.
 */
export function resolveEspnName(espnName: string): string {
  const lower = espnName.toLowerCase()
  return ESPN_TO_SCHEDULE[lower] ?? lower
}

/**
 * Check if two team names refer to the same team.
 * Uses both normalize() stripping and explicit aliases.
 */
export function teamNamesMatch(espnName: string, scheduleName: string): boolean {
  const resolved = resolveEspnName(espnName)
  const sn = scheduleName.toLowerCase()

  // Exact match after alias resolution
  if (resolved === sn) return true

  // Normalize both (strip all non-alphanumeric) — handles & vs -, accents, etc.
  if (normalize(resolved) === normalize(sn)) return true
  if (normalize(espnName) === normalize(sn)) return true

  return false
}

