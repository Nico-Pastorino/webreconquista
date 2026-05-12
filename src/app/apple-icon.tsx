import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          background: 'linear-gradient(160deg, #161616 0%, #0a0a0a 100%)',
          borderRadius: '36px',
          gap: '0px',
        }}
      >
        {/* STORE — eyebrow pequeño */}
        <span
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.38em',
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          STORE
        </span>

        {/* Línea separadora sutil */}
        <div
          style={{
            width: '48px',
            height: '1px',
            background: 'rgba(255,255,255,0.12)',
            marginTop: '10px',
            marginBottom: '10px',
          }}
        />

        {/* RQTA — marca dominante */}
        <span
          style={{
            color: '#ffffff',
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: '0.04em',
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          RQTA
        </span>
      </div>
    ),
    { ...size },
  )
}
