'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Request = {
  id: string
  category: string
  description: string
  created_at: string
  profiles: { id: string; name: string; country: string; languages: string[]; linkedin?: string; whatsapp?: string; is_vetted?: boolean; is_admin?: boolean; english_level?: string }
}

type Profile = { role: string }

const categories = ['All', '📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills']

export default function NeedsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [filtered, setFiltered] = useState<Request[]>([])
  const [activecat, setActivecat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.from('requests').select('*, profiles(id, name, country, languages, linkedin, whatsapp, is_vetted, is_admin, english_level)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) { setRequests(data as any); setFiltered(data as any) } setLoading(false) })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => { if (data) setMyProfile(data) })
  }, [user])

  useEffect(() => {
    let result = requests
    if (activecat !== 'All') result = result.filter(r => r.category === activecat)
    if (search) result = result.filter(r =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.name.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activecat, search, requests])

  function handleOfferHelp(profileId: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}`)
  }

  function handleGiftCourse(profileId: string, seekerName: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}&gift=true`)
  }

  const isVolunteer = myProfile?.role === 'volunteer'

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>People Seeking Help</h1>
          <p style={{ color: '#9ca3af' }}>Browse requests from Gaza — reach out and offer your support</p>
          <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px', direction: 'rtl' }}>طلبات المساعدة من أهل غزة</p>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #d1fae5', fontSize: '0.9rem', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
          placeholder="Search requests..." />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActivecat(cat)} style={{
              padding: '8px 18px', borderRadius: '100px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
              border: activecat === cat ? '2px solid #4A5C3A' : '2px solid #e5e7eb',
              background: activecat === cat ? '#4A5C3A' : '#fff',
              color: activecat === cat ? '#fff' : '#374151',
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #d1fae5', padding: '24px', height: '200px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌟</div>
            <h3 className="font-playfair" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No requests yet</h3>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Be the first to post a request!</p>
            <a href="/join?role=seeker" style={{ padding: '12px 28px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Post a Request</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(req => (
              <div key={req.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #d1fae5', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s' }}>
                <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '100px' }}>
                  {req.category}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{req.profiles?.name}</div>
                    {req.profiles?.is_admin && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>⚙️ Admin</span>}
                    {req.profiles?.is_vetted && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>✅ Vetted</span>}
                    {req.profiles?.english_level && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '100px', background: req.profiles.english_level === 'Advanced' ? '#f0fdf4' : req.profiles.english_level === 'Intermediate' ? '#dbeafe' : '#fef3c7', color: req.profiles.english_level === 'Advanced' ? '#16a34a' : req.profiles.english_level === 'Intermediate' ? '#1d4ed8' : '#d97706', border: req.profiles.english_level === 'Advanced' ? '1px solid #bbf7d0' : req.profiles.english_level === 'Intermediate' ? '1px solid #bfdbfe' : '1px solid #fde68a' }}>{req.profiles.english_level === 'Beginner' ? '🌱 Beginner English' : req.profiles.english_level === 'Intermediate' ? '📘 Intermediate English' : '🏆 Advanced English'}</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {req.profiles?.country}</div>
                  {req.profiles?.whatsapp && <a href={req.profiles.whatsapp.startsWith('http') ? req.profiles.whatsapp : `https://wa.me/${req.profiles.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#25d366', fontWeight: 600, textDecoration: 'none' }}>💚 WhatsApp</a>}
                  {req.profiles?.linkedin && <a href={req.profiles.linkedin.startsWith('http') ? req.profiles.linkedin : `https://${req.profiles.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#0077b5', fontWeight: 600, textDecoration: 'none' }}>🔗 LinkedIn</a>}
                </div>
                <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>{req.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {req.profiles?.languages?.map(l => (
                    <span key={l} style={{ fontSize: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 10px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleOfferHelp(req.profiles?.id)}
                    style={{ width: '100%', padding: '10px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    🤝 Offer Help to {req.profiles?.name?.split(' ')[0]}
                  </button>
                  {user && isVolunteer && (
                    <button onClick={() => handleGiftCourse(req.profiles?.id, req.profiles?.name)}
                      style={{ width: '100%', padding: '10px', borderRadius: '100px', background: '#fffbeb', color: '#d97706', border: '2px solid #fde68a', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      🎁 Gift a Course
                    </button>
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
