'use client'
import Navbar from '@/components/Navbar'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  return (
    <div style={{ width: '100%', padding: '60px 24px', boxSizing: 'border-box' as const }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🕊️</div>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: '#9ca3af' }}>Sign in to your GazaBridge account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '24px' }}>
          <GoogleSignInButton label="Continue with Google" />
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', marginTop: '12px' }}>
            ✅ Secure · Verified identity · One click
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Don't have an account?{' '}
          <Link href="/join" style={{ color: '#d97706', fontWeight: 600 }}>Join free →</Link>
        </p>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </>
  )
}
