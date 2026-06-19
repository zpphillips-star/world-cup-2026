/**
 * Wikimedia Commons authentic 2026 World Cup jersey kit URLs.
 * Keyed by team ID (matching Team.id in mockProvider).
 * home/away are direct PNG URLs or null if the file doesn't exist on Commons.
 * URL path is computed from MD5 hash of filename per Wikimedia's storage convention.
 * Verified 2026-06-19. null = file not yet uploaded to Wikimedia Commons.
 */
const BASE = 'https://upload.wikimedia.org/wikipedia/commons/'

export interface JerseyKit {
  home: string | null
  away: string | null
}

export const jerseyKits: Record<string, JerseyKit> = {
  // Group A
  mexico:        { home: BASE + 'b/b1/Kit_body_mex26h.png', away: BASE + 'b/b0/Kit_body_mex26a.png' },
  southkorea:    { home: BASE + 'e/eb/Kit_body_kor26h.png', away: BASE + 'f/f2/Kit_body_kor26a.png' },
  southafrica:   { home: BASE + 'e/e1/Kit_body_rsa26h.png', away: null },
  czechrepublic: { home: BASE + '5/59/Kit_body_cze26h.png', away: BASE + '0/0c/Kit_body_cze26a.png' },
  // Group B
  canada:        { home: BASE + '3/33/Kit_body_can26h.png', away: BASE + 'c/ce/Kit_body_can26a.png' },
  switzerland:   { home: BASE + '9/9e/Kit_body_sui26h.png', away: BASE + '8/8d/Kit_body_sui26a.png' },
  qatar:         { home: null,                               away: BASE + '9/9f/Kit_body_qat26a.png' },
  bosnia:        { home: BASE + 'd/d3/Kit_body_bih26h.png', away: BASE + 'a/a9/Kit_body_bih26a.png' },
  // Group C
  brazil:        { home: BASE + '5/5b/Kit_body_bra26h.png', away: BASE + '7/7b/Kit_body_bra26a.png' },
  morocco:       { home: BASE + 'd/d2/Kit_body_mar26h.png', away: BASE + '2/22/Kit_body_mar26a.png' },
  scotland:      { home: BASE + 'f/f7/Kit_body_sco26h.png', away: BASE + '5/50/Kit_body_sco26a.png' },
  haiti:         { home: BASE + '5/56/Kit_body_hai26h.png', away: null },
  // Group D
  usa:           { home: BASE + 'f/f5/Kit_body_usa26h.png', away: BASE + '8/8c/Kit_body_usa26a.png' },
  australia:     { home: BASE + 'd/d6/Kit_body_aus26h.png', away: BASE + '2/2e/Kit_body_aus26a.png' },
  paraguay:      { home: BASE + 'e/e8/Kit_body_par26h.png', away: BASE + '2/25/Kit_body_par26a.png' },
  turkey:        { home: BASE + '3/31/Kit_body_tur26h.png', away: BASE + 'e/e5/Kit_body_tur26a.png' },
  // Group E
  germany:       { home: null,                               away: BASE + '4/4d/Kit_body_ger26a.png' },
  ecuador:       { home: BASE + '1/16/Kit_body_ecu26h.png', away: BASE + 'd/da/Kit_body_ecu26a.png' },
  ivorycoast:    { home: BASE + 'a/a0/Kit_body_civ26h.png', away: BASE + '5/53/Kit_body_civ26a.png' },
  curacao:       { home: null,                               away: null },
  // Group F
  netherlands:   { home: BASE + 'e/ef/Kit_body_ned26h.png', away: BASE + 'e/ef/Kit_body_ned26a.png' },
  japan:         { home: null,                               away: null },
  tunisia:       { home: BASE + '1/15/Kit_body_tun26h.png', away: BASE + 'd/d9/Kit_body_tun26a.png' },
  sweden:        { home: null,                               away: BASE + 'a/a3/Kit_body_swe26a.png' },
  // Group G
  belgium:       { home: BASE + '0/04/Kit_body_bel26h.png', away: BASE + '3/3d/Kit_body_bel26a.png' },
  iran:          { home: BASE + '0/0b/Kit_body_irn26h.png', away: BASE + '6/6c/Kit_body_irn26a.png' },
  egypt:         { home: BASE + '8/84/Kit_body_egy26h.png', away: BASE + '6/61/Kit_body_egy26a.png' },
  newzealand:    { home: BASE + 'b/b4/Kit_body_nzl26h.png', away: BASE + '4/47/Kit_body_nzl26a.png' },
  // Group H
  spain:         { home: BASE + 'd/d5/Kit_body_esp26h.png', away: BASE + '1/15/Kit_body_esp26a.png' },
  uruguay:       { home: BASE + '9/93/Kit_body_uru26h.png', away: BASE + 'f/fe/Kit_body_uru26a.png' },
  saudiarabia:   { home: BASE + 'c/c4/Kit_body_ksa26h.png', away: BASE + '0/04/Kit_body_ksa26a.png' },
  capeverde:     { home: BASE + '0/00/Kit_body_cpv26h.png', away: BASE + '3/3b/Kit_body_cpv26a.png' },
  // Group I
  france:        { home: BASE + '5/58/Kit_body_fra26h.png', away: BASE + '0/0d/Kit_body_fra26a.png' },
  senegal:       { home: BASE + '8/88/Kit_body_sen26h.png', away: BASE + 'c/c3/Kit_body_sen26a.png' },
  norway:        { home: BASE + '1/18/Kit_body_nor26h.png', away: BASE + '7/75/Kit_body_nor26a.png' },
  iraq:          { home: BASE + '5/5b/Kit_body_irq26h.png', away: BASE + '4/4d/Kit_body_irq26a.png' },
  // Group J
  argentina:     { home: null,                               away: BASE + 'e/e8/Kit_body_arg26a.png' },
  austria:       { home: BASE + '9/95/Kit_body_aut26h.png', away: BASE + '1/1c/Kit_body_aut26a.png' },
  algeria:       { home: BASE + 'c/cc/Kit_body_alg26h.png', away: null },
  jordan:        { home: BASE + '3/35/Kit_body_jor26h.png', away: BASE + '9/9b/Kit_body_jor26a.png' },
  // Group K
  portugal:      { home: BASE + 'c/c0/Kit_body_por26h.png', away: BASE + '6/62/Kit_body_por26a.png' },
  colombia:      { home: null,                               away: null },
  uzbekistan:    { home: BASE + 'f/f3/Kit_body_uzb26h.png', away: BASE + '3/30/Kit_body_uzb26a.png' },
  drcongo:       { home: null,                               away: null },
  // Group L
  england:       { home: BASE + '8/85/Kit_body_eng26h.png', away: BASE + 'a/ae/Kit_body_eng26a.png' },
  croatia:       { home: BASE + 'f/f7/Kit_body_cro26h.png', away: BASE + 'b/be/Kit_body_cro26a.png' },
  panama:        { home: BASE + '4/4f/Kit_body_pan26h.png', away: BASE + '4/43/Kit_body_pan26a.png' },
  ghana:         { home: BASE + 'c/c1/Kit_body_gha26h.png', away: BASE + '4/4a/Kit_body_gha26a.png' },
}
