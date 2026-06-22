/**
 * Local 2026 World Cup jersey kit paths served from /public/jerseys/.
 * Keyed by team ID (matching Team.id in mockProvider).
 * home/away are Next.js public-folder paths, or null if no image is available
 * for that team (teams whose codes weren't included in the supplied image set).
 *
 * Image files live in public/jerseys/{code}_home.png / {code}_away.png.
 * The 3-letter code → app team-ID mapping follows FIFA/ESPN conventions.
 */

export interface JerseyKit {
  home: string | null
  away: string | null
}

/** Build a kit entry from a 3-letter FIFA code */
const kit = (code: string): JerseyKit => ({
  home: `/jerseys/${code}_home.png`,
  away: `/jerseys/${code}_away.png`,
})

export const jerseyKits: Record<string, JerseyKit> = {
  // Group A
  mexico:        kit('mex'),
  southkorea:    kit('kor'),
  southafrica:   kit('rsa'),
  czechrepublic: { home: null, away: null },  // no local image supplied

  // Group B
  canada:        kit('can'),
  switzerland:   kit('sui'),
  qatar:         kit('qat'),
  bosnia:        { home: null, away: null },  // no local image supplied

  // Group C
  brazil:        kit('bra'),
  morocco:       kit('mar'),
  scotland:      { home: null, away: null },  // no local image supplied
  haiti:         kit('hai'),

  // Group D
  usa:           kit('usa'),
  australia:     kit('aus'),
  paraguay:      kit('par'),
  turkey:        kit('tur'),

  // Group E
  germany:       kit('ger'),
  ecuador:       kit('ecu'),
  ivorycoast:    { home: null, away: null },  // no local image supplied
  curacao:       kit('cur'),

  // Group F
  netherlands:   kit('ned'),
  japan:         kit('jpn'),
  tunisia:       { home: null, away: null },  // no local image supplied
  sweden:        { home: null, away: null },  // no local image supplied

  // Group G
  belgium:       kit('bel'),
  iran:          kit('irn'),
  egypt:         kit('egy'),
  newzealand:    kit('nzl'),

  // Group H
  spain:         kit('esp'),
  uruguay:       kit('uru'),
  saudiarabia:   kit('ksa'),
  capeverde:     { home: null, away: null },  // no local image supplied

  // Group I
  france:        kit('fra'),
  senegal:       kit('sen'),
  norway:        { home: null, away: null },  // no local image supplied
  iraq:          { home: null, away: null },  // no local image supplied

  // Group J
  argentina:     kit('arg'),
  austria:       { home: null, away: null },  // no local image supplied
  algeria:       kit('alg'),
  jordan:        { home: null, away: null },  // no local image supplied

  // Group K
  portugal:      kit('por'),
  colombia:      kit('col'),
  uzbekistan:    kit('uzb'),
  drcongo:       kit('cod'),

  // Group L
  england:       kit('eng'),
  croatia:       kit('cro'),
  panama:        kit('pan'),
  ghana:         { home: null, away: null },  // no local image supplied
}
