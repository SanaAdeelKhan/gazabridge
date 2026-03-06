'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Profile = { name: string; role: string; country: string; languages: string[] }
type Offer = { id: string; category: string; description: string; availability: string }
type Request = { id: string; category: string; description: string }

const categories_vol = ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring']
const categories_seek = ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills']

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ category: '', description: '', availability: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
    if (prof) setProfile(prof)
    if (prof?.role === 'volunteer') {
      const { data } = await supabase.from('offers').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
      if (data) setOffers(data)
    } else {
      const { data } = await supabase.from('requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
      if (data) setRequests(data)
    }
    setLoading(false)
  }

  async function addItem() {
    if (!form.category || !form.description) return
    setSaving(true)
    if (profile?.role === 'volunteer') {
      await supabase.from('offers').insert({ user_id: user!.id, category: form.category, description: form.description, availability: form.availability, tags: [] })
    } else {
      await supabase.from('requests').insert({ user_id: user!.id, category: form.category, description: form.description, tags: [] })
    }
    setForm({ category: '', description: '', availability: '' })
    setShowAddForm(false)
    setSuccess('Added successfully!')
    setTimeout(() => setSuccess(''), 3000)
    fetchData()
    setSaving(false)
  }

  async function deleteOffer(id: string) {
    await supabase.from('offers').delete().eq('id', id)
    setOffers(o => o.filter(x => x.id !== id))
  }

  async function deleteRequest(id: string) {
    await supabase.from('requests').delete().eq('id', id)
    setRequests(r => r.filter(x => x.id !== id))
  }

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' as const }

  if (!user) return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h3 className="font-playfair" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Sign in to view your dashboard</h3>
        <Link href="/login" style={{ color: '#d97706' }}>Go to login →</Link>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div style={{ width: '100%', padding: '48px 24px', boxSizing: 'border-box' as const }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading...</div>
          ) : (
            <>
              {/* Profile card */}
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>
                  {profile?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 className="font-playfair" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{profile?.name}</h1>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 12px', borderRadius: '100px', background: profile?.role === 'volunteer' ? '#fffbeb' : '#f0fdf4', color: profile?.role === 'volunteer' ? '#b45309' : '#16a34a' }}>
                      {profile?.role === 'volunteer' ? '🙌 Volunteer' : '🌟 Member'}
                    </span>
                    {profile?.country && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {profile.country}</span>}
                  </div>
                  {(profile?.languages?.length ?? 0) > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {profile?.languages?.map(l => (
                        <span key={l} style={{ fontSize: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 10px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/messages" style={{ padding: '8px 20px', borderRadius: '100px', background: '#fffbeb', color: '#b45309', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
                    💬 Messages
                  </Link>
                  <button onClick={signOut} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Success banner */}
              {success && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontWeight: 500 }}>
                  ✅ {success}
                </div>
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 className="font-playfair" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                  {profile?.role === 'volunteer' ? 'Your Offers' : 'Your Requests'}
                </h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{
                  padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff',
                  border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  {showAddForm ? '✕ Cancel' : '+ Add New'}
                </button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '24px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>
                    {profile?.role === 'volunteer' ? 'Add a new offer' : 'Add a new request'}
                  </h3>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                      <option value="">Select a category</option>
                      {(profile?.role === 'volunteer' ? categories_vol : categories_seek).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                      placeholder={profile?.role === 'volunteer' ? 'Describe what you can offer...' : 'Describe what you need...'} />
                  </div>
                  {profile?.role === 'volunteer' && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Availability</label>
                      <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                        <option value="">Select availability</option>
                        <option>1–2 hours/week</option>
                        <option>3–5 hours/week</option>
                        <option>5–10 hours/week</option>
                        <option>10+ hours/week</option>
                      </select>
                    </div>
                  )}
                  <button onClick={addItem} disabled={saving} style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* List */}
              {profile?.role === 'volunteer' ? (
                offers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #fde68a', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                    <p style={{ color: '#9ca3af', marginBottom: '20px' }}>No offers yet</p>
                    <button onClick={() => setShowAddForm(true)} style={{ padding: '12px 28px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Post Your First Offer
                    </button>
                  </div>
                ) : offers.map(offer => (
                  <div key={offer.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '24px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>{offer.category}</span>
                      <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, marginTop: '10px' }}>{offer.description}</p>
                      {offer.availability && <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>⏱ {offer.availability}</p>}
                    </div>
                    <button onClick={() => deleteOffer(offer.id)} style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0, alignSelf: 'flex-start' }}
                      onMouseOver={e => (e.target as HTMLElement).style.color = '#ef4444'}
                      onMouseOut={e => (e.target as HTMLElement).style.color = '#d1d5db'}>
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #d1fae5', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                    <p style={{ color: '#9ca3af', marginBottom: '20px' }}>No requests yet</p>
                    <button onClick={() => setShowAddForm(true)} style={{ padding: '12px 28px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Post Your First Request
                    </button>
                  </div>
                ) : requests.map(req => (
                  <div key={req.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '24px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>{req.category}</span>
                      <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, marginTop: '10px' }}>{req.description}</p>
                    </div>
                    <button onClick={() => deleteRequest(req.id)} style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0, alignSelf: 'flex-start' }}
                      onMouseOver={e => (e.target as HTMLElement).style.color = '#ef4444'}
                      onMouseOut={e => (e.target as HTMLElement).style.color = '#d1d5db'}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
