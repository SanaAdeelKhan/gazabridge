'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="section-shader section-shader-dark" style={{
      width: '100%',
      background: '#111109',
      padding: '4rem 2rem 2rem',
      ['--shader-duration' as string]: '20s',
    } as React.CSSProperties}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Main footer grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Column 1 - Logo & description */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              <img 
                src="/gazabridge-logo.png?v=2" 
                alt="GazaBridge" 
                loading="lazy"
                decoding="async"
                width="224"
                height="114"
                style={{ 
                  height: '114px', 
                  width: 'auto',
                  objectFit: 'contain',
                }} 
              />
            </Link>
            <p style={{
              color: 'rgba(250,246,238,0.55)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '1rem',
            }}>
              Connecting volunteers worldwide with people in Gaza. Free help, no barriers, real impact.
            </p>
            <p className="font-arabic" style={{
              color: 'rgba(250,246,238,0.3)',
              fontSize: '0.85rem',
              direction: 'rtl',
            }}>
              جسر يربط المتطوعين حول العالم بأهل غزة
            </p>
          </div>

          {/* Column 2 - Platform */}
          <div>
            <h4 style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(250,246,238,0.7)',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="#hiw" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                How it Works
              </a>
              <Link href="/volunteers" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Browse Volunteers
              </Link>
              <Link href="/needs" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Post a Need
              </Link>
              <Link href="/dashboard" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Dashboard
              </Link>
            </div>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(250,246,238,0.7)',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/how-it-works" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                About
              </Link>
              <Link href="/how-it-works" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Mission
              </Link>
              <a href="#contact" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Contact Us
              </a>
              <a href="#contact" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Press
              </a>
            </div>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(250,246,238,0.7)',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="#" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Privacy Policy
              </a>
              <a href="#" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Terms of Service
              </a>
              <a href="#" style={{
                color: 'rgba(250,246,238,0.45)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.45)'}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'rgba(250,246,238,0.07)',
          marginBottom: '2rem',
        }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{
            color: 'rgba(250,246,238,0.4)',
            fontSize: '0.85rem',
          }}>
            © 2025 GazaBridge. Made with ♥ for the people of Gaza.
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#" style={{
              color: 'rgba(250,246,238,0.4)',
              fontSize: '1.25rem',
              transition: 'color 0.2s',
            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.4)'}>
              𝕏
            </a>
            <a href="#" style={{
              color: 'rgba(250,246,238,0.4)',
              fontSize: '1.25rem',
              transition: 'color 0.2s',
            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.4)'}>
              📷
            </a>
            <a href="https://www.linkedin.com/company/gazabridge/" target="_blank" rel="noopener noreferrer" aria-label="GazaBridge on LinkedIn" style={{
              color: 'rgba(250,246,238,0.4)',
              fontSize: '1.25rem',
              transition: 'color 0.2s',
            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber-light)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250,246,238,0.4)'}>
              in
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
          footer > div > div:last-child {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  )
}
