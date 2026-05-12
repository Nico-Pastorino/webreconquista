import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          borderRadius: '6px',
          gap: '1px',
        }}
      >
        {/* R — lettermark dominante */}
        <span
          style={{
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          R
        </span>
        {/* QTA — completando la marca */}
        <span
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 7,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '0.18em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          QTA
        </span>
      </div>
    ),
    { ...size },
  )
}
