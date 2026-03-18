'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
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
  status: string
  created_at: string
  instructor_id: string
  profiles: {
    id: string
    name: string
    country: string
    languages: string[]
    is_admin?: boolean
  }
}

const CATEGORIES = [
  'All',
  '📚 Teaching / Language',
  '💻 Tech / Coding / AI',
  '💼 Career / Mentorship',
  '🫂 Mental Health',
  '🎨 Creative / Design',
  '📖 Academic Tutoring',
  '🌐 Other',
]

const DELIVERY_ICONS: Record<string, string> = {
  live: '💻 Live',
  recorded: '🎥 Recorded',
  hybrid: '🔀 Hybrid',
  async: '💬 Async',
}

const LEVEL_ICONS: Record<string, string> = {
  Beginner: '🌱 Beginner',
  Intermediate: '📘 Intermediate',
  Advanced: '🏆 Advanced',
}

function SlotsIndicator({ max, enrolled }: { max: number; enrolled: number }) {
  const available = Math.max(0, max - enrolled)
  const pct = enrolled / max
  if (pct >= 1)
    return <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '3px 10px', borderRadius: '100px' }}>🔴 Full — waitlist open</span>
  if (pct >= 0.8)
    return <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '3px 10px', borderRadius: '100px' }}>🟡 {available} slot{available !== 1 ? 's' : ''} left</span>
  return <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: '100px' }}>🟢 {available} of {max} available</span>
}

export default function CoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('courses')
      .select('*, profiles(id, name, country, languages, is_admin)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) { setCourses(data as any); setFiltered(data as any) }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = courses
    if (activeCategory !== 'All') result = result.filter(c => c.category === activeCategory)
    if (search) result = result.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.profiles?.name?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activeCategory, search, courses])

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Free Courses</h1>
            <p style={{ color: '#9ca3af' }}>Structured learning from volunteers around the world — free for Gaza</p>
            <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px', direction: 'rtl' }}>دورات مجانية من متطوعين حول العالم</p>
          </div>
          {user && (
            <Link href="/courses/create" style={{ padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              + Offer a Course
            </Link>
          )}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
          placeholder="Search by course, skill, instructor..."
        />

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                border: activeCategory === cat ? '2px solid #d97706' : '2px solid #e5e7eb',
                background: activeCategory === cat ? '#d97706' : '#fff',
                color: activeCategory === cat ? '#fff' : '#374151',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '24px', height: '260px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
            <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No courses found</p>
            {user && (
              <Link href="/courses/create" style={{ padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Be the first to offer one
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map(course => (
              <div key={course.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(192,122,26,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Top badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', background: '#fffbeb', color: '#b45309', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>
                    {course.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>
                    {DELIVERY_ICONS[course.delivery_type] || course.delivery_type}
                  </span>
                  {course.format === 'group' ? (
                    <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#6d28d9', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>👥 Group</span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>👤 1-on-1</span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.4 }}>{course.title}</h3>

                {/* Description */}
                <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#9ca3af' }}>
                  {course.skill_level && <span>{LEVEL_ICONS[course.skill_level] || course.skill_level}</span>}
                  {course.language && <span>🗣 {course.language}</span>}
                  {course.sessions_per_week && course.session_duration && (
                    <span>⏱ {course.sessions_per_week}×/wk · {course.session_duration}min</span>
                  )}
                </div>

                {/* Slots */}
                {course.format === 'group' && course.max_slots > 0 && (
                  <SlotsIndicator max={course.max_slots} enrolled={course.enrolled_count || 0} />
                )}

                {/* Instructor + CTA */}
                <div style={{ paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                  {user ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                          {course.profiles?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a2e' }}>{course.profiles?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{course.profiles?.country}</div>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
                      >
                        📖 View &amp; Enroll
                      </Link>
                    </>
                  ) : (
                    <Link href="/login" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '100px', background: '#f9fafb', border: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}>
                      🔒 Sign in to enroll
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
