'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const LANGUAGES = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German', 'Other']
const VOLUNTEER_CATEGORIES = ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring', '🌐 Other']
const SEEKER_CATEGORIES = ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills', '🌐 Other']
const GENDERS = ['👨 Male', '👩 Female', '🔒 Prefer not to say']

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const [role, setRole] = useState({ is_volunteer: false, is_seeker: false })
  const [details, setDetails] = useState({ name: user?.user_metadata?.full_name || '', country: '', linkedin: '', languages: [] as string[], otherLanguage: '', gender: '' })
  const [offer, setOffer] = useState({ categories: [] as string[], otherText: '', description: '' })
  const [need, setNeed] = useState({ categories: [] as string[], otherText: '', description: '' })

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const req = <span style={{ color: '#ef4444' }}>*</span>

  const toggleLang = (lang: string) => {
    setDetails(d => ({ ...d, languages: d.languages.includes(lang) ? d.languages.filter(l => l !== lang) : [...d.languages, lang] }))
  }

  const toggleOfferCategory = (cat: string) => {
    setOffer(o => {
      const newCategories = o.categories.includes(cat) 
        ? o.categories.filter(c => c !== cat) 
        : [...o.categories, cat]
      // Clear otherText if "Other" is deselected
      const newOtherText = cat === '🌐 Other' && !newCategories.includes('🌐 Other') ? '' : o.otherText
      return { ...o, categories: newCategories, otherText: newOtherText }
    })
  }

  const toggleNeedCategory = (cat: string) => {
    setNeed(n => {
      const newCategories = n.categories.includes(cat) 
        ? n.categories.filter(c => c !== cat) 
        : [...n.categories, cat]
      // Clear otherText if "Other" is deselected
      const newOtherText = cat === '🌐 Other' && !newCategories.includes('🌐 Other') ? '' : n.otherText
      return { ...n, categories: newCategories, otherText: newOtherText }
    })
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
      if (!details.gender) { setError('Please select your gender.'); return false }
      if (!details.linkedin.trim()) { setError('LinkedIn profile is required.'); return false }
      if (details.languages.length === 0) { setError('Please select at least one language.'); return false }
    }
    if (step === 3) {
      if (role.is_volunteer) {
        if (offer.categories.length === 0) { setError('Please select at least one category.'); return false }
        if (offer.categories.includes('🌐 Other') && !offer.otherText.trim()) { setError('Please describe what else you can offer.'); return false }
        if (!offer.description.trim()) { setError('Please describe what you can offer.'); return false }
      } else {
        if (need.categories.length === 0) { setError('Please select at least one category.'); return false }
        if (need.categories.includes('🌐 Other') && !need.otherText.trim()) { setError('Please describe what else you need.'); return false }
        if (!need.description.trim()) { setError('Please describe what you need.'); return false }
      }
    }
    if (step === 4) {
      if (need.categories.length === 0) { setError('Please select at least one category for your need.'); return false }
      if (need.categories.includes('🌐 Other') && !need.otherText.trim()) { setError('Please describe what else you need.'); return false }
      if (!need.description.trim()) { setError('Please describe what you need.'); return false }
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  function prevStep() {
    setError('')
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    if (!user) {
      setError('Please sign in to continue.')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError('')

    try {
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
        linkedin: details.linkedin.trim(),
        languages: finalLanguages,
        gender: details.gender,
      })
      if (profileErr) { setError(profileErr.message); setLoading(false); return }

      if (role.is_volunteer && offer.categories.length > 0 && offer.description) {
        const finalOfferCategories = offer.categories.includes('🌐 Other') && offer.otherText
          ? [...offer.categories.filter(c => c !== '🌐 Other'), offer.otherText]
          : offer.categories
        await supabase.from('offers').insert({ 
          user_id: user.id, 
          category: finalOfferCategories.join(', '), 
          description: offer.description, 
          availability: '', 
          tags: finalOfferCategories 
        })
      }

      if (role.is_seeker && need.categories.length > 0 && need.description) {
        const finalNeedCategories = need.categories.includes('🌐 Other') && need.otherText
          ? [...need.categories.filter(c => c !== '🌐 Other'), need.otherText]
          : need.categories
        await supabase.from('requests').insert({ 
          user_id: user.id, 
          category: finalNeedCategories.join(', '), 
          description: need.description, 
          tags: finalNeedCategories 
        })
      }

      router.push('/dashboard')
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const stepTitles = ['Your Role', 'Your Details', role.is_volunteer ? 'Your Offer' : 'Your Need', 'Your Need']
  const currentTitle = stepTitles[step - 1]
  const progressPercent = (step / totalSteps) * 100

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.8)',
    border: '1.5px solid rgba(229,225,216,0.8)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    color: '#1A1A14',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#3D3D2E',
    marginBottom: '0.4rem',
    display: 'block',
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#EDE8DC', 
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
      fontFamily: 'inherit',
      position: 'relative'
    }}>
      {/* Animated Shader Background */}
      <div 
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 85% 75% at 8% 15%, rgba(92,107,46,0.45) 0%, transparent 50%),
            radial-gradient(ellipse 75% 85% at 92% 85%, rgba(192,122,26,0.38) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,122,26,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 80% 10%, rgba(92,107,46,0.22) 0%, transparent 50%)
          `,
          animation: 'shaderDrift 14s ease-in-out infinite alternate'
        }}
      />

      {/* Back Arrow Button */}
      <Link 
        href={step === 1 ? "/" : "#"}
        onClick={(e) => {
          if (step > 1) {
            e.preventDefault()
            prevStep()
          }
        }}
        style={{
          position: 'fixed',
          top: 'clamp(1rem, 2vw, 1.5rem)',
          left: 'clamp(1rem, 2vw, 1.5rem)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(192,122,26,0.2)',
          borderRadius: '50px',
          padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.9rem, 2vw, 1.1rem)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
          fontWeight: 600,
          color: '#3D3D2E',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
          e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
          e.currentTarget.style.transform = 'translateX(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.borderColor = 'rgba(192,122,26,0.2)'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        ← Back
      </Link>

      <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 700,
            color: '#1A1A14',
            marginBottom: '0.4rem'
          }}>
            Complete Your Profile
          </h1>
          <p style={{ 
            color: '#8A8572',
            fontSize: '0.875rem',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Step {step} of {totalSteps} — {currentTitle}
          </p>
        </div>

        <div style={{ 
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto 1.5rem',
          height: '6px',
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '3px'
        }}>
          <div style={{ 
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #C07A1A, #E09030)',
            borderRadius: '3px',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 — Role */}
        {step === 1 && (
          <div style={{
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: isMobile ? '20px' : '24px',
            padding: isMobile ? '1.5rem 1.25rem' : '2.25rem 2rem',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 64px rgba(92,107,46,0.14), 0 8px 24px rgba(192,122,26,0.10), 0 2px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(192,122,26,0.08) inset'
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', color: '#1A1A14' }}>
              What brings you to GazaBridge? {req}
            </div>
            <p style={{ color: '#8A8572', fontSize: '0.85rem', marginBottom: '20px', fontFamily: "'DM Sans', sans-serif" }}>
              You can select both!
            </p>
            <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              {(['is_volunteer', 'is_seeker'] as const).map((key) => {
                const isVol = key === 'is_volunteer'
                const isSelected = role[key]
                return (
                  <button 
                    key={key} 
                    type="button" 
                    onClick={() => setRole(r => ({ ...r, [key]: !r[key] }))}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '1.5rem 1.25rem',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: isSelected 
                        ? `2px solid ${isVol ? '#5C6B2E' : '#C07A1A'}` 
                        : '2px solid rgba(229,225,216,0.8)',
                      background: isSelected 
                        ? (isVol ? 'rgba(92,107,46,0.07)' : 'rgba(192,122,26,0.07)') 
                        : 'rgba(255,255,255,0.7)',
                      boxShadow: isSelected 
                        ? (isVol ? '0 4px 16px rgba(92,107,46,0.15)' : '0 4px 16px rgba(192,122,26,0.15)') 
                        : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: "'Playfair Display', serif"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                      {isVol ? '🙌' : '🌟'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: '#1A1A14' }}>
                      {isVol ? 'I want to help' : 'I need support'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8A8572', fontFamily: "'DM Sans', sans-serif" }}>
                      {isVol ? 'Offer my skills for free' : 'Get help from volunteers'}
                    </div>
                    {isSelected && (
                      <div style={{ 
                        marginTop: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: isVol ? '#5C6B2E' : '#C07A1A' 
                      }}>
                        ✓ Selected
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div style={{
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: isMobile ? '20px' : '24px',
            padding: isMobile ? '1.5rem 1.25rem' : '2.25rem 2rem',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 64px rgba(92,107,46,0.14), 0 8px 24px rgba(192,122,26,0.10), 0 2px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(192,122,26,0.08) inset',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>Full Name {req}</label>
              <input 
                style={inputStyle} 
                value={details.name} 
                onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} 
                placeholder="Your full name"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C07A1A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Country {req}</label>
              <input 
                style={inputStyle} 
                value={details.country} 
                onChange={e => setDetails(d => ({ ...d, country: e.target.value }))} 
                placeholder="Where are you based?"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C07A1A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Gender {req}</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {GENDERS.map(g => {
                  const isSelected = details.gender === g
                  return (
                    <button 
                      key={g} 
                      type="button" 
                      onClick={() => setDetails(d => ({ ...d, gender: g }))}
                      style={{
                        padding: '0.45rem 1.1rem',
                        borderRadius: '50px',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        fontFamily: "'Playfair Display', serif",
                        border: isSelected ? '1.5px solid #5C6B2E' : '1.5px solid rgba(229,225,216,0.9)',
                        background: isSelected ? 'linear-gradient(135deg, rgba(92,107,46,0.12), rgba(92,107,46,0.08))' : 'rgba(255,255,255,0.7)',
                        color: isSelected ? '#5C6B2E' : '#3D3D2E',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(229,225,216,0.9)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={labelStyle}>LinkedIn Profile {req}</label>
              <input 
                style={inputStyle} 
                value={details.linkedin} 
                onChange={e => setDetails(d => ({ ...d, linkedin: e.target.value }))} 
                placeholder="https://linkedin.com/in/yourname"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C07A1A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Languages you speak {req}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LANGUAGES.map(lang => {
                  const isSelected = details.languages.includes(lang)
                  return (
                    <button 
                      key={lang} 
                      type="button" 
                      onClick={() => toggleLang(lang)} 
                      style={{
                        padding: '0.45rem 1.1rem',
                        borderRadius: '50px',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        fontFamily: "'Playfair Display', serif",
                        border: isSelected ? '1.5px solid #5C6B2E' : '1.5px solid rgba(229,225,216,0.9)',
                        background: isSelected ? 'linear-gradient(135deg, rgba(92,107,46,0.12), rgba(92,107,46,0.08))' : 'rgba(255,255,255,0.7)',
                        color: isSelected ? '#5C6B2E' : '#3D3D2E',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(229,225,216,0.9)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
              {details.languages.includes('Other') && (
                <input 
                  style={{ ...inputStyle, marginTop: '12px' }} 
                  placeholder="Specify language…" 
                  value={details.otherLanguage} 
                  onChange={e => setDetails(d => ({ ...d, otherLanguage: e.target.value }))}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C07A1A'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Offer or Need */}
        {step === 3 && (
          <div style={{
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: isMobile ? '20px' : '24px',
            padding: isMobile ? '1.5rem 1.25rem' : '2.25rem 2rem',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 64px rgba(92,107,46,0.14), 0 8px 24px rgba(192,122,26,0.10), 0 2px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(192,122,26,0.08) inset',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {role.is_volunteer ? (
              <>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', color: '#1A1A14' }}>
                  🙌 What can you offer? {req}
                </div>
                <p style={{ color: '#8A8572', fontSize: '0.85rem', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  Describe the skill or support you want to volunteer.
                </p>
                <div>
                  <label style={labelStyle}>Categories {req} <span style={{ fontWeight: 400, color: '#8A8572', fontSize: '0.85rem' }}>(select all that apply)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {VOLUNTEER_CATEGORIES.map(cat => {
                      const isSelected = offer.categories.includes(cat)
                      return (
                        <button 
                          key={cat} 
                          type="button" 
                          onClick={() => toggleOfferCategory(cat)} 
                          style={{
                            padding: isMobile ? '0.4rem 0.9rem' : '0.45rem 1.1rem',
                            borderRadius: '50px',
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            cursor: 'pointer',
                            fontFamily: "'Playfair Display', serif",
                            border: isSelected ? '1.5px solid #5C6B2E' : '1.5px solid rgba(229,225,216,0.9)',
                            background: isSelected ? 'rgba(92,107,46,0.1)' : 'rgba(255,255,255,0.7)',
                            color: isSelected ? '#5C6B2E' : '#3D3D2E',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
                              e.currentTarget.style.transform = 'scale(1.02)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(229,225,216,0.9)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                  {/* Other text input - animated */}
                  <div style={{
                    maxHeight: offer.categories.includes('🌐 Other') ? '80px' : '0',
                    opacity: offer.categories.includes('🌐 Other') ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease'
                  }}>
                    <input 
                      style={{ ...inputStyle, marginTop: '0.75rem' }} 
                      placeholder="Describe what else you can offer..." 
                      value={offer.otherText} 
                      onChange={e => setOffer(o => ({ ...o, otherText: e.target.value }))}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#C07A1A'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description {req}</label>
                  <textarea 
                    value={offer.description} 
                    onChange={e => setOffer(o => ({ ...o, description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. I can teach basic English conversation, help with CV writing..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#C07A1A'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', color: '#1A1A14' }}>
                  🌟 What do you need? {req}
                </div>
                <p style={{ color: '#8A8572', fontSize: '0.85rem', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  Tell volunteers what kind of support would help you most.
                </p>
                <div>
                  <label style={labelStyle}>Categories {req} <span style={{ fontWeight: 400, color: '#8A8572', fontSize: '0.85rem' }}>(select all that apply)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SEEKER_CATEGORIES.map(cat => {
                      const isSelected = need.categories.includes(cat)
                      return (
                        <button 
                          key={cat} 
                          type="button" 
                          onClick={() => toggleNeedCategory(cat)} 
                          style={{
                            padding: isMobile ? '0.4rem 0.9rem' : '0.45rem 1.1rem',
                            borderRadius: '50px',
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            cursor: 'pointer',
                            fontFamily: "'Playfair Display', serif",
                            border: isSelected ? '1.5px solid #C07A1A' : '1.5px solid rgba(229,225,216,0.9)',
                            background: isSelected ? 'rgba(192,122,26,0.1)' : 'rgba(255,255,255,0.7)',
                            color: isSelected ? '#C07A1A' : '#3D3D2E',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
                              e.currentTarget.style.transform = 'scale(1.02)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(229,225,216,0.9)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                  {/* Other text input - animated */}
                  <div style={{
                    maxHeight: need.categories.includes('🌐 Other') ? '80px' : '0',
                    opacity: need.categories.includes('🌐 Other') ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease'
                  }}>
                    <input 
                      style={{ ...inputStyle, marginTop: '0.75rem' }} 
                      placeholder="Describe what else you need help with..." 
                      value={need.otherText} 
                      onChange={e => setNeed(n => ({ ...n, otherText: e.target.value }))}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#C07A1A'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description {req}</label>
                  <textarea 
                    value={need.description} 
                    onChange={e => setNeed(n => ({ ...n, description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. I want to improve my English speaking skills..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#C07A1A'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — both roles: seeker need */}
        {step === 4 && (
          <div style={{
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: isMobile ? '20px' : '24px',
            padding: isMobile ? '1.5rem 1.25rem' : '2.25rem 2rem',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 64px rgba(92,107,46,0.14), 0 8px 24px rgba(192,122,26,0.10), 0 2px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(192,122,26,0.08) inset',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', color: '#1A1A14' }}>
              🌟 What do you need? {req}
            </div>
            <p style={{ color: '#8A8572', fontSize: '0.85rem', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Tell volunteers what kind of support would help you most.
            </p>
            <div>
              <label style={labelStyle}>Categories {req} <span style={{ fontWeight: 400, color: '#8A8572', fontSize: '0.85rem' }}>(select all that apply)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SEEKER_CATEGORIES.map(cat => {
                  const isSelected = need.categories.includes(cat)
                  return (
                    <button 
                      key={cat} 
                      type="button" 
                      onClick={() => toggleNeedCategory(cat)} 
                      style={{
                        padding: isMobile ? '0.4rem 0.9rem' : '0.45rem 1.1rem',
                        borderRadius: '50px',
                        fontSize: isMobile ? '0.85rem' : '0.95rem',
                        cursor: 'pointer',
                        fontFamily: "'Playfair Display', serif",
                        border: isSelected ? '1.5px solid #C07A1A' : '1.5px solid rgba(229,225,216,0.9)',
                        background: isSelected ? 'rgba(192,122,26,0.1)' : 'rgba(255,255,255,0.7)',
                        color: isSelected ? '#C07A1A' : '#3D3D2E',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(192,122,26,0.4)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(229,225,216,0.9)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
              {/* Other text input - animated */}
              <div style={{
                maxHeight: need.categories.includes('🌐 Other') ? '80px' : '0',
                opacity: need.categories.includes('🌐 Other') ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.3s ease'
              }}>
                <input 
                  style={{ ...inputStyle, marginTop: '0.75rem' }} 
                  placeholder="Describe what else you need help with..." 
                  value={need.otherText} 
                  onChange={e => setNeed(n => ({ ...n, otherText: e.target.value }))}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C07A1A'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                  }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description {req}</label>
              <textarea 
                value={need.description} 
                onChange={e => setNeed(n => ({ ...n, description: e.target.value }))}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g. I want to improve my English speaking skills..."
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C07A1A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,122,26,0.1)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,225,216,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation - Single Continue/Dashboard Button */}
        <div style={{ marginTop: '24px' }}>
          {step < totalSteps ? (
            <button 
              type="button"
              onClick={nextStep}
              disabled={step === 1 && !role.is_volunteer && !role.is_seeker}
              style={{ 
                width: '100%',
                height: isMobile ? '48px' : '52px',
                padding: '14px',
                borderRadius: '50px',
                background: (step === 1 && !role.is_volunteer && !role.is_seeker) 
                  ? '#D4CFC4' 
                  : 'linear-gradient(135deg, #C07A1A, #E09030)',
                color: (step === 1 && !role.is_volunteer && !role.is_seeker) ? '#9A9585' : '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: isMobile ? '1rem' : '1.05rem',
                cursor: (step === 1 && !role.is_volunteer && !role.is_seeker) ? 'not-allowed' : 'pointer',
                fontFamily: "'Playfair Display', serif",
                boxShadow: (step === 1 && !role.is_volunteer && !role.is_seeker) 
                  ? 'none' 
                  : '0 4px 16px rgba(192,122,26,0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!(step === 1 && !role.is_volunteer && !role.is_seeker)) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(192,122,26,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!(step === 1 && !role.is_volunteer && !role.is_seeker)) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,122,26,0.3)'
                }
              }}
            >
              Continue →
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={loading}
              style={{ 
                width: '100%',
                height: isMobile ? '48px' : '52px',
                padding: '14px',
                borderRadius: '50px',
                background: loading ? '#D4CFC4' : 'linear-gradient(135deg, #C07A1A, #E09030)',
                color: loading ? '#9A9585' : '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: isMobile ? '1rem' : '1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Playfair Display', serif",
                boxShadow: loading ? 'none' : '0 4px 16px rgba(192,122,26,0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(192,122,26,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,122,26,0.3)'
                }
              }}
            >
              {loading ? 'Saving…' : '🚀 Go to Dashboard'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
