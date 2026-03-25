'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Course = {
  id: string
  title: string
  description: string
  category: string
  skill_level: string
  language: string
  delivery_type: string
  format: string
  max_slots: number
  enrolled_count: number
  start_date: string | null
  end_date: string | null
  sessions_per_week: number | null
  session_duration: number | null
  schedule_type: string
  meeting_link: string | null
  recording_link: string | null
  status: string
  instructor_id: string
  created_at: string
  profiles: {
    id: string
    name: string
    country: string
    languages: string[]
    linkedin?: string
    whatsapp_number?: string
    whatsapp_group?: string
  }
}

type Enrollment = {
  id: string
  status: string
  enrolled_at: string
}

const DELIVERY_LABELS: Record<string, string> = {
  live: '💻 Live Online',
  recorded: '🎥 Pre-recorded',
  hybrid: '🔀 Hybrid (Live + Recorded)',
  async: '💬 Async (No fixed time)',
}

const LEVEL_LABELS: Record<string, string> = {
  Beginner: '🌱 Beginner',
  Intermediate: '📘 Intermediate',
  Advanced: '🏆 Advanced',
}

function SlotsBar({ max, enrolled }: { max: number; enrolled: number }) {
  const pct = Math.min(1, enrolled / max)
  const available = Math.max(0, max - enrolled)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
        <span style={{ color: '#6b7280' }}>{enrolled} enrolled</span>
        <span style={{ color: available === 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
          {available === 0 ? 'Full' : `${available} slot${available !== 1 ? 's' : ''} left`}
        </span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: pct >= 1 ? '#dc2626' : pct >= 0.8 ? '#d97706' : '#16a34a', borderRadius: '100px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isGuest } = useAuth()   // ← added isGuest
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourse()
    if (user && !isGuest) fetchEnrollment()
  }, [id, user, isGuest])

  async function fetchCourse() {
    const { data } = await supabase
      .from('courses')
      .select('*, profiles(id, name, country, languages, linkedin, whatsapp_number, whatsapp_group)')
      .eq('id', id)
      .single()
    if (data) setCourse(data as any)
    setLoading(false)
  }

  async function fetchEnrollment() {
    const { data } = await supabase
      .from('enrollments')
      .select('id, status, enrolled_at')
      .eq('course_id', id)
      .eq('student_id', user!.id)
      .maybeSingle()
    if (data) setEnrollment(data)
  }

  async function handleEnroll() {
    if (!user) { router.push('/login'); return }
    setEnrolling(true)
    setError('')
    if (enrollment) { setEnrolling(false); return }
    if (course?.format === 'group' && course.max_slots > 0) {
      const isFull = (course.enrolled_count || 0) >= course.max_slots
      const status = isFull ? 'waitlist' : 'pending'
      const { error: err } = await supabase.from('enrollments').insert({
        course_id: id, student_id: user.id, status, enrolled_at: new Date().toISOString(),
      })
      if (err) { setError('Something went wrong. Please try again.'); setEnrolling(false); return }
      await fetchEnrollment()
      await fetchCourse()
      setEnrollSuccess(true)
    } else {
      const { error: err } = await supabase.from('enrollments').insert({
        course_id: id, student_id: user.id, status: 'pending', enrolled_at: new Date().toISOString(),
      })
      if (err) { setError('Something went wrong. Please try again.'); setEnrolling(false); return }
      await fetchEnrollment()
      setEnrollSuccess(true)
    }
    setEnrolling(false)
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
    </>
  )

  if (!course) return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
        <p style={{ color: '#9ca3af' }}>Course not found</p>
        <Link href="/courses" style={{ color: '#d97706' }}>← Back to courses</Link>
      </div>
    </>
  )

  const isInstructor = user?.id === course.instructor_id
  const isFull = course.format === 'group' && (course.enrolled_count || 0) >= course.max_slots
  const enrollmentStatus = enrollment?.status

  function EnrollButton() {
    // ── GUEST: show lock wall instead of join button ──
    if (isGuest) return (
      <button
        onClick={() => {
          try { localStorage.removeItem('gb_guest') } catch { /* ignore */ }
          router.push('/complete-profile')
        }}
        style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '100px', background: 'rgba(192,122,26,0.08)', color: '#C07A1A', border: '2px dashed rgba(192,122,26,0.35)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box' as const }}>
        🔒 Create a profile to join this course
      </button>
    )

    if (isInstructor) return (
      <Link href={`/courses/${id}/manage`} style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' as const }}>
        ⚙️ Manage Your Course
      </Link>
    )
    if (!user) return (
      <Link href="/login" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '100px', background: '#f9fafb', border: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' as const }}>
        🔒 Sign in to enroll
      </Link>
    )
    if (enrollmentStatus === 'approved') return (
      <div style={{ padding: '14px', borderRadius: '100px', background: '#f0fdf4', border: '2px solid #bbf7d0', color: '#16a34a', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        ✅ You&apos;re enrolled in this course
      </div>
    )
    if (enrollmentStatus === 'pending') return (
      <div style={{ padding: '14px', borderRadius: '100px', background: '#fffbeb', border: '2px solid #fde68a', color: '#d97706', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        ⏳ Enrollment request pending
      </div>
    )
    if (enrollmentStatus === 'waitlist') return (
      <div style={{ padding: '14px', borderRadius: '100px', background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        📋 You&apos;re on the waitlist
      </div>
    )
    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '100px', background: isFull ? '#6b7280' : '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', border: 'none', cursor: enrolling ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: enrolling ? 0.7 : 1, boxSizing: 'border-box' as const }}>
        {enrolling ? 'Enrolling...' : isFull ? '📋 Join Waitlist' : '🎓 Join This Course'}
      </button>
    )
  }

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

        <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '32px' }}>
          ← Back to courses
        </Link>

        {/* Hero card */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '36px', marginBottom: '24px' }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>{course.category}</span>
            <span style={{ fontSize: '0.75rem', background: '#f0f9ff', color: '#0369a1', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>{DELIVERY_LABELS[course.delivery_type]}</span>
            {course.format === 'group'
              ? <span style={{ fontSize: '0.75rem', background: '#f5f3ff', color: '#6d28d9', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>👥 Group · max {course.max_slots}</span>
              : <span style={{ fontSize: '0.75rem', background: '#fdf4ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>👤 1-on-1</span>
            }
            {course.skill_level && <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>{LEVEL_LABELS[course.skill_level]}</span>}
          </div>

          <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>{course.title}</h1>
          <p style={{ color: '#4b5563', lineHeight: 1.8, marginBottom: '24px', fontSize: '0.95rem' }}>{course.description}</p>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {course.language && (
              <div style={{ background: '#fafafa', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>LANGUAGE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>🗣 {course.language}</div>
              </div>
            )}
            {course.sessions_per_week && (
              <div style={{ background: '#fafafa', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>SCHEDULE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>📅 {course.sessions_per_week}×/week</div>
              </div>
            )}
            {course.session_duration && (
              <div style={{ background: '#fafafa', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>DURATION</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>⏱ {course.session_duration} min/session</div>
              </div>
            )}
            {course.start_date && (
              <div style={{ background: '#fafafa', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>STARTS</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>🗓 {new Date(course.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            )}
          </div>

          {/* Slots bar */}
          {course.format === 'group' && course.max_slots > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <SlotsBar max={course.max_slots} enrolled={course.enrolled_count || 0} />
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {enrollSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem', fontWeight: 500 }}>
              ✅ {isFull ? "You've been added to the waitlist!" : "Enrollment request sent! The instructor will approve shortly."}
            </div>
          )}

          <EnrollButton />
        </div>

        {/* Instructor card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#374151' }}>👨‍🏫 Your Instructor</h3>

          {isGuest ? (
            // ── GUEST: show name only, hide contact details ──
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                  {course.profiles?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{course.profiles?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {course.profiles?.country}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  try { localStorage.removeItem('gb_guest') } catch { /* ignore */ }
                  router.push('/complete-profile')
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '100px', background: 'rgba(192,122,26,0.07)', border: '1.5px dashed rgba(192,122,26,0.3)', color: '#C07A1A', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
                🔒 Create a profile to see contact details
              </button>
            </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                {course.profiles?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{course.profiles?.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '8px' }}>📍 {course.profiles?.country}</div>
                {(course.profiles?.languages?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {course.profiles.languages.map(l => (
                      <span key={l} style={{ fontSize: '0.7rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href={`/profile/${course.profiles?.id}`} style={{ padding: '8px 18px', borderRadius: '100px', background: '#fffbeb', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                  View Profile
                </Link>
                {course.profiles?.whatsapp_number && (
                  <a href={`https://wa.me/${course.profiles.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '8px 18px', borderRadius: '100px', background: '#25d366', color: '#fff', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                    💚 WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '100px', background: '#f9fafb', border: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}>
              🔒 Sign in to see instructor details
            </Link>
          )}
        </div>

      </div>
    </>
  )
}
