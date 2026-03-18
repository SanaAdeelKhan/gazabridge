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
  category: string
  delivery_type: string
  format: string
  max_slots: number
  enrolled_count: number
  auto_approve: boolean
  status: string
  instructor_id: string
}

type Enrollment = {
  id: string
  status: string
  enrolled_at: string
  student_id: string
  profiles: {
    id: string
    name: string
    country: string
    languages: string[]
    whatsapp_number?: string
    linkedin?: string
  }
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: '⏳ Pending',  bg: '#fffbeb', color: '#d97706' },
  approved: { label: '✅ Approved', bg: '#f0fdf4', color: '#16a34a' },
  rejected: { label: '❌ Rejected', bg: '#fef2f2', color: '#dc2626' },
  waitlist: { label: '📋 Waitlist', bg: '#f5f3ff', color: '#6d28d9' },
}

export default function ManageCoursePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', max_slots: 5, start_date: '', end_date: '', meeting_link: '', recording_link: '', sessions_per_week: '', session_duration: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'waitlist' | 'all'>('pending')

  useEffect(() => {
    if (user) fetchData()
  }, [id, user])

  async function fetchData() {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (!courseData) { router.push('/courses'); return }
    if (courseData.instructor_id !== user!.id) { router.push(`/courses/${id}`); return }

    setCourse(courseData)
    setEditForm({
      title: courseData.title,
      description: courseData.description,
      max_slots: courseData.max_slots,
      start_date: courseData.start_date || '',
      end_date: courseData.end_date || '',
      meeting_link: courseData.meeting_link || '',
      recording_link: courseData.recording_link || '',
      sessions_per_week: courseData.sessions_per_week || '',
      session_duration: courseData.session_duration || '',
    })

    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('*, profiles(id, name, country, languages, whatsapp_number, linkedin)')
      .eq('course_id', id)
      .order('enrolled_at', { ascending: false })

    if (enrollData) setEnrollments(enrollData as any)
    setLoading(false)
  }

  async function saveEdit() {
    setSavingEdit(true)
    const { error } = await supabase.from('courses').update({
      title: editForm.title,
      description: editForm.description,
      max_slots: editForm.max_slots,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
      meeting_link: editForm.meeting_link || null,
      recording_link: editForm.recording_link || null,
      sessions_per_week: editForm.sessions_per_week || null,
      session_duration: editForm.session_duration || null,
    }).eq('id', id)
    if (!error) {
      await fetchData()
      setShowEdit(false)
      flash('✅ Course updated!')
    }
    setSavingEdit(false)
  }

  async function toggleAutoApprove() {
    if (!course) return
    setSavingToggle(true)
    const newVal = !course.auto_approve
    const { error } = await supabase
      .from('courses')
      .update({ auto_approve: newVal })
      .eq('id', id)
    if (!error) {
      setCourse(c => c ? { ...c, auto_approve: newVal } : c)
      // If turning on auto-approve, approve all pending
      if (newVal) {
        const pending = enrollments.filter(e => e.status === 'pending')
        for (const e of pending) {
          await supabase.from('enrollments').update({ status: 'approved' }).eq('id', e.id)
        }
        await fetchData()
        flash('All pending requests auto-approved!')
      } else {
        flash('Switched to manual approval')
      }
    }
    setSavingToggle(false)
  }

  async function updateStatus(enrollmentId: string, status: 'approved' | 'rejected') {
    setActionLoading(enrollmentId)
    await supabase.from('enrollments').update({ status }).eq('id', enrollmentId)
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status } : e))
    // update local enrolled_count
    if (status === 'approved') setCourse(c => c ? { ...c, enrolled_count: c.enrolled_count + 1 } : c)
    flash(status === 'approved' ? '✅ Student approved!' : '❌ Request rejected')
    setActionLoading(null)
  }

  async function approveAll() {
    const pending = enrollments.filter(e => e.status === 'pending')
    for (const e of pending) {
      await supabase.from('enrollments').update({ status: 'approved' }).eq('id', e.id)
    }
    await fetchData()
    flash(`✅ ${pending.length} requests approved!`)
  }

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const tabs = ['pending', 'approved', 'waitlist', 'rejected', 'all'] as const
  const tabCounts = tabs.reduce((acc, t) => {
    acc[t] = t === 'all' ? enrollments.length : enrollments.filter(e => e.status === t).length
    return acc
  }, {} as Record<string, number>)

  const displayed = activeTab === 'all' ? enrollments : enrollments.filter(e => e.status === activeTab)
  const pendingCount = enrollments.filter(e => e.status === 'pending').length

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
    </>
  )

  if (!course) return null

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Back */}
        <Link href={`/courses/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '32px' }}>
          ← Back to course
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>⚙️ Manage Course</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{course.title}</p>
        </div>

        {/* Success toast */}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontWeight: 500, fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Enrolled', value: course.enrolled_count, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Pending', value: pendingCount, bg: '#fffbeb', color: '#d97706' },
            { label: 'Slots Left', value: Math.max(0, course.max_slots - course.enrolled_count), bg: '#f0f9ff', color: '#0369a1' },
            { label: 'Total Requests', value: enrollments.length, bg: '#fafafa', color: '#6b7280' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={() => setShowEdit(!showEdit)}
            style={{ padding: '9px 22px', borderRadius: '100px', background: showEdit ? '#f3f4f6' : '#fffbeb', color: showEdit ? '#6b7280' : '#b45309', border: `1.5px solid ${showEdit ? '#e5e7eb' : '#fde68a'}`, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {showEdit ? '✕ Cancel Edit' : '✏️ Edit Course'}
          </button>
        </div>

        {/* Edit form */}
        {showEdit && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>✏️ Edit Course Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Max Students / Slots</label>
                <input type="number" min={1} max={100} value={editForm.max_slots} onChange={e => setEditForm(f => ({ ...f, max_slots: parseInt(e.target.value) || 1 }))}
                  style={{ width: '140px', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Sessions/week</label>
                  <input type="number" min={1} max={7} value={editForm.sessions_per_week} onChange={e => setEditForm(f => ({ ...f, sessions_per_week: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} placeholder="e.g. 2" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Session duration (min)</label>
                  <input type="number" min={15} value={editForm.session_duration} onChange={e => setEditForm(f => ({ ...f, session_duration: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} placeholder="e.g. 60" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Start Date</label>
                  <input type="date" value={editForm.start_date} onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>End Date</label>
                  <input type="date" value={editForm.end_date} onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Meeting Link (Zoom/Meet)</label>
                <input value={editForm.meeting_link} onChange={e => setEditForm(f => ({ ...f, meeting_link: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} placeholder="https://zoom.us/..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Recording Link</label>
                <input value={editForm.recording_link} onChange={e => setEditForm(f => ({ ...f, recording_link: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }} placeholder="YouTube / Drive link" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={saveEdit} disabled={savingEdit}
                  style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: savingEdit ? 0.7 : 1 }}>
                  {savingEdit ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button onClick={() => setShowEdit(false)}
                  style={{ padding: '12px 24px', borderRadius: '100px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-approve toggle */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Auto-approve enrollments</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '3px' }}>
              {course.auto_approve
                ? 'New requests are approved instantly — no action needed from you'
                : 'You manually approve or reject each request below'}
            </div>
          </div>
          <button
            onClick={toggleAutoApprove}
            disabled={savingToggle}
            style={{
              width: '52px', height: '28px', borderRadius: '100px', border: 'none', cursor: 'pointer',
              background: course.auto_approve ? '#16a34a' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              opacity: savingToggle ? 0.6 : 1,
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '4px',
              left: course.auto_approve ? '28px' : '4px',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {/* Approve all button for pending */}
        {pendingCount > 1 && !course.auto_approve && (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={approveAll}
              style={{ padding: '9px 22px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ✅ Approve All Pending ({pendingCount})
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{
                padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                border: activeTab === t ? '2px solid #d97706' : '2px solid #e5e7eb',
                background: activeTab === t ? '#d97706' : '#fff',
                color: activeTab === t ? '#fff' : '#6b7280',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} {tabCounts[t] > 0 && `(${tabCounts[t]})`}
            </button>
          ))}
        </div>

        {/* Enrollment list */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed #fde68a', borderRadius: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
            <p style={{ color: '#9ca3af' }}>No {activeTab === 'all' ? '' : activeTab} requests yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayed.map(e => (
              <div key={e.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

                {/* Avatar */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {e.profiles?.name?.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{e.profiles?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                    📍 {e.profiles?.country} · Requested {new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                  {(e.profiles?.languages?.length ?? 0) > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                      {e.profiles.languages.map((l: string) => (
                        <span key={l} style={{ fontSize: '0.67rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '1px 7px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: STATUS_LABELS[e.status]?.bg, color: STATUS_LABELS[e.status]?.color, whiteSpace: 'nowrap' }}>
                  {STATUS_LABELS[e.status]?.label}
                </span>

                {/* Contact */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Link href={`/messages?to=${e.profiles?.id}`} style={{ padding: '6px 14px', borderRadius: '100px', background: '#fffbeb', color: '#b45309', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', border: '1px solid #fde68a' }}>
                    💬
                  </Link>
                  {e.profiles?.whatsapp_number && (
                    <a href={`https://wa.me/${e.profiles.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '6px 14px', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', border: '1px solid #bbf7d0' }}>
                      💚
                    </a>
                  )}
                </div>

                {/* Approve / Reject — only for pending */}
                {e.status === 'pending' && !course.auto_approve && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => updateStatus(e.id, 'approved')}
                      disabled={actionLoading === e.id}
                      style={{ padding: '7px 18px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading === e.id ? 0.6 : 1 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(e.id, 'rejected')}
                      disabled={actionLoading === e.id}
                      style={{ padding: '7px 18px', borderRadius: '100px', background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading === e.id ? 0.6 : 1 }}
                    >
                      Reject
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
