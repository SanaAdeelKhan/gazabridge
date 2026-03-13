'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NewNavbar from '@/components/NewNavbar'
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

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchProfile()
  }, [id])

  async function fetchProfile() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!prof) { router.push('/'); return }
    setProfile(prof)
    const { data: offersData } = await supabase.from('offers').select('*').eq('user_id', id).order('created_at', { ascending: false })
    if (offersData) setOffers(offersData)
    const { data: reqData } = await supabase.from('requests').select('*').eq('user_id', id).order('created_at', { ascending: false })
    if (reqData) setRequests(reqData)
    setLoading(false)
  }

  function handleMessage() {
    if (!user) { router.push('/login'); return }
    router.push(`/messages?to=${id}`)
  }

  if (loading) return <><NewNavbar /><div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Loading...</div></>

  return (
    <>
      <NewNavbar />
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

        {/* Offers */}
        {offers.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 className="font-playfair" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>🙌 Offers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {offers.map(offer => (
                <div key={offer.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>{offer.category}</span>
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
                  <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>{req.category}</span>
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
