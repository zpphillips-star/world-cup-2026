import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050a1a',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
          border: '5px solid #c9a84c',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '10px',
                  height: '22px',
                  border: '4px solid #c9a84c',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  marginTop: '8px',
                  background: 'transparent',
                }}
              />
              <div
                style={{
                  width: '50px',
                  height: '42px',
                  background: 'linear-gradient(180deg, #e8c56a 0%, #c9a84c 60%, #a8883a 100%)',
                  borderRadius: '4px 4px 50% 50%',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '22px',
                  border: '4px solid #c9a84c',
                  borderLeft: 'none',
                  borderRadius: '0 6px 6px 0',
                  marginTop: '8px',
                  background: 'transparent',
                }}
              />
            </div>
            <div style={{ width: '10px', height: '14px', background: '#c9a84c' }} />
            <div
              style={{
                width: '40px',
                height: '7px',
                background: 'linear-gradient(180deg, #e8c56a 0%, #c9a84c 100%)',
                borderRadius: '2px',
              }}
            />
            <div
              style={{
                width: '52px',
                height: '7px',
                background: 'linear-gradient(180deg, #c9a84c 0%, #a8883a 100%)',
                borderRadius: '0 0 3px 3px',
                marginTop: '1px',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: 1,
              marginTop: '6px',
              fontFamily: 'sans-serif',
              letterSpacing: '-2px',
            }}
          >
            26
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
