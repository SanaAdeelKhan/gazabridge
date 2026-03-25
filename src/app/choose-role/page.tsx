'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function ChooseRolePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [visitorCount, setVisitorCount] = useState<number | null>(null)

  // If not logged in at all, send to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load visitor counter from localStorage (simple client-side counter)
  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('gb_visitor_count') || '0', 10)
      setVisitorCount(count)
    } catch {
      setVisitorCount(0)
    }
  }, [])

  function handleVolunteer() {
    // Clear any guest flag, go to complete-profile with volunteer intent
    localStorage.removeItem('gb_guest')
    localStorage.setItem('userIntent', 'volunteer')
    router.push('/complete-profile')
  }

  function handleSeeker() {
    // Clear any guest flag, go to complete-profile with seeker intent
    localStorage.removeItem('gb_guest')
    localStorage.setItem('userIntent', 'seeker')
    router.push('/complete-profile')
  }

  function handleGuest() {
    // Increment visitor counter
    try {
      const count = parseInt(localStorage.getItem('gb_visitor_count') || '0', 10)
      localStorage.setItem('gb_visitor_count', String(count + 1))
      localStorage.setItem('gb_guest', 'true')
    } catch { /* ignore */ }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", color: '#8A8572', fontSize: '1rem' }}>Loading…</div>
      </div>
    )
  }

  const cards = [
    {
      id: 'volunteer',
      emoji: '🙌',
      title: 'I want to volunteer',
      subtitle: 'Offer my skills for free',
      description: 'Teach English, coding, career advice, or anything else you know — directly to people in Gaza.',
      color: '#5C6B2E',
      colorLight: 'rgba(92,107,46,0.08)',
      colorBorder: 'rgba(92,107,46,0.3)',
      colorShadow: 'rgba(92,107,46,0.2)',
      onClick: handleVolunteer,
    },
    {
      id: 'seeker',
      emoji: '🌟',
      title: 'I need support',
      subtitle: 'Get help from volunteers',
      description: 'Connect with skilled volunteers who want to help you learn, grow, and build a better future.',
      color: '#C07A1A',
      colorLight: 'rgba(192,122,26,0.08)',
      colorBorder: 'rgba(192,122,26,0.3)',
      colorShadow: 'rgba(192,122,26,0.2)',
      onClick: handleSeeker,
    },
    {
      id: 'guest',
      emoji: '🧭',
      title: 'Guest / Visitor',
      subtitle: 'Explore without a profile',
      description: 'Browse volunteers, courses, and resources. Create a profile anytime to connect.',
      color: '#8A8572',
      colorLight: 'rgba(138,133,114,0.06)',
      colorBorder: 'rgba(138,133,114,0.25)',
      colorShadow: 'rgba(138,133,114,0.15)',
      onClick: handleGuest,
    },
  ]

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#EDE8DC',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Shader Background */}
      <div aria-hidden="true" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 85% 75% at 8% 15%, rgba(92,107,46,0.45) 0%, transparent 50%),
          radial-gradient(ellipse 75% 85% at 92% 85%, rgba(192,122,26,0.38) 0%, transparent 50%),
          radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,122,26,0.12) 0%, transparent 65%)
        `,
        animation: 'shaderDrift 12s ease-in-out infinite alternate',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '0.5rem' }}>
          <Image src="/logo.png" alt="GazaBridge" width={160} height={64} style={{ objectFit: 'contain' }} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: '#1A1A14',
          textAlign: 'center',
          marginBottom: '0.4rem',
        }}>
          Welcome to GazaBridge
        </h1>

        <p style={{
          color: '#8A8572',
          fontSize: '1rem',
          textAlign: 'center',
          marginBottom: '0.35rem',
          maxWidth: '420px',
        }}>
          You&apos;re signed in with Google. How would you like to join?
        </p>

        {/* Visitor counter pill */}
        {visitorCount !== null && visitorCount > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '50px',
            padding: '0.3rem 1rem',
            fontSize: '0.78rem',
            color: '#8A8572',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}>
            👁️ {visitorCount.toLocaleString()} visitor{visitorCount !== 1 ? 's' : ''} have browsed GazaBridge
          </div>
        )}

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '860px',
          width: '100%',
          marginTop: visitorCount && visitorCount > 0 ? '0' : '1.5rem',
        }}>
          {cards.map((card) => {
            const isHovered = hovered === card.id
            return (
              <button
                key={card.id}
                onClick={card.onClick}
                onMouseEnter={() => setHovered(card.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  flex: '1 1 220px',
                  maxWidth: '260px',
                  background: isHovered ? card.colorLight : 'rgba(255,255,255,0.72)',
                  border: isHovered
                    ? `2px solid ${card.colorBorder}`
                    : '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '24px',
                  padding: '1.75rem 1.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  boxShadow: isHovered
                    ? `0 16px 48px ${card.colorShadow}, 0 4px 16px rgba(0,0,0,0.06)`
                    : '0 8px 32px rgba(92,107,46,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.25s ease',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>{card.emoji}</div>

                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1A1A14',
                  marginBottom: '0.2rem',
                }}>
                  {card.title}
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: card.color,
                  marginBottom: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {card.subtitle}
                </div>

                <div style={{
                  fontSize: '0.875rem',
                  color: '#6B6855',
                  lineHeight: 1.55,
                }}>
                  {card.description}
                </div>

                {/* Arrow indicator on hover */}
                <div style={{
                  marginTop: '1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: card.color,
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateX(0)' : 'translateX(-6px)',
                  transition: 'all 0.2s ease',
                }}>
                  {card.id === 'guest' ? 'Explore as guest →' : 'Get started →'}
                </div>
              </button>
            )
          })}
        </div>

        {/* Fine print */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.78rem',
          color: '#B0AA96',
          textAlign: 'center',
          maxWidth: '380px',
        }}>
          You can always create a full profile later. GazaBridge is 100% free, always.
        </p>
      </div>

      <style jsx>{`
        @keyframes shaderDrift {
          0%   { opacity: 0.85; transform: scale(1) translate(0, 0); }
          50%  { opacity: 1;    transform: scale(1.03) translate(-8px, 6px); }
          100% { opacity: 0.9;  transform: scale(1.01) translate(4px, -4px); }
        }
        @media (max-width: 640px) {
          button { max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
