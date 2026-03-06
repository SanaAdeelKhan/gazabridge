'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'volunteer'
  const [role, setRole] = useState<'volunteer' | 'seeker'>(defaultRole as 'volunteer' | 'seeker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', country: '', contact: '',
    category: '', description: '', availability: '', languages: [] as string[],
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleLang = (lang: string) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId, name: form.name, role, country: form.country, contact: form.contact, languages: form.languages,
      })
      if (profileError) throw profileError
      if (role === 'volunteer') {
        const { error: offerError } = await supabase.from('offers').insert({
          user_id: userId, category: form.category, description: form.description, availability: form.availability, tags: [],
        })
        if (offerError) throw offerError
      } else {
        const { error: reqError } = await supabase.from('requests').insert({
          user_id: userId, category: form.category, description: form.description, tags: [],
        })
        if (reqError) throw reqError
      }
      router.push(role === 'volunteer' ? '/volunteers' : '/needs')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const langs = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German']
  const categories = role === 'volunteer'
    ? ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring']
    : ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills']

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #e5e7eb', fontSize: '0.95rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff',
  }
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', color: '#1a1a2e' }
  const cardStyle = { background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '20px' }
  const cardTitleStyle = { fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', color: '#1a1a2e' }

  return (
    <div style={{ width: '100%', padding: '60px 24px', boxSizing: 'border-box' as const }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Join GazaBridge</h1>
          <p style={{ color: '#9ca3af' }}>Free · Takes 2 minutes</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {(['volunteer', 'seeker'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '24px 20px', borderRadius: '20px', cursor: 'pointer', textAlign: 'left',
              border: role === r ? '2px solid #d97706' : '2px solid #e5e7eb',
              background: role === r ? '#fffbeb' : '#fff', transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{r === 'volunteer' ? '🙌' : '🌟'}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{r === 'volunteer' ? 'I want to help' : 'I need support'}</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{r === 'volunteer' ? 'Offer your skills for free' : 'Get help from volunteers'}</div>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Account */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>1. Your account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="Your name" />
            </div>
            <div>
              <label style={labelStyle}>{role === 'volunteer' ? 'Country' : 'Location'}</label>
              <input value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} placeholder={role === 'volunteer' ? 'Where are you based?' : 'e.g. Gaza City'} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="text" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="your@email.com" />
          </div>
          <div style={{ marginBottom: role === 'seeker' ? '16px' : '0' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} placeholder="Min 6 characters" />
          </div>
          {role === 'seeker' && (
            <div>
              <label style={labelStyle}>Contact (WhatsApp / Telegram)</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)} style={inputStyle} placeholder="How can volunteers reach you?" />
            </div>
          )}
        </div>

        {/* Offer/Need */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>2. {role === 'volunteer' ? 'Your offer' : 'Your request'}</div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: role === 'volunteer' ? '16px' : '0' }}>
            <label style={labelStyle}>
              {role === 'volunteer' ? 'Describe what you can offer' : 'Describe what you need'}
              <span className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.8rem', marginRight: '8px', fontWeight: 400 }}> — يمكنك الكتابة بالعربية</span>
            </label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' as const }}
              placeholder={role === 'volunteer' ? 'e.g. I can teach 10 people English via weekly Zoom sessions...' : 'e.g. أريد تعلم اللغة الإنجليزية للدراسة في الخارج...'} />
          </div>
          {role === 'volunteer' && (
            <div>
              <label style={labelStyle}>Availability per week</label>
              <select value={form.availability} onChange={e => set('availability', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">Select availability</option>
                <option>1–2 hours/week</option>
                <option>3–5 hours/week</option>
                <option>5–10 hours/week</option>
                <option>10+ hours/week</option>
              </select>
            </div>
          )}
        </div>

        {/* Languages */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>3. Languages</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {langs.map(l => (
              <button key={l} onClick={() => toggleLang(l)} style={{
                padding: '8px 18px', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer',
                border: form.languages.includes(l) ? '2px solid #d97706' : '2px solid #e5e7eb',
                background: form.languages.includes(l) ? '#d97706' : '#fff',
                color: form.languages.includes(l) ? '#fff' : '#374151',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: '100px',
          background: loading ? '#f59e0b' : '#d97706', color: '#fff',
          border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          transition: 'all 0.2s', marginBottom: '16px', fontFamily: 'inherit',
        }}>
          {loading ? 'Creating your account...' : `Join as ${role === 'volunteer' ? 'Volunteer 🙌' : 'Member 🌟'}`}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#d97706' }}>Sign in</Link>
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
