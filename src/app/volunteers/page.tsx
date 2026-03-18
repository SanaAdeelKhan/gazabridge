'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import SubjectTabs from '@/components/SubjectTabs'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Offer = {
  id: string
  category: string
  description: string
  availability: string
}

type Course = {
  id: string
  title: string
  max_slots: number
  enrolled_count: number
  format: string
}

type Volunteer = {
  id: string
  name: string
  country: string
  languages: string[]
  linkedin?: string
  whatsapp_number?: string
  whatsapp_group?: string
  is_admin?: boolean
  gender?: string
  offers: Offer[]
  courses: Course[]
}

export default function VolunteersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [filtered, setFiltered] = useState<Volunteer[]>([])
  const [activecat, setActivecat] = useState('')
  const [activelabel, setActivelabel] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase
        .from('offers')
        .select('*, profiles(id, name, country, languages, linkedin, whatsapp_number, whatsapp_group, is_admin, gender)')
        .order('created_at', { ascending: false }),
      supabase
        .from('courses')
        .select('id, title, instructor_id, max_slots, enrolled_count, format')
        .eq('status', 'active'),
    ]).then(([{ data: offersData }, { data: coursesData }]) => {
      if (!offersData) { setLoading(false); return }

      // Group offers by volunteer profile
      const volMap: Record<string, Volunteer> = {}
      offersData.forEach((o: any) => {
        const p = o.profiles
        if (!p) return
        if (!volMap[p.id]) {
          volMap[p.id] = {
            id: p.id,
            name: p.name,
            country: p.country,
            languages: p.languages || [],
            linkedin: p.linkedin,
            whatsapp_number: p.whatsapp_number,
            whatsapp_group: p.whatsapp_group,
            is_admin: p.is_admin,
            gender: p.gender,
            offers: [],
            courses: [],
          }
        }
        volMap[p.id].offers.push({
          id: o.id,
          category: o.category,
          description: o.description,
          availability: o.availability,
        })
      })

      // Attach courses to volunteers
      if (coursesData) {
        coursesData.forEach((c: any) => {
          if (volMap[c.instructor_id]) {
            volMap[c.instructor_id].courses.push({
              id: c.id,
              title: c.title,
              max_slots: c.max_slots,
              enrolled_count: c.enrolled_count,
              format: c.format,
            })
          }
        })
      }

      const volList = Object.values(volMap)
      setVolunteers(volList)
      setFiltered(volList)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = volunteers
    if (activecat) result = result.filter(v => v.offers.some(o => o.category === activecat))
    if (search) result = result.filter(v =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.offers.some(o => o.description.toLowerCase().includes(search.toLowerCase()))
    )
    setFiltered(result)
  }, [activecat, search, volunteers])

  function handleMessage(profileId: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}`)
  }

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)', animation: 'shaderDrift 14s ease-in-out infinite alternate', backgroundSize: '200% 200%' }} />
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Volunteer Offers</h1>
          <p style={{ color: '#9ca3af' }}>People offering their skills for free — browse and connect directly</p>
          <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px', direction: 'rtl' }}>المتطوعون يقدمون مهاراتهم مجاناً</p>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
          placeholder="Search by skill, name..."
        />

        {/* Category tabs */}
        <SubjectTabs
          mode="volunteers"
          activeLabel={activelabel}
          onChange={(offerCat, _) => { setActivecat(offerCat); setActivelabel(offerCat ? offerCat : '') }}
        />

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px', height: '100px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: '#9ca3af' }}>No volunteers found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(vol => (
              <div
                key={vol.id}
                style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px 24px', display: 'flex', gap: '20px', flexWrap: 'wrap', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 16px rgba(192,122,26,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* LEFT: Avatar + name + meta + actions */}
                <div style={{ flex: '0 0 180px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                      {vol.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      {user ? (
                        <Link href={`/profile/${vol.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{vol.name}</span>
                            {vol.is_admin && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>⚙️</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>📍 {vol.country}{vol.gender ? ` · ${vol.gender}` : ''}</div>
                        </Link>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{vol.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>📍 {vol.country}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  {vol.languages.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {vol.languages.map(l => (
                        <span key={l} style={{ fontSize: '0.65rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '1px 7px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {user ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleMessage(vol.id)}
                        style={{ padding: '7px 14px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        💬 Message
                      </button>
                      {vol.whatsapp_number && (
                        <a href={`https://wa.me/${vol.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '7px 12px', borderRadius: '100px', background: '#25d366', color: '#fff', fontWeight: 600, fontSize: '0.76rem', textDecoration: 'none' }}>💚</a>
                      )}
                      {vol.linkedin && (
                        <a href={vol.linkedin.startsWith('http') ? vol.linkedin : `https://${vol.linkedin}`} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '7px 12px', borderRadius: '100px', background: '#f0f9ff', color: '#0077b5', border: '1px solid #bae6fd', fontWeight: 600, fontSize: '0.76rem', textDecoration: 'none' }}>in</a>
                      )}
                    </div>
                  ) : (
                    <Link href="/login" style={{ display: 'block', padding: '7px 14px', borderRadius: '100px', background: '#f9fafb', border: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.76rem', textDecoration: 'none', textAlign: 'center' }}>
                      🔒 Sign in
                    </Link>
                  )}
                </div>

                {/* MIDDLE: All offers */}
                <div style={{ flex: '2 1 240px', minWidth: 0, borderLeft: '1px solid #f3f4f6', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Offers
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {vol.offers.map(offer => (
                      <div key={offer.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <>{offer.category.split(',').map((cat: string) => cat.trim()).filter(Boolean).map((cat: string) => (<span key={cat} style={{ fontSize: '0.71rem', background: '#fffbeb', color: '#b45309', padding: '2px 10px', borderRadius: '100px', fontWeight: 600, marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>{cat}</span>))}</>
                          {offer.availability && (
                            <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>🕐 {offer.availability}</span>
                          )}
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.81rem', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {offer.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Courses */}
                <div style={{ flex: '1 1 150px', minWidth: 0, borderLeft: '1px solid #f3f4f6', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Courses
                  </div>
                  {vol.courses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {vol.courses.map(course => {
                        const available = Math.max(0, course.max_slots - course.enrolled_count)
                        const isFull = available === 0
                        return (
                          <Link key={course.id} href={`/courses/${course.id}`}
                            style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', padding: '7px 12px', borderRadius: '12px', background: isFull ? '#fef2f2' : '#f0fdf4', border: `1.5px solid ${isFull ? '#fecaca' : '#bbf7d0'}`, textDecoration: 'none' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isFull ? '#dc2626' : '#16a34a', whiteSpace: 'nowrap' }}>
                              {isFull ? '🔴 Full' : course.format === 'group' ? `🟢 ${available}/${course.max_slots} open` : '🟢 Accepting'}
                            </span>
                            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#374151' }}>
                              📚 {course.title.length > 20 ? course.title.slice(0, 20) + '…' : course.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📚 No course yet</span>
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
