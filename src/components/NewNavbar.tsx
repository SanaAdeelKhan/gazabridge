'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NewNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      zIndex: 1000,
      background: scrolled ? 'rgba(250,246,238,0.88)' : 'rgba(250,246,238,0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: scrolled ? '1px solid rgba(92,107,46,0.15)' : '1px solid rgba(250,246,238,0.25)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        height: '100%',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/gazabridge-logo.png?v=2" 
            alt="GazaBridge" 
            loading="eager"
            decoding="async"
            width="192"
            height="48"
            style={{ 
              height: '120px', 
              width: 'auto',
              objectFit: 'contain',
            }} 
          />
        </Link>

        {/* Center nav - desktop only */}
        {isDesktop && (
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <a href="#hiw" style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '1rem',
            fontWeight: 500,
            position: 'relative',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark)'}>
            How it Works
          </a>
          <a href="#contact" style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '1rem',
            fontWeight: 500,
            position: 'relative',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark)'}>
            Contact Us
          </a>
        </div>
        )}

        {/* Right side - Get Started button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isDesktop && (
          <div style={{ gap: '0.75rem', display: 'flex' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Link href="/login" className="btn-glow-amber" style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                background: 'var(--amber)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1,
              }}>
                Get Started
              </Link>
              <span style={{
                position: 'absolute',
                inset: '-3px',
                borderRadius: '100px',
                border: '2px solid rgba(192,122,26,0.4)',
                animation: 'pulseRing 2s ease infinite',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
          )}
          
          {/* Mobile menu button */}
          {!isDesktop && (
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--dark)',
          }}>
            {menuOpen ? '✕' : '☰'}
          </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && !isDesktop && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          background: 'rgba(250,246,238,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(92,107,46,0.15)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <a href="#hiw" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '0.5rem 0',
          }}>
            How it Works
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '0.5rem 0',
          }}>
            Contact Us
          </a>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none',
            color: 'var(--amber)',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 0',
          }}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}
