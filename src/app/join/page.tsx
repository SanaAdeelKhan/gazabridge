'use client'
import Navbar from '@/components/Navbar'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import Link from 'next/link'

export default function JoinPage() {
  return (
    <>
      <Navbar />
      <div style={{ width: '100%', padding: '60px 24px', boxSizing: 'border-box' as const }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🕊️</div>
            <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Join GazaBridge</h1>
            <p style={{ color: '#9ca3af' }}>Free · Takes 2 minutes · No password needed</p>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '24px' }}>
            <GoogleSignInButton label="Continue with Google" />
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', marginTop: '12px' }}>
              ✅ Verified identity · Trusted by volunteers worldwide
            </p>
          </div>

          <div style={{ background: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: '#92400e' }}>🔒 Why Google only?</div>
            <p style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
              We use Google sign-in to verify real identities and protect our community — especially the people in Gaza who depend on this platform. No fake accounts, no spam.
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#d97706', fontWeight: 600 }}>Sign in</Link>
          </p>

        </div>
      </div>
    </>
  )
}
