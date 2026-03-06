'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: '#9ca3af' }}>Sign in to your GazaBridge account</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }}
              placeholder="Your password"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link href="/join" style={{ color: '#d97706', fontWeight: 600 }}>Join free →</Link>
        </p>
      </div>
    </>
  )
}
