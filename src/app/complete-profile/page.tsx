'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'German', 'Turkish', 'Urdu', 'Other']
const COUNTRIES = ['United States','United Kingdom','Canada','Australia','Germany','France','Turkey','Jordan','Egypt','UAE','Qatar','Kuwait','Saudi Arabia','Malaysia','Indonesia','Pakistan','India','Other']

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    role: 'volunteer' as 'volunteer' | 'gaza_resident',
    country: '',
    contact: '',
    linkedin: '',
    languages: [] as string[],
    otherLanguage: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid #d1d5db', borderRadius:'8px', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.875rem', fontWeight:600, color:'#374151', marginBottom:'0.4rem' }

  const toggleLanguage = (lang: string) => {
    setForm(f => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang] }))
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    const finalLanguages = form.languages.includes('Other') && form.otherLanguage
      ? [...form.languages.filter(l => l !== 'Other'), form.otherLanguage]
      : form.languages
    const { error: err } = await supabase.from('profiles').insert({
      id: user.id, name: form.name, role: form.role, country: form.country,
      contact: form.contact, linkedin: form.linkedin, languages: finalLanguages,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f9f0,#e8f5e9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'2.5rem', maxWidth:'560px', width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:'#166534', marginBottom:'0.5rem' }}>Complete Your Profile</h1>
        <p style={{ color:'#6b7280', marginBottom:'1.5rem', fontSize:'0.95rem' }}>Just a few more details to get started.</p>
        {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'0.75rem', color:'#dc2626', marginBottom:'1rem' }}>{error}</div>}
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>I am a…</label>
          <div style={{ display:'flex', gap:'1rem' }}>
            {(['volunteer','gaza_resident'] as const).map(r => (
              <label key={r} style={{ display:'flex', alignItems:'center', gap:'0.4rem', cursor:'pointer' }}>
                <input type="radio" name="role" checked={form.role === r} onChange={() => setForm(f => ({ ...f, role: r }))} />
                {r === 'volunteer' ? 'Volunteer' : 'Gaza Resident'}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Country</label>
          <select style={inputStyle} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
            <option value="">Select country…</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Contact (WhatsApp / Telegram / email)</label>
          <input style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="+1234567890 or @username" />
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>LinkedIn (optional)</label>
          <input style={inputStyle} value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div style={{ marginBottom:'1.5rem' }}>
          <label style={labelStyle}>Languages</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
            {LANGUAGES.map(lang => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)} style={{ padding:'0.35rem 0.85rem', borderRadius:'999px', border:'1.5px solid', borderColor: form.languages.includes(lang) ? '#16a34a' : '#d1d5db', background: form.languages.includes(lang) ? '#dcfce7' : 'white', color: form.languages.includes(lang) ? '#166534' : '#374151', cursor:'pointer', fontSize:'0.85rem', fontWeight:500 }}>
                {lang}
              </button>
            ))}
          </div>
          {form.languages.includes('Other') && (
            <input style={{ ...inputStyle, marginTop:'0.5rem' }} placeholder="Specify language…" value={form.otherLanguage} onChange={e => setForm(f => ({ ...f, otherLanguage: e.target.value }))} />
          )}
        </div>
        <button onClick={handleSubmit} disabled={loading || !form.name || !form.country || !form.contact} style={{ width:'100%', padding:'0.8rem', background: loading ? '#86efac' : '#16a34a', color:'white', border:'none', borderRadius:'8px', fontSize:'1rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : 'Complete Profile →'}
        </button>
      </div>
    </div>
  )
}
