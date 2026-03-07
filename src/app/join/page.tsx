'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import GoogleSignInButton from '@/components/GoogleSignInButton'

function JoinForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      })
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')
      router.push('/complete-profile')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #e5e7eb', fontSize: '0.95rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, background: '#fff',
  }
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', color: '#1a1a2e' }

  return (
    <div style={{ width: '100%', padding: '60px 24px', boxSizing: 'border-box' as const }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Join GazaBridge</h1>
          <p style={{ color: '#9ca3af' }}>Free · Takes 2 minutes</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Google — big and primary */}
        <div style={{ marginBottom: '16px' }}>
          <GoogleSignInButton label="Join with Google — Recommended" />
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', marginTop: '8px' }}>
            ✅ Verified identity · No password needed · Trusted by volunteers
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Email — secondary, collapsed by default */}
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign up with email instead
          </button>
        ) : (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="Your name" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="your@email.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} placeholder="Min 6 characters" />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#d97706', fontWeight: 600 }}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Loading...</div>}>
        <JoinForm />
      </Suspense>
    </>
  )
}
