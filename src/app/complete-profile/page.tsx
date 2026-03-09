'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const LANGUAGES = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German', 'Other']
const VOLUNTEER_CATEGORIES = ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring', '🌐 Other']
const SEEKER_CATEGORIES = ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills', '🌐 Other']

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [role, setRole] = useState({ is_volunteer: false, is_seeker: false })
  const [details, setDetails] = useState({ name: user?.user_metadata?.full_name || '', country: '', whatsapp: '', linkedin: '', languages: [] as string[], otherLanguage: '' })
  const [offer, setOffer] = useState({ category: '', description: '' })
  const [need, setNeed] = useState({ category: '', description: '' })

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }
  const req = <span style={{ color: '#ef4444' }}>*</span>

  const toggleLang = (lang: string) => {
    setDetails(d => ({ ...d, languages: d.languages.includes(lang) ? d.languages.filter(l => l !== lang) : [...d.languages, lang] }))
  }

  const totalSteps = role.is_volunteer && role.is_seeker ? 4 : 3

  function validateStep() {
    setError('')
    if (step === 1) {
      if (!role.is_volunteer && !role.is_seeker) { setError('Please select at least one role.'); return false }
    }
    if (step === 2) {
      if (!details.name.trim()) { setError('Full name is required.'); return false }
      if (!details.country.trim()) { setError('Country is required.'); return false }
      if (!details.whatsapp.trim() && !details.linkedin.trim()) { setError('Please provide WhatsApp or LinkedIn — at least one contact method.'); return false }
      if (details.languages.length === 0) { setError('Please select at least one language.'); return false }
    }
    if (step === 3) {
      if (role.is_volunteer && !role.is_seeker) {
        if (!offer.category) { setError('Please select a category.'); return false }
        if (!offer.description.trim()) { setError('Please describe what you can offer.'); return false }
      } else if (role.is_seeker && !role.is_volunteer) {
        if (!need.category) { setError('Please select a category.'); return false }
        if (!need.description.trim()) { setError('Please describe what you need.'); return false }
      } else {
        // both — step 3 is volunteer offer
        if (!offer.category) { setError('Please select a category for your offer.'); return false }
        if (!offer.description.trim()) { setError('Please describe what you can offer.'); return false }
      }
    }
    if (step === 4) {
      // both roles — step 4 is seeker need
      if (!need.category) { setError('Please select a category for your need.'); return false }
      if (!need.description.trim()) { setError('Please describe what you need.'); return false }
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    if (!user) return
    setLoading(true)
    setError('')

    const finalLanguages = details.languages.includes('Other') && details.otherLanguage
      ? [...details.languages.filter(l => l !== 'Other'), details.otherLanguage]
      : details.languages

    const roleStr = role.is_volunteer ? 'volunteer' : 'seeker'

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: user.id,
      name: details.name.trim(),
      role: roleStr,
      is_volunteer: role.is_volunteer,
      is_seeker: role.is_seeker,
      country: details.country.trim(),
      whatsapp_number: details.whatsapp.trim(),
      linkedin: details.linkedin.trim(),
      languages: finalLanguages,
    })
    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    if (role.is_volunteer && offer.category && offer.description) {
      await supabase.from('offers').insert({ user_id: user.id, category: offer.category, description: offer.description, availability: '', tags: [] })
    }
    if (role.is_seeker && need.category && need.description) {
      await supabase.from('requests').insert({ user_id: user.id, category: need.category, description: need.description, tags: [] })
    }

    router.push('/dashboard')
  }

  const stepTitles = ['Your Role', 'Your Details', role.is_volunteer && !role.is_seeker ? 'Your Offer' : role.is_seeker && !role.is_volunteer ? 'Your Need' : 'Your Offer', 'Your Need']
  const currentTitle = stepTitles[step - 1]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', padding: '48px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Complete Your Profile</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Step {step} of {totalSteps} — {currentTitle}</p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '100px', marginBottom: '32px' }}>
          <div style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', background: '#d97706', borderRadius: '100px', transition: 'width 0.3s' }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 — Role */}
        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' }}>What brings you to GazaBridge? {req}</div>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>You can select both!</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(['is_volunteer', 'is_seeker'] as const).map((key) => {
                const isVol = key === 'is_volunteer'
                return (
                  <button key={key} type="button" onClick={() => setRole(r => ({ ...r, [key]: !r[key] }))}
                    style={{ padding: '24px 20px', borderRadius: '20px', cursor: 'pointer', textAlign: 'left', width: '100%',
                      border: role[key] ? `2px solid ${isVol ? '#d97706' : '#16a34a'}` : '2px solid #e5e7eb',
                      background: role[key] ? (isVol ? '#fffbeb' : '#f0fdf4') : '#fff', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{isVol ? '🙌' : '🌟'}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{isVol ? 'I want to help' : 'I need support'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{isVol ? 'Offer my skills for free' : 'Get help from volunteers'}</div>
                    {role[key] && <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: isVol ? '#d97706' : '#16a34a' }}>✓ Selected</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name {req}</label>
              <input style={inputStyle} value={details.name} onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div>
              <label style={labelStyle}>Country {req}</label>
              <input style={inputStyle} value={details.country} onChange={e => setDetails(d => ({ ...d, country: e.target.value }))} placeholder="Where are you based?" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp {req} <span style={{ fontWeight: 400, color: '#9ca3af' }}>(or provide LinkedIn)</span></label>
              <input style={inputStyle} value={details.whatsapp} onChange={e => setDetails(d => ({ ...d, whatsapp: e.target.value }))} placeholder="+1234567890" />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn {req} <span style={{ fontWeight: 400, color: '#9ca3af' }}>(or provide WhatsApp)</span></label>
              <input style={inputStyle} value={details.linkedin} onChange={e => setDetails(d => ({ ...d, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div>
              <label style={labelStyle}>Languages you speak {req}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LANGUAGES.map(lang => (
                  <button key={lang} type="button" onClick={() => toggleLang(lang)} style={{
                    padding: '8px 18px', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                    border: details.languages.includes(lang) ? '2px solid #d97706' : '2px solid #e5e7eb',
                    background: details.languages.includes(lang) ? '#d97706' : '#fff',
                    color: details.languages.includes(lang) ? '#fff' : '#374151', transition: 'all 0.2s',
                  }}>{lang}</button>
                ))}
              </div>
              {details.languages.includes('Other') && (
                <input style={{ ...inputStyle, marginTop: '12px' }} placeholder="Specify language…" value={details.otherLanguage} onChange={e => setDetails(d => ({ ...d, otherLanguage: e.target.value }))} />
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Volunteer offer OR Seeker need OR (both) Volunteer offer */}
        {step === 3 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(role.is_volunteer) ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>🙌 What can you offer? {req}</div>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0' }}>Describe the skill or support you want to volunteer.</p>
                <div>
                  <label style={labelStyle}>Category {req}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {VOLUNTEER_CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setOffer(o => ({ ...o, category: cat }))} style={{
                        padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                        border: offer.category === cat ? '2px solid #d97706' : '2px solid #e5e7eb',
                        background: offer.category === cat ? '#d97706' : '#fff',
                        color: offer.category === cat ? '#fff' : '#374151', transition: 'all 0.2s',
                      }}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description {req}</label>
                  <textarea value={offer.description} onChange={e => setOffer(o => ({ ...o, description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. I can teach basic English conversation, help with CV writing, or mentor in web development..." />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>🌟 What do you need? {req}</div>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0' }}>Tell volunteers what kind of support would help you most.</p>
                <div>
                  <label style={labelStyle}>Category {req}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SEEKER_CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setNeed(n => ({ ...n, category: cat }))} style={{
                        padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                        border: need.category === cat ? '2px solid #16a34a' : '2px solid #e5e7eb',
                        background: need.category === cat ? '#16a34a' : '#fff',
                        color: need.category === cat ? '#fff' : '#374151', transition: 'all 0.2s',
                      }}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description {req}</label>
                  <textarea value={need.description} onChange={e => setNeed(n => ({ ...n, description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. I want to improve my English speaking skills to find better job opportunities..." />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — only for both roles: Seeker need */}
        {step === 4 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #d1fae5', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>🌟 What do you need? {req}</div>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0' }}>Tell volunteers what kind of support would help you most.</p>
            <div>
              <label style={labelStyle}>Category {req}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SEEKER_CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setNeed(n => ({ ...n, category: cat }))} style={{
                    padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                    border: need.category === cat ? '2px solid #16a34a' : '2px solid #e5e7eb',
                    background: need.category === cat ? '#16a34a' : '#fff',
                    color: need.category === cat ? '#fff' : '#374151', transition: 'all 0.2s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description {req}</label>
              <textarea value={need.description} onChange={e => setNeed(n => ({ ...n, description: e.target.value }))}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g. I want to improve my English speaking skills..." />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {step > 1 && (
            <button onClick={() => { setError(''); setStep(s => s - 1) }}
              style={{ padding: '14px 28px', borderRadius: '100px', border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={nextStep}
              style={{ flex: 1, padding: '14px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, padding: '14px', borderRadius: '100px', background: loading ? '#f59e0b' : '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Saving…' : '🚀 Go to Dashboard'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
