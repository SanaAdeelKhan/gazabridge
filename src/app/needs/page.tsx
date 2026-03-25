'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SubjectTabs from '@/components/SubjectTabs'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Request = {
  id: string
  category: string
  description: string
  created_at: string
  profiles: {
    id: string
    name: string
    country: string
    languages: string[]
    linkedin?: string
    whatsapp?: string
    is_vetted?: boolean
    is_admin?: boolean
    english_level?: string
    gender?: string
  }
}

type Profile = { role: string }
type EnrolledCourseMap = Record<string, { id: string; title: string; status: string }>

export default function NeedsPage() {
  const { user, isGuest } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [filtered, setFiltered] = useState<Request[]>([])
  const [activecat, setActivecat] = useState('')
  const [activelabel, setActivelabel] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [enrolledMap, setEnrolledMap] = useState<EnrolledCourseMap>({})

  useEffect(() => {
    supabase
      .from('requests')
      .select('*, profiles(id, name, country, languages, linkedin, whatsapp, is_vetted, is_admin, english_level, gender)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) { setRequests(data as any); setFiltered(data as any) }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!user || isGuest) return
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => { if (data) setMyProfile(data) })

    supabase
      .from('enrollments')
      .select('student_id, status, courses(id, title)')
      .eq('status', 'approved')
      .then(({ data }) => {
        if (!data) return
        const map: EnrolledCourseMap = {}
        data.forEach((e: any) => {
          if (!map[e.student_id] && e.courses) {
            map[e.student_id] = { id: e.courses.id, title: e.courses.title, status: e.status }
          }
        })
        setEnrolledMap(map)
      })
  }, [user, isGuest])

  useEffect(() => {
    let result = requests
    if (activecat) result = result.filter(r => r.category === activecat)
    if (search) result = result.filter(r =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.name?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activecat, search, requests])

  function handleOfferHelp(profileId: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}`)
  }

  function handleGiftCourse(profileId: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}&gift=true`)
  }

  const isVolunteer = myProfile?.role === 'volunteer'

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>People Seeking Help</h1>
          <p style={{ color: '#9ca3af' }}>Browse requests from Gaza — reach out and offer your support</p>
          <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px', direction: 'rtl' }}>طلبات المساعدة من أهل غزة</p>
        </div>

        {/* Guest notice */}
        {isGuest && (
          <div style={{ background: 'rgba(92,107,46,0.07)', border: '1px solid rgba(92,107,46,0.2)', borderRadius: '14px', padding: '0.75rem 1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: '#3D3D2E' }}>
              🔒 <strong>Guest mode:</strong> Contact details and actions are hidden. Create a profile to offer help.
            </span>
            <button onClick={() => { try { localStorage.removeItem('gb_guest') } catch { /* ignore */ } router.push('/complete-profile') }}
              style={{ background: 'linear-gradient(135deg, #5C6B2E, #7A8F3D)', color: '#fff', border: 'none', borderRadius: '50px', padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Join free →
            </button>
          </div>
        )}

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #d1fae5', fontSize: '0.9rem', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
          placeholder="Search requests..."
        />

        {/* Category tabs */}
        <SubjectTabs
          mode="needs"
          activeLabel={activelabel}
          onChange={(_, requestCat) => { setActivecat(requestCat); setActivelabel(requestCat ? requestCat : '') }}
        />

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '20px', height: '80px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌟</div>
            <h3 className="font-cormorant" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No requests yet</h3>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Be the first to post a request!</p>
            <a href="/join?role=seeker" style={{ padding: '12px 28px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Post a Request</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(req => {
              const enrolledCourse = enrolledMap[req.profiles?.id]
              return (
                <div
                  key={req.id}
                  style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 16px rgba(16,163,74,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Avatar */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {req.profiles?.name?.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                    {/* Name visible to all, personal details hidden from guests */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{req.profiles?.name}</span>
                      {!isGuest && req.profiles?.is_admin && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>⚙️ Admin</span>
                      )}
                      {!isGuest && req.profiles?.is_vetted && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>✅ Vetted</span>
                      )}
                    </div>

                    {/* Country visible, gender hidden from guests */}
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>
                      📍 {req.profiles?.country}
                      {!isGuest && req.profiles?.gender ? ` · ${req.profiles.gender}` : ''}
                    </div>

                    {/* Languages — hidden from guests */}
                    {!isGuest && (req.profiles?.languages?.length ?? 0) > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {req.profiles.languages.map(l => (
                          <span key={l} style={{ fontSize: '0.68rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '1px 7px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category + description — visible to all */}
                  <div style={{ flex: '2 1 220px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>
                      {req.category}
                    </span>
                    {/* English level hidden from guests */}
                    {!isGuest && req.profiles?.english_level && (
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', marginLeft: '6px',
                        background: req.profiles.english_level === 'Advanced' ? '#f0fdf4' : req.profiles.english_level === 'Intermediate' ? '#dbeafe' : '#fef3c7',
                        color: req.profiles.english_level === 'Advanced' ? '#16a34a' : req.profiles.english_level === 'Intermediate' ? '#1d4ed8' : '#d97706',
                      }}>
                        {req.profiles.english_level === 'Beginner' ? '🌱 Beginner' : req.profiles.english_level === 'Intermediate' ? '📘 Intermediate' : '🏆 Advanced'}
                      </span>
                    )}
                    <p style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5, margin: '6px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {req.description}
                    </p>
                  </div>

                  {/* Enrolled course badge — hidden from guests */}
                  {!isGuest && enrolledCourse && user && (
                    <div style={{ flex: '0 0 auto' }}>
                      <Link href={`/courses/${enrolledCourse.id}`}
                        style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', padding: '7px 14px', borderRadius: '12px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', textDecoration: 'none' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>✅ Enrolled</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', whiteSpace: 'nowrap' }}>
                          📚 {enrolledCourse.title.length > 22 ? enrolledCourse.title.slice(0, 22) + '…' : enrolledCourse.title}
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ flex: '0 0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isGuest ? (
                      // Guest lock wall
                      <button onClick={() => { try { localStorage.removeItem('gb_guest') } catch { /* ignore */ } router.push('/complete-profile') }}
                        style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(92,107,46,0.07)', color: '#5C6B2E', border: '1.5px dashed rgba(92,107,46,0.3)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        🔒 Sign up to help
                      </button>
                    ) : user ? (
                      <>
                        <button onClick={() => handleOfferHelp(req.profiles?.id)}
                          style={{ padding: '8px 16px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          🤝 Offer Help
                        </button>
                        {isVolunteer && (
                          <button onClick={() => handleGiftCourse(req.profiles?.id)}
                            style={{ padding: '8px 16px', borderRadius: '100px', background: '#fffbeb', color: '#d97706', border: '2px solid #fde68a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            🎁 Gift Course
                          </button>
                        )}
                        {req.profiles?.whatsapp && (
                          <a href={req.profiles.whatsapp.startsWith('http') ? req.profiles.whatsapp : `https://wa.me/${req.profiles.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding: '8px 14px', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                            💚
                          </a>
                        )}
                      </>
                    ) : (
                      <Link href="/login" style={{ padding: '8px 18px', borderRadius: '100px', background: '#f9fafb', border: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        🔒 Sign in
                      </Link>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
