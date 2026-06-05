import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1b3e 0%, #0a4d2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div style={{ fontSize: 110, display: 'flex', lineHeight: 1 }}>⚽</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: 'white',
            letterSpacing: 3,
            fontFamily: 'Arial Black, Arial, sans-serif',
            marginTop: 6,
          }}
        >
          WC26
        </div>
      </div>
    ),
    { ...size }
  )
}
