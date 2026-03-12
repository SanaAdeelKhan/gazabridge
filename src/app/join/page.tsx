'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import GoogleSignInButton from '@/components/GoogleSignInButton'

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as 'volunteer' | 'seeker' | null

  useEffect(() => {
    // If user is already logged in, they should go through /login which handles auth
    // This page is for new users to choose their role before signing up
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--warm-white)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#fff',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/gazabridge-logo.png?v=2" 
            alt="GazaBridge" 
            style={{ 
              height: '80px', 
              width: 'auto',
              objectFit: 'contain',
            }} 
          />
        </div>

        <h1 className="font-cormorant" style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--dark)',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Join GazaBridge
        </h1>

        <p style={{
          color: 'var(--muted)',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Sign in with Google to get started
        </p>

        {/* Google Sign In */}
        <div style={{ marginBottom: '2rem' }}>
          <GoogleSignInButton />
        </div>

        {/* Info box */}
        <div style={{
          background: 'rgba(92,107,46,0.08)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--dark)', lineHeight: 1.6 }}>
            ✓ Always free · ✓ No barriers · ✓ Direct connections
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{
            color: 'var(--muted)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}>
            ← Back to Home
          </a>
          <span style={{ margin: '0 0.75rem', color: 'var(--muted)' }}>·</span>
          <a href="/login" style={{
            color: 'var(--muted)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}>
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <JoinContent />
    </Suspense>
  )
}

