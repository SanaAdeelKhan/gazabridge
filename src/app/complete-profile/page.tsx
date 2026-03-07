'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const LANGUAGES = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German', 'Other']
const COUNTRIES = ['United States','United Kingdom','Canada','Australia','Germany','France','Turkey','Jordan','Egypt','UAE','Qatar','Kuwait','Saudi Arabia','Malaysia','Indonesia','Pakistan','India','Gaza / Palestine','Other']

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    is_volunteer: false,
    is_seeker: false,
    country: '',
    contact: '',
    linkedin: '',
    languages: [] as string[],
    otherLanguage: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = { width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1.5px solid #e5e7eb', fontSize:'0.95rem', outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:'#fff' }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.875rem', fontWeight:600, color:'#374151', marginBottom:'6px' }

  const toggleLang = (lang: string) => {
    setForm(f => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang] }))
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!form.is_volunteer && !form.is_seeker) { setError('Please select at least one role.'); return }
    setLoading(true)
    setError('')

    const finalLanguages = form.languages.includes('Other') && form.otherLanguage
      ? [...form.languages.filter(l => l !== 'Other'), form.otherLanguage]
      : form.languages

    // legacy role field: if both, use 'volunteer'; individual booleans are the source of truth
    const role = form.is_volunteer ? 'volunteer' : 'gaza_resident'

    const { error: err } = await supabase.from('profiles').upsert({
      id: user.id,
      name: form.name,
      role,
      is_volunteer: form.is_volunteer,
      is_seeker: form.is_seeker,
      country: form.country,
      contact: form.contact,
      linkedin: form.linkedin,
      languages: finalLanguages,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const roleCard = (key: 'is_volunteer' | 'is_seeker', emoji: string, title: string, desc: string, activeColor: string, activeBg: string) => (
    <button
      type="button"
      onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
      style={{
        padding: '24px 20px', borderRadius: '20px', cursor: 'pointer', textAlign: 'left' as const, width: '100%',
        border: form[key] ? `2px solid ${activeColor}` : '2px solid #e5e7eb',
        background: form[key] ? activeBg : '#fff', transition: 'all 0.2s', fontFamily: 'inherit',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: '#1a1a2e' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{desc}</div>
      {form[key] && <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: activeColor }}>✓ Selected</div>}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', padding: '48px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Complete Your Profile</h1>
          <p style={{ color: '#9ca3af' }}>Tell us a bit about yourself — takes 1 minute</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Role selection — can pick BOTH */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>What brings you here?</div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>You can select both — many people want to help AND get help!</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {roleCard('is_volunteer', '🙌', 'I want to help', 'Offer my skills for free', '#d97706', '#fffbeb')}
            {roleCard('is_seeker', '🌟', 'I need support', 'Get help from volunteers', '#16a34a', '#f0fdf4')}
          </div>
        </div>

        {/* Basic info */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
          </div>
          <div>
            <label style={labelStyle}>{form.is_seeker && !form.is_volunteer ? 'Location (e.g. Gaza City)' : 'Country'}</label>
            <input style={inputStyle} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder={form.is_seeker && !form.is_volunteer ? 'e.g. Gaza City' : 'Where are you based?'} />
          </div>
          <div>
            <label style={labelStyle}>Contact <span style={{ fontWeight: 400, color: '#9ca3af' }}>(WhatsApp / Telegram / email)</span></label>
            <input style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="+1234567890 or @username" />
          </div>
          <div>
            <label style={labelStyle}>LinkedIn <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional — builds trust)</span></label>
            <input style={inputStyle} value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/yourname" />
          </div>
        </div>

        {/* Languages */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, fontSize: '1rem', marginBottom: '14px' }}>Languages you speak</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {LANGUAGES.map(lang => (
              <button key={lang} type="button" onClick={() => toggleLang(lang)} style={{
                padding: '8px 18px', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                border: form.languages.includes(lang) ? '2px solid #d97706' : '2px solid #e5e7eb',
                background: form.languages.includes(lang) ? '#d97706' : '#fff',
                color: form.languages.includes(lang) ? '#fff' : '#374151',
                transition: 'all 0.2s',
              }}>{lang}</button>
            ))}
          </div>
          {form.languages.includes('Other') && (
            <input style={{ ...inputStyle, marginTop: '12px' }} placeholder="Specify language…" value={form.otherLanguage} onChange={e => setForm(f => ({ ...f, otherLanguage: e.target.value }))} />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name || !form.country}
          style={{ width: '100%', padding: '16px', background: loading ? '#f59e0b' : '#d97706', color: 'white', border: 'none', borderRadius: '100px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Saving…' : 'Go to Dashboard →'}
        </button>

      </div>
    </div>
  )
}
