import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#060e20',
          width: '192px',
          height: '192px',
          borderRadius: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Bold gold "26" — the main shape */}
        <div
          style={{
            fontSize: '140px',
            fontWeight: '900',
            color: '#c9a84c',
            fontFamily: 'sans-serif',
            letterSpacing: '-10px',
            lineHeight: '1',
            display: 'flex',
            position: 'absolute',
          }}
        >
          26
        </div>

        {/* Trophy silhouette in background color — punches through the gold as negative space */}
        <svg
          width="54"
          height="72"
          viewBox="0 0 54 72"
          style={{ position: 'absolute', top: '56px', left: '69px' }}
        >
          {/* Cup bowl + body */}
          <path
            d="M27 2C39 2 49 9 49 22L47 36C43 45 36 51 34 57L33 65L41 65L41 70L13 70L13 65L21 65L20 57C18 51 11 45 7 36L5 22C5 9 15 2 27 2Z"
            fill="#060e20"
          />
          {/* Left handle */}
          <path
            d="M5 22C2 22 0 25 0 29C0 34 2 37 7 36"
            fill="none"
            stroke="#060e20"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Right handle */}
          <path
            d="M49 22C52 22 54 25 54 29C54 34 52 37 47 36"
            fill="none"
            stroke="#060e20"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
