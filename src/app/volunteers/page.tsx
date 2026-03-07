'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Offer = {
  id: string
  category: string
  description: string
  availability: string
  profiles: { id: string; name: string; country: string; languages: string[]; linkedin?: string }
}

const categories = ['All', '📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring']

export default function VolunteersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filtered, setFiltered] = useState<Offer[]>([])
  const [activecat, setActivecat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('offers').select('*, profiles(id, name, country, languages, linkedin)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) { setOffers(data as any); setFiltered(data as any) } setLoading(false) })
  }, [])

  useEffect(() => {
    let result = offers
    if (activecat !== 'All') result = result.filter(o => o.category === activecat)
    if (search) result = result.filter(o =>
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.profiles?.name.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activecat, search, offers])

  function handleMessage(profileId: string) {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${profileId}`)
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Volunteer Offers</h1>
          <p style={{ color: '#9ca3af' }}>People offering their skills for free — browse and connect directly</p>
          <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px', direction: 'rtl' }}>المتطوعون يقدمون مهاراتهم مجاناً</p>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
          placeholder="Search by skill, name..." />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActivecat(cat)} style={{
              padding: '8px 18px', borderRadius: '100px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
              border: activecat === cat ? '2px solid #d97706' : '2px solid #e5e7eb',
              background: activecat === cat ? '#d97706' : '#fff',
              color: activecat === cat ? '#fff' : '#374151',
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '24px', height: '200px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 className="font-playfair" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No offers found</h3>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Be the first to offer!</p>
            <a href="/join?role=volunteer" style={{ padding: '12px 28px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Post Your Offer</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(offer => (
              <div key={offer.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s' }}>
                <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#fffbeb', color: '#b45309', padding: '4px 12px', borderRadius: '100px' }}>
                  {offer.category}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{offer.profiles?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {offer.profiles?.country}</div>
                {offer.profiles?.linkedin && <a href={offer.profiles.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#0077b5', fontWeight: 600, textDecoration: 'none' }}>🔗 LinkedIn</a>}
                </div>
                <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>{offer.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {offer.profiles?.languages?.map(l => (
                    <span key={l} style={{ fontSize: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 10px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                  ))}
                  {offer.availability && (
                    <span style={{ fontSize: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 10px', borderRadius: '100px', color: '#6b7280' }}>⏱ {offer.availability}</span>
                  )}
                </div>
                <button onClick={() => handleMessage(offer.profiles?.id)}
                  style={{ width: '100%', padding: '10px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  💬 Message {offer.profiles?.name?.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
