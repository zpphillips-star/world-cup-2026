import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050a1a',
          width: '192px',
          height: '192px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '5px solid #c9a84c',
          boxShadow: '0 0 0 2px #050a1a, 0 0 0 4px #c9a84c',
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
                  width: '52px',
                  height: '44px',
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
            <div style={{ width: '10px', height: '16px', background: '#c9a84c' }} />
            <div
              style={{
                width: '42px',
                height: '7px',
                background: 'linear-gradient(180deg, #e8c56a 0%, #c9a84c 100%)',
                borderRadius: '2px',
              }}
            />
            <div
              style={{
                width: '54px',
                height: '7px',
                background: 'linear-gradient(180deg, #c9a84c 0%, #a8883a 100%)',
                borderRadius: '0 0 3px 3px',
                marginTop: '1px',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '42px',
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
