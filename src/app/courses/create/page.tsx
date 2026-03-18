'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const CATEGORIES = [
  '📚 Teaching / Language',
  '💻 Tech / Coding / AI',
  '💼 Career / Mentorship',
  '🫂 Mental Health',
  '🎨 Creative / Design',
  '📖 Academic Tutoring',
  '🌐 Other',
]

const LANGUAGES = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DELIVERY_TYPES = [
  { value: 'live', label: '💻 Live Online', desc: 'Zoom/Meet link shared after enrollment' },
  { value: 'recorded', label: '🎥 Pre-recorded', desc: 'Students watch at their own pace' },
  { value: 'hybrid', label: '🔀 Hybrid', desc: 'Both live sessions and recordings' },
  { value: 'async', label: '💬 Async', desc: 'No fixed schedule — volunteer reviews work' },
]
const FORMATS = [
  { value: 'group', label: '👥 Group', desc: 'Multiple students, fixed schedule' },
  { value: '1on1', label: '👤 1-on-1', desc: 'Individual sessions, flexible timing' },
]

type FormState = {
  title: string
  category: string
  description: string
  skill_level: string
  language: string
  delivery_type: string
  format: string
  max_slots: number
  sessions_per_week: number | ''
  session_duration: number | ''
  start_date: string
  end_date: string
  meeting_link: string
  recording_link: string
  schedule_type: string
}

const defaultForm: FormState = {
  title: '',
  category: '',
  description: '',
  skill_level: '',
  language: '',
  delivery_type: '',
  format: '',
  max_slots: 5,
  sessions_per_week: '',
  session_duration: '',
  start_date: '',
  end_date: '',
  meeting_link: '',
  recording_link: '',
  schedule_type: 'fixed',
}

