// FlagImg.tsx — Renders flags as real images from flagcdn.com
// Emoji flags are broken on Android Chrome/Samsung browser for many countries.
// Falls back to emoji if image fails or teamId is unknown.

const CODES: Record<string, string> = {
  // Group A
  mexico:        'mx',
  southkorea:    'kr',
  southafrica:   'za',
  czechrepublic: 'cz',
  // Group B
  canada:        'ca',
  switzerland:   'ch',
  qatar:         'qa',
  bosnia:        'ba',
  // Group C
  brazil:        'br',
  morocco:       'ma',
  scotland:      'gb-sct',
  haiti:         'ht',
  // Group D
  usa:           'us',
  australia:     'au',
  paraguay:      'py',
  turkey:        'tr',
  // Group E
  germany:       'de',
  ecuador:       'ec',
  ivorycoast:    'ci',
  curacao:       'cw',
  // Group F
  netherlands:   'nl',
  japan:         'jp',
  tunisia:       'tn',
  sweden:        'se',
  // Group G
  belgium:       'be',
  iran:          'ir',
  egypt:         'eg',
  newzealand:    'nz',
  // Group H
  spain:         'es',
  uruguay:       'uy',
  saudiarabia:   'sa',
  capeverde:     'cv',
  // Group I
  france:        'fr',
  senegal:       'sn',
  norway:        'no',
  iraq:          'iq',
  // Group J
  argentina:     'ar',
  austria:       'at',
  algeria:       'dz',
  jordan:        'jo',
  // Group K
  portugal:      'pt',
  colombia:      'co',
  uzbekistan:    'uz',
  drcongo:       'cd',
  // Group L
  england:       'gb-eng',
  croatia:       'hr',
  panama:        'pa',
  ghana:         'gh',
}

interface Props {
  teamId: string
  fallback?: string   // emoji shown if no code found or image errors
  className?: string  // Tailwind sizing, e.g. "h-5 w-auto"
}

export function FlagImg({ teamId, fallback = '🏳️', className = 'h-5 w-auto' }: Props) {
  const code = CODES[teamId]

  if (!code) {
    // Bracket placeholders ("1st-group-a" etc.) — just show the emoji/trophy
    return <span className="leading-none">{fallback}</span>
  }

  // Wrap in a fixed-ratio container so all flags look like proper flag rectangles.
  // object-cover crops to fill — consistent shape regardless of the flag's natural ratio
  // (fixes Qatar 28:11 being huge, Switzerland 1:1 being square, etc.)
  return (
    <span
      className={`inline-block flex-shrink-0 overflow-hidden rounded-[2px] ${className}`}
      style={{ aspectRatio: '3/2' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
        alt={teamId}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </span>
  )
}

