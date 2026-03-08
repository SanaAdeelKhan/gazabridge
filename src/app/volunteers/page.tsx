'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Offer = {
  id: string
  category: string
  description: string
  availability: string
  profiles: { id: string; name: string; country: string; languages: string[]; linkedin?: string; whatsapp_number?: string; whatsapp_group?: string }
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
    supabase.from('offers').select('*, profiles(id, name, country, languages, linkedin, whatsapp_number, whatsapp_group)')
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
            <p style={{ color: '#9ca3af' }}>No volunteers found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(offer => (
              <div key={offer.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Category badge */}
                <span style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, alignSelf: 'flex-start' }}>
                  {offer.category}
                </span>

                {/* Description */}
                <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{offer.description}</p>

                {/* Availability */}
                {offer.availability && (
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>🕐 {offer.availability}</p>
                )}

                {/* Profile info — clickable name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                  <Link href={`/profile/${offer.profiles?.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      {offer.profiles?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a2e' }}>{offer.profiles?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{offer.profiles?.country}</div>
                    </div>
                  </Link>
                </div>

                {/* Languages */}
                {(offer.profiles?.languages?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {offer.profiles.languages.map(l => (
                      <span key={l} style={{ fontSize: '0.7rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleMessage(offer.profiles?.id)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    💬 Message
                  </button>

                  {offer.profiles?.whatsapp_number && (
                    <a
                    
                      href={`https://wa.me/${offer.profiles.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '100px', background: '#25d366', color: '#fff', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center' }}
                    >
                      💚 WhatsApp
                    </a>
                  )}

                  {offer.profiles?.whatsapp_group && (
                    <a
                      href={offer.profiles.whatsapp_group}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '100px', background: '#128c7e', color: '#fff', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center' }}
                    >
                      👥 Join Group
                    </a>
                  )}

                  {offer.profiles?.linkedin && (
                    <a
                      href={offer.profiles.linkedin.startsWith('http') ? offer.profiles.linkedin : `https://${offer.profiles.linkedin}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ padding: '9px 12px', borderRadius: '100px', background: '#f0f9ff', color: '#0077b5', border: '1px solid #bae6fd', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      in
                    </a>
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
