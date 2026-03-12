'use client'
import Link from 'next/link'

export default function CTABanner() {
  return (
    <section className="section-shader section-shader-dark" style={{
      position: 'relative',
      width: '100%',
      background: 'var(--dark)',
      padding: '6rem 2rem',
      ['--shader-duration' as string]: '8s',
    } as React.CSSProperties}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(192,122,26,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        zIndex: 1,
      }}>
        {/* Title */}
        <h2 className="font-playfair" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          Ready to build the bridge?
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(250,246,238,0.65)',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
        }}>
          Join a global community making real impact. Whether you're offering skills or seeking support, your journey starts here.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link href="/login" className="btn-glow-amber" style={{
            padding: '1rem 2.5rem',
            borderRadius: '100px',
            background: 'var(--amber)',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '1.05rem',
          }}>
            Get Started — It's Free
          </Link>
          <a href="#contact" style={{
            padding: '1rem 2.5rem',
            borderRadius: '100px',
            background: 'transparent',
            border: '1.5px solid rgba(250,246,238,0.3)',
            color: 'var(--cream)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '1.05rem',
            transition: 'background 0.2s, border-color 0.2s',
          }} onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(250,246,238,0.08)'
            e.currentTarget.style.borderColor = 'rgba(250,246,238,0.5)'
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(250,246,238,0.3)'
          }}>
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
