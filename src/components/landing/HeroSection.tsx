'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  useEffect(() => {
    const elements = document.querySelectorAll('.hero-animate')
    elements.forEach((el, i) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'translateY(0)'
      }, i * 150)
    })
  }, [])

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      paddingBottom: '5rem',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Video Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            willChange: 'transform',
            zIndex: 0,
          }}
        >
          <source src="/Hero-Section-BG.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Warm overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'linear-gradient(160deg, rgba(26, 26, 20, 0.75) 0%, rgba(92, 107, 46, 0.40) 50%, rgba(192, 122, 26, 0.35) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '820px',
        textAlign: 'center',
        padding: '0 2rem',
        paddingTop: '92px',
      }}>
        {/* Badge */}
        <div className="hero-animate" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(250,246,238,0.12)',
          border: '1px solid rgba(250,246,238,0.25)',
          backdropFilter: 'blur(8px)',
          borderRadius: '100px',
          padding: '0.5rem 1.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '1.5rem',
          color: '#FAF6EE',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}>
          🕊 FREE SERVICES · NO BARRIERS · REAL HELP
        </div>

        {/* H1 */}
        <h1 className="font-playfair hero-animate" style={{
          fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
          fontWeight: 900,
          color: '#FAF6EE',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}>
          Where <em style={{ fontStyle: 'italic', color: 'var(--amber-light)' }}>skills</em> meet those who need them
        </h1>

        {/* Subtitle */}
        <p className="hero-animate" style={{
          fontSize: '1.05rem',
          color: 'rgba(250,246,238,0.78)',
          lineHeight: 1.6,
          marginBottom: '0.75rem',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}>
          A bridge connecting volunteers worldwide with people in Gaza — offering free teaching, mentorship, tech skills, and more.
        </p>

        {/* Arabic line */}
        <p className="font-arabic hero-animate" style={{
          fontSize: '1.1rem',
          color: 'rgba(250,246,238,0.55)',
          marginBottom: '2.5rem',
          direction: 'rtl',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}>
          جسر يربط المتطوعين حول العالم بأهل غزة
        </p>

        {/* Buttons */}
        <div className="hero-animate" style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}>
          <Link href="/login?intent=volunteer" className="btn-glow-amber" style={{
            padding: '0.875rem 2rem',
            borderRadius: '100px',
            background: 'var(--amber)',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '1rem',
          }}>
            🤝 I Want to Help
          </Link>
          <Link href="/login?intent=need" className="btn-glow-olive" style={{
            padding: '0.875rem 2rem',
            borderRadius: '100px',
            background: 'var(--olive)',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '1rem',
          }}>
            🌟 I Need Support
          </Link>

          {/* Guest / Visitor button - no login required */}
          <button
            onClick={() => {
              try { localStorage.setItem('gb_guest', 'true') } catch { /* ignore */ }
              window.location.href = '/dashboard'
            }}
            style={{
              padding: '0.875rem 2rem',
              borderRadius: '100px',
              background: 'rgba(250,246,238,0.15)',
              color: '#FAF6EE',
              fontWeight: 600,
              fontSize: '1rem',
              border: '1.5px solid rgba(250,246,238,0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(250,246,238,0.25)'
              e.currentTarget.style.borderColor = 'rgba(250,246,238,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(250,246,238,0.15)'
              e.currentTarget.style.borderColor = 'rgba(250,246,238,0.35)'
            }}
          >
            🧭 Guest / Visitor
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(250,246,238,0.55)',
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '1px',
          height: '36px',
          background: 'linear-gradient(to bottom, rgba(250,246,238,0.5), transparent)',
          animation: 'scrollPulse 2s ease infinite',
        }} />
        <span>SCROLL</span>
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.75); }
        }
      `}</style>
    </section>
  )
}