export default function CreateCoursePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<FormState>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: basics, 2: format, 3: schedule

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  function set(key: keyof FormState, value: any) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function validateStep(s: number) {
    if (s === 1) {
      if (!form.title.trim()) return 'Please enter a course title'
      if (!form.category) return 'Please select a category'
      if (!form.description.trim()) return 'Please enter a description'
      if (!form.skill_level) return 'Please select a skill level'
      if (!form.language) return 'Please select a language'
    }
    if (s === 2) {
      if (!form.delivery_type) return 'Please select a delivery type'
      if (!form.format) return 'Please select a format'
    }
    return null
  }

  function nextStep() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setError('')
    if (!form.title || !form.category || !form.description || !form.delivery_type || !form.format) {
      setError('Please fill in all required fields')
      return
    }
    setSaving(true)
    const { data, error: err } = await supabase.from('courses').insert({
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      skill_level: form.skill_level,
      language: form.language,
      delivery_type: form.delivery_type,
      format: form.format,
      max_slots: form.max_slots,
      sessions_per_week: form.sessions_per_week || null,
      session_duration: form.session_duration || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      meeting_link: form.meeting_link || null,
      recording_link: form.recording_link || null,
      schedule_type: form.schedule_type,
      instructor_id: user!.id,
      enrolled_count: 0,
      status: 'active',
    }).select().single()

    if (err) {
      setError('Failed to create course. Please try again.')
      setSaving(false)
      return
    }
    router.push(`/courses/${data.id}`)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid #fde68a',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fffbeb',
    boxSizing: 'border-box' as const,
  }

  if (!user) return null

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '32px' }}>
          ← Back to courses
        </Link>

        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px' }}>Offer a Course</h1>
          <p style={{ color: '#9ca3af' }}>Share your knowledge with students in Gaza — for free</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '100px', background: s <= step ? '#d97706' : '#e5e7eb', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '28px' }}>
          Step {step} of 3 — {step === 1 ? 'Basic Info' : step === 2 ? 'Format & Delivery' : 'Schedule & Links'}
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '32px' }}>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Course Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder='e.g. "Python for Beginners"' />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, background: '#fff' }} aria-label="Category">
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="What will students learn? What topics will you cover?" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>Skill Level *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => set('skill_level', l)}
                      style={{ padding: '8px 20px', borderRadius: '100px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', border: form.skill_level === l ? '2px solid #d97706' : '2px solid #e5e7eb', background: form.skill_level === l ? '#d97706' : '#fff', color: form.skill_level === l ? '#fff' : '#374151' }}>
                      {l === 'Beginner' ? '🌱' : l === 'Intermediate' ? '📘' : '🏆'} {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Language of Instruction *</label>
                <select value={form.language} onChange={e => set('language', e.target.value)} style={{ ...inputStyle, background: '#fff' }} aria-label="Language">
                  <option value="">Select language</option>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Format & Delivery */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Delivery Type *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {DELIVERY_TYPES.map(dt => (
                    <button key={dt.value} type="button" onClick={() => set('delivery_type', dt.value)}
                      style={{ padding: '14px 18px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', border: form.delivery_type === dt.value ? '2px solid #d97706' : '2px solid #e5e7eb', background: form.delivery_type === dt.value ? '#fffbeb' : '#fff', textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: form.delivery_type === dt.value ? '#b45309' : '#374151' }}>{dt.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '3px' }}>{dt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Format *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {FORMATS.map(fmt => (
                    <button key={fmt.value} type="button" onClick={() => set('format', fmt.value)}
                      style={{ flex: 1, padding: '14px 18px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', border: form.format === fmt.value ? '2px solid #d97706' : '2px solid #e5e7eb', background: form.format === fmt.value ? '#fffbeb' : '#fff', textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: form.format === fmt.value ? '#b45309' : '#374151' }}>{fmt.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '3px' }}>{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.format === 'group' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Max Students in Group</label>
                  <input type="number" min={2} max={100} value={form.max_slots} onChange={e => set('max_slots', parseInt(e.target.value) || 5)} style={{ ...inputStyle, maxWidth: '140px' }} />
                </div>
              )}
              {form.format === '1on1' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>How many 1-on-1 students can you take?</label>
                  <input type="number" min={1} max={20} value={form.max_slots} onChange={e => set('max_slots', parseInt(e.target.value) || 1)} style={{ ...inputStyle, maxWidth: '140px' }} />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>e.g. 3 means you can teach 3 students simultaneously</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Schedule & Links */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Sessions per week</label>
                  <input type="number" min={1} max={7} value={form.sessions_per_week} onChange={e => set('sessions_per_week', parseInt(e.target.value) || '')} style={inputStyle} placeholder="e.g. 2" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Session duration (min)</label>
                  <input type="number" min={15} max={240} value={form.session_duration} onChange={e => set('session_duration', parseInt(e.target.value) || '')} style={inputStyle} placeholder="e.g. 60" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} style={inputStyle} />
                </div>
              </div>

              {(form.delivery_type === 'live' || form.delivery_type === 'hybrid') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Meeting Link</label>
                  <input value={form.meeting_link} onChange={e => set('meeting_link', e.target.value)} style={inputStyle} placeholder="Zoom/Meet link — shared privately after enrollment" />
                </div>
              )}

              {(form.delivery_type === 'recorded' || form.delivery_type === 'hybrid') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Recording Link</label>
                  <input value={form.recording_link} onChange={e => set('recording_link', e.target.value)} style={inputStyle} placeholder="YouTube / Google Drive link" />
                </div>
              )}

              <div style={{ background: '#fffbeb', borderRadius: '14px', padding: '16px', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.6 }}>
                💡 <strong>Your course goes live immediately.</strong> Students will send enrollment requests which you can approve from your course management page.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'space-between' }}>
            {step > 1 ? (
              <button type="button" onClick={() => { setStep(s => s - 1); setError('') }}
                style={{ padding: '12px 28px', borderRadius: '100px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button type="button" onClick={nextStep}
                style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={saving}
                style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Publishing...' : '🚀 Publish Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
