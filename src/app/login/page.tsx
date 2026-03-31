'use client'
import React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import GoogleSignInButton from '@/components/GoogleSignInButton'

function LoginContent() {
  const searchParams = useSearchParams()
  const intent = searchParams.get('intent')

  // Store intent in localStorage when component mounts
  if (intent && typeof window !== 'undefined') {
    localStorage.setItem('userIntent', intent)
  }

  // Show guest-specific title on login page
  const isGuestIntent = intent === 'guest'

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#EDE8DC',
      overflow: 'hidden',
    }}>
      {/* Shader Background */}
      <div aria-hidden="true" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse 85% 75% at 8% 15%, rgba(92,107,46,0.55) 0%, transparent 50%),
                     radial-gradient(ellipse 75% 85% at 92% 85%, rgba(192,122,26,0.48) 0%, transparent 50%),
                     radial-gradient(ellipse 65% 65% at 50% 50%, rgba(192,122,26,0.18) 0%, transparent 65%),
                     radial-gradient(ellipse 45% 45% at 78% 12%, rgba(92,107,46,0.30) 0%, transparent 50%)`,
        animation: 'shaderDrift 12s ease-in-out infinite alternate',
      }} />

      {/* Back Arrow */}
      <Link href="/" style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(192,122,26,0.2)',
        borderRadius: '50px',
        padding: '0.5rem 1.1rem',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        fontFamily: "'Playfair Display', serif",
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#3D3D2E',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
        e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
        e.currentTarget.style.transform = 'translateX(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
        e.currentTarget.style.borderColor = 'rgba(192,122,26,0.2)'
        e.currentTarget.style.transform = 'translateX(0)'
      }}>
        ← Back
      </Link>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        {/* Two-Panel Card */}
        <div style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(92,107,46,0.18), 0 8px 32px rgba(192,122,26,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }} className="login-card">
          {/* LEFT PANEL - Sign In Form */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRight: '1px solid rgba(255,255,255,0.4)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }} className="left-panel">
            {/* Logo */}
            <div style={{
              width: '200px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}>
              <Image
                src="/logo.png"
                alt="GazaBridge"
                width={200}
                height={80}
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* Title — changes for guest intent */}
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 4vw, 2.6rem)',
              fontWeight: 700,
              color: '#1A1A14',
              textAlign: 'center',
              marginTop: '0.6rem',
            }}>
              {isGuestIntent ? 'Browse GazaBridge' : 'Join GazaBridge'}
            </h1>

            {/* Subtitle — changes for guest intent */}
            <p style={{
              fontSize: '0.95rem',
              color: '#8A8572',
              textAlign: 'center',
              marginTop: '0.25rem',
            }}>
              {isGuestIntent
                ? 'Sign in with Google to explore — no profile needed'
                : 'Free · Takes 2 minutes · No password needed'}
            </p>

            {/* Guest info banner */}
            {isGuestIntent && (
              <div style={{
                background: 'rgba(92,107,46,0.07)',
                border: '1px solid rgba(92,107,46,0.2)',
                borderRadius: '14px',
                padding: '0.85rem 1.1rem',
                width: '100%',
                marginTop: '1rem',
                fontSize: '0.82rem',
                color: '#3D3D2E',
                lineHeight: 1.6,
              }}>
                🧭 As a guest you can browse volunteers, courses, and public resources. Create a profile anytime to connect.
              </div>
            )}

            {/* Google Sign In Button — now passes intent */}
            <div style={{ marginTop: '1.25rem', width: '100%' }}>
              <GoogleSignInButton
                label={isGuestIntent ? 'Continue as Guest / Visitor' : 'Continue with Google'}
                intent={intent || undefined}
              />
            </div>

            {/* Trust Line */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#8A8572',
              marginTop: '0.6rem',
            }}>
              ✅ Verified identity · Secure · One-click sign in
            </p>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              marginTop: '1.25rem',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(192,122,26,0.15)' }} />
              <span style={{ fontSize: '0.75rem', color: '#8A8572', whiteSpace: 'nowrap' }}>
                Why only Google?
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(192,122,26,0.15)' }} />
            </div>

            {/* Why Google Explanation */}
            <div style={{
              background: 'rgba(192,122,26,0.06)',
              border: '1px solid rgba(192,122,26,0.15)',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              width: '100%',
              marginTop: '0.75rem',
            }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#C07A1A',
                marginBottom: '0.4rem',
              }}>
                🔒 <span>Identity verified, community protected.</span>
              </p>
              <p style={{
                fontSize: '0.82rem',
                color: '#3D3D2E',
                lineHeight: 1.6,
              }}>
                Google sign-in ensures no fake accounts; protecting the people in Gaza who depend on this platform. No spam, no barriers.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL - Info / Social Proof */}
          <div style={{
            flex: 1,
            background: 'rgba(72,85,38,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
          }} className="right-panel">
            {/* Header */}
            <div>
              {/* Tag Pill */}
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '50px',
                padding: '0.3rem 1rem',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.85)',
                display: 'inline-block',
              }}>
                🌍 Connecting the world to Gaza
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.25,
                marginTop: '0.75rem',
              }}>
                Skills meet those who need them.
              </h2>

              {/* Subtitle */}
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                marginTop: '0.6rem',
              }}>
                A free bridge connecting volunteers worldwide with people in Gaza; teaching, mentorship, tech skills, and more.
              </p>
            </div>

            {/* Feature List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}>
              {[
                { title: '100% Free, Always', desc: 'No fees, no subscriptions, no hidden costs; ever.' },
                { title: 'Verified Volunteers', desc: 'Real people, real skills; identities confirmed via Google.' },
                { title: 'Direct Connection', desc: 'Message volunteers directly; no middlemen, no delays.' },
              ].map((f) => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', color: 'white', flexShrink: 0,
                  }}>✓</div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'white' }}>{f.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between', marginTop: '1.5rem' }}>
              {[
                { value: '11+', label: 'Volunteers' },
                { value: '11+', label: 'Help Requests' },
                { value: 'Free', label: 'Always' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.label}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div key={`div-${i}`} style={{ width: '1px', background: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @keyframes shaderDrift {
          0%   { opacity: 0.85; transform: scale(1) translate(0, 0); }
          50%  { opacity: 1;    transform: scale(1.03) translate(-8px, 6px); }
          100% { opacity: 0.9;  transform: scale(1.01) translate(4px, -4px); }
        }

        @media (max-width: 768px) {
          .login-card { flex-direction: column-reverse !important; }
          .right-panel { border-radius: 20px 20px 0 0 !important; border-right: none !important; padding: 2rem 1.5rem !important; }
          .left-panel { border-radius: 0 0 20px 20px !important; border-right: none !important; padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
