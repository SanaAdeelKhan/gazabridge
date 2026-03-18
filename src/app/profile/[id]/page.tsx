'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Profile = {
  id: string; name: string; role: string; country: string
  languages: string[]; linkedin?: string; whatsapp_number?: string
  whatsapp_group?: string; is_volunteer: boolean; is_seeker: boolean
}
type Offer = { id: string; category: string; description: string; availability: string }
type Request = { id: string; category: string; description: string }
type Course = {
  id: string; title: string; description: string; category: string
  delivery_type: string; format: string; max_slots: number
  enrolled_count: number; skill_level: string; language: string
  start_date: string | null
}

const DELIVERY_ICONS: Record<string, string> = {
  live: '💻 Live', recorded: '🎥 Recorded', hybrid: '🔀 Hybrid', async: '💬 Async',
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchProfile()
  }, [id])

  async function fetchProfile() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!prof) { router.push('/'); return }
    setProfile(prof)

    const [{ data: offersData }, { data: reqData }, { data: coursesData }] = await Promise.all([
      supabase.from('offers').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('requests').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('courses').select('*').eq('instructor_id', id).eq('status', 'active').order('created_at', { ascending: false }),
    ])

    if (offersData) setOffers(offersData)
    if (reqData) setRequests(reqData)
    if (coursesData) setCourses(coursesData)
    setLoading(false)
  }

  function handleMessage() {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${id}`)
  }

  // Split comma-separated categories into badges
  function CategoryBadges({ category, green = false }: { category: string; green?: boolean }) {
    const cats = category.split(',').map(c => c.trim()).filter(Boolean)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {cats.map(cat => (
          <span key={cat} style={{
            fontSize: '0.75rem', padding: '3px 12px', borderRadius: '100px', fontWeight: 600,
            background: green ? '#f0fdf4' : '#fffbeb',
            color: green ? '#16a34a' : '#b45309',
          }}>{cat}</span>
        ))}
      </div>
    )
  }

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Loading...</div></>

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px', fontFamily: 'inherit' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '36px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 }}>
              {profile?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="font-playfair" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>{profile?.name}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {profile?.is_volunteer && <span style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>🙌 Volunteer</span>}
                {profile?.is_seeker && <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>🌟 Seeker</span>}
                {profile?.country && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {profile.country}</span>}
              </div>
            </div>
          </div>

          {/* Languages */}
          {(profile?.languages?.length ?? 0) > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {profile?.languages?.map(l => (
                <span key={l} style={{ fontSize: '0.78rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '3px 12px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {user?.id !== id && (
              <button onClick={handleMessage} style={{ padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                💬 Send Message
              </button>
            )}
            {profile?.whatsapp_number && (
              <a href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '10px 24px', borderRadius: '100px', background: '#25d366', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                💚 WhatsApp
              </a>
            )}
            {profile?.whatsapp_group && (
              <a href={profile.whatsapp_group} target="_blank" rel="noopener noreferrer"
                style={{ padding: '10px 24px', borderRadius: '100px', background: '#128c7e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                👥 Join WhatsApp Group
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '10px 24px', borderRadius: '100px', background: '#f0f9ff', color: '#0077b5', border: '1px solid #bae6fd', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                🔗 LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Courses */}
        {courses.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 className="font-playfair" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>📚 Courses</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map(course => {
                const available = Math.max(0, course.max_slots - course.enrolled_count)
                const isFull = available === 0
                return (
                  <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 16px rgba(192,122,26,0.10)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {/* Badges row */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.72rem', background: '#fffbeb', color: '#b45309', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>{course.category}</span>
                        <span style={{ fontSize: '0.72rem', background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>{DELIVERY_ICONS[course.delivery_type] || course.delivery_type}</span>
                        {course.format === 'group'
                          ? <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#6d28d9', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>👥 Group</span>
                          : <span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>👤 1-on-1</span>}
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', fontWeight: 700, background: isFull ? '#fef2f2' : '#f0fdf4', color: isFull ? '#dc2626' : '#16a34a' }}>
                          {isFull ? '🔴 Full' : course.format === 'group' ? `🟢 ${available}/${course.max_slots} open` : '🟢 Accepting'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', marginBottom: '6px' }}>{course.title}</div>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {course.description}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '0.75rem', color: '#9ca3af' }}>
                        {course.skill_level && <span>📊 {course.skill_level}</span>}
                        {course.language && <span>🗣 {course.language}</span>}
                        {course.start_date && <span>🗓 Starts {new Date(course.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 className="font-playfair" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>🙌 Offers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {offers.map(offer => (
                <div key={offer.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px' }}>
                  <CategoryBadges category={offer.category} />
                  <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '10px' }}>{offer.description}</p>
                  {offer.availability && <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '6px' }}>🕐 {offer.availability}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests */}
        {requests.length > 0 && (
          <div>
            <h2 className="font-playfair" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>🌟 Requests</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map(req => (
                <div key={req.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '20px' }}>
                  <CategoryBadges category={req.category} green />
                  <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '10px' }}>{req.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
