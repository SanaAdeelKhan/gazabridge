'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { sendWelcomeMessageIfNew } from '@/components/sendWelcomeMessage'
import OfferMatches from '@/components/OfferMatches'
import RequestMatches from '@/components/RequestMatches'

type Profile = { name: string; role: string; country: string; languages: string[]; linkedin?: string; whatsapp_number?: string; whatsapp_group?: string; english_level?: string; gender?: string }
type Offer = { id: string; category: string; description: string; availability: string }
type Request = { id: string; category: string; description: string }

const categories_vol = ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring', '🌐 Other']
const categories_seek = ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills', '🌐 Other']
const all_langs = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German', 'Other']

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  // Separate add-form state for offers vs requests
  const [showAddOffer, setShowAddOffer] = useState(false)
  const [showAddRequest, setShowAddRequest] = useState(false)
  const [offerForm, setOfferForm] = useState({ category: '', description: '', availability: '' })
  const [requestForm, setRequestForm] = useState({ category: '', description: '' })

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', country: '', linkedin: '', whatsapp_number: '', whatsapp_group: '', languages: [] as string[], gender: '' })
  const [saving, setSaving] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [success, setSuccess] = useState('')

  const router = useRouter()

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchData()
      sendWelcomeMessageIfNew(user.id)
    }
  }, [user])

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!profile || !profile.role || !profile.name) {
      router.push('/complete-profile')
    }
  }, [loading, profile])

  async function fetchData() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
    if (prof) {
      setProfile(prof)
      setEditForm({ name: prof.name || '', country: prof.country || '', linkedin: prof.linkedin || '', whatsapp_number: prof.whatsapp_number || '', whatsapp_group: prof.whatsapp_group || '', languages: prof.languages || [], gender: prof.gender || '' })
    }
    // Always fetch BOTH offers and requests regardless of role
    const [{ data: offersData }, { data: requestsData }] = await Promise.all([
      supabase.from('offers').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    ])
    if (offersData) setOffers(offersData)
    if (requestsData) setRequests(requestsData)
    setLoading(false)
  }

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase.from('profiles').update({
      name: editForm.name, country: editForm.country, linkedin: editForm.linkedin,
      whatsapp_number: editForm.whatsapp_number, whatsapp_group: editForm.whatsapp_group,
      languages: editForm.languages, gender: editForm.gender,
    }).eq('id', user!.id)
    if (!error) {
      setSuccess('Profile updated!')
      setTimeout(() => setSuccess(''), 3000)
      setShowEditProfile(false)
      fetchData()
    }
    setSavingProfile(false)
  }

  function toggleEditLang(lang: string) {
    setEditForm(f => ({
      ...f,
      languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang]
    }))
  }

  async function addOffer() {
    if (!offerForm.category || !offerForm.description) return
    setSaving(true)
    await supabase.from('offers').insert({ user_id: user!.id, category: offerForm.category, description: offerForm.description, availability: offerForm.availability, tags: [] })
    setOfferForm({ category: '', description: '', availability: '' })
    setShowAddOffer(false)
    setSuccess('Offer added!')
    setTimeout(() => setSuccess(''), 3000)
    fetchData()
    setSaving(false)
  }

  async function addRequest() {
    if (!requestForm.category || !requestForm.description) return
    setSaving(true)
    await supabase.from('requests').insert({ user_id: user!.id, category: requestForm.category, description: requestForm.description, tags: [] })
    setRequestForm({ category: '', description: '' })
    setShowAddRequest(false)
    setSuccess('Request added!')
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

  // Show loading state while checking auth
  if (!user) return null

  return (
    <>
      <div aria-hidden="true" style={{position: 'fixed',inset: 0,zIndex: -1,pointerEvents: 'none',backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)',animation: 'shaderDrift 14s ease-in-out infinite alternate',backgroundSize: '200% 200%',}} />
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
                  <h1 className="font-cormorant" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{profile?.name}</h1>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 12px', borderRadius: '100px', background: profile?.role === 'volunteer' ? '#fffbeb' : '#f0fdf4', color: profile?.role === 'volunteer' ? '#b45309' : '#16a34a' }}>
                      {profile?.role === 'volunteer' ? '🙌 Volunteer' : '🌟 Member'}
                    </span>
                    {profile?.country && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📍 {profile.country}</span>}
                    {profile?.gender && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{profile.gender}</span>}
                    {profile?.whatsapp_number && <a href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#25d366", fontWeight: 600, textDecoration: "none" }}>💚 WhatsApp</a>}
                    {profile?.whatsapp_group && <a href={profile.whatsapp_group} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#25d366", fontWeight: 600, textDecoration: "none" }}>👥 WhatsApp Group</a>}
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
                  <button onClick={() => setShowEditProfile(!showEditProfile)} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid #fde68a', background: '#fffbeb', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: '#b45309' }}>
                    ✏️ Edit Profile
                  </button>
                  <button onClick={signOut} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Sign Out
                  </button>
                  <button onClick={async () => {
                    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
                    await supabase.from('offers').delete().eq('user_id', user!.id)
                    await supabase.from('requests').delete().eq('user_id', user!.id)
                    await supabase.from('profiles').delete().eq('id', user!.id)
                    await signOut()
                    window.location.href = '/'
                  }} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid #fecaca', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', color: '#ef4444' }}>
                    🗑️ Delete Account
                  </button>
                </div>
              </div>

              {/* Edit Profile Form */}
              {showEditProfile && (
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '24px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>✏️ Edit Profile</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Country / Location</label>
                      <input value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} style={inputStyle} placeholder="Where are you based?" />
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>LinkedIn Profile URL</label>
                    <input value={editForm.linkedin} onChange={e => setEditForm(f => ({ ...f, linkedin: e.target.value }))} style={inputStyle} placeholder="https://linkedin.com/in/yourname" />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>WhatsApp Number (optional)</label>
                    <input value={editForm.whatsapp_number} onChange={e => setEditForm(f => ({ ...f, whatsapp_number: e.target.value }))} style={inputStyle} placeholder="e.g. 923XXXXXXXXX" />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>WhatsApp Group Link (optional)</label>
                    <input value={editForm.whatsapp_group} onChange={e => setEditForm(f => ({ ...f, whatsapp_group: e.target.value }))} style={inputStyle} placeholder="https://chat.whatsapp.com/..." />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Gender</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['👨 Male', '👩 Female', '🔒 Prefer not to say'].map(g => (
                          <button key={g} type="button" onClick={() => setEditForm(f => ({ ...f, gender: g }))}
                            style={{ padding: '8px 18px', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', border: editForm.gender === g ? '2px solid #d97706' : '2px solid #e5e7eb', background: editForm.gender === g ? '#d97706' : '#fff', color: editForm.gender === g ? '#fff' : '#374151' }}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>Languages</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {all_langs.map(l => (
                        <button key={l} onClick={() => toggleEditLang(l)} style={{ padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', border: editForm.languages.includes(l) ? '2px solid #d97706' : '2px solid #e5e7eb', background: editForm.languages.includes(l) ? '#d97706' : '#fff', color: editForm.languages.includes(l) ? '#fff' : '#374151' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={saveProfile} disabled={savingProfile} style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: savingProfile ? 0.6 : 1 }}>
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button onClick={() => setShowEditProfile(false)} style={{ padding: '12px 24px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontWeight: 500 }}>
                  ✅ {success}
                </div>
              )}

              {/* English quiz banner — only for seekers */}
              {profile?.role !== 'volunteer' && (
                <div style={{ background: profile?.english_level ? '#f0fdf4' : '#fffbeb', border: `1px solid ${profile?.english_level ? '#bbf7d0' : '#fde68a'}`, borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>📝 English Level: </span>
                    {profile?.english_level
                      ? <span style={{ fontWeight: 700, color: profile.english_level === 'Advanced' ? '#16a34a' : profile.english_level === 'Intermediate' ? '#1d4ed8' : '#d97706' }}>{profile.english_level === 'Beginner' ? '🌱 Beginner' : profile.english_level === 'Intermediate' ? '📘 Intermediate' : '🏆 Advanced'}</span>
                      : <span style={{ color: '#9ca3af' }}>Not taken yet</span>}
                  </div>
                  <a href="/quiz" style={{ padding: '8px 20px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                    {profile?.english_level ? '🔄 Retake Quiz' : '📝 Take English Quiz'}
                  </a>
                </div>
              )}

              {/* ── OFFERS SECTION ── */}
              <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 700 }}>🙌 Your Offers</h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '2px' }}>Skills or time you're offering to others</p>
                  </div>
                  <button onClick={() => { setShowAddOffer(!showAddOffer); setShowAddRequest(false) }} style={{ padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {showAddOffer ? '✕ Cancel' : '+ Add Offer'}
                  </button>
                </div>

                {showAddOffer && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Add a new offer</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                      <select aria-label="Offer category" value={offerForm.category} onChange={e => setOfferForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                        <option value="">Select a category</option>
                        {categories_vol.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                      <textarea value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))}
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                        placeholder="Describe what you can offer..." />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Availability</label>
                      <select aria-label="Availability hours per week" value={offerForm.availability} onChange={e => setOfferForm(f => ({ ...f, availability: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                        <option value="">Select availability</option>
                        <option>1–2 hours/week</option>
                        <option>3–5 hours/week</option>
                        <option>5–10 hours/week</option>
                        <option>10+ hours/week</option>
                      </select>
                    </div>
                    <button onClick={addOffer} disabled={saving} style={{ padding: '12px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'Saving...' : 'Save Offer'}
                    </button>
                  </div>
                )}

                {offers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed #fde68a', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                    <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No offers yet</p>
                    <button onClick={() => setShowAddOffer(true)} style={{ padding: '10px 24px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}>
                      Post Your First Offer
                    </button>
                  </div>
                ) : offers.map(offer => (
                  <div key={offer.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '24px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
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
                  <OfferMatches
                    userId={user!.id}
                    offerCategory={offer.category}
                    offerDescription={offer.description}
                    userLanguages={profile?.languages || []}
                  />
                  </div>
                ))}
              </div>

              {/* ── REQUESTS SECTION ── */}
              <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 700 }}>🌟 Your Requests</h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '2px' }}>Help or resources you're looking for</p>
                  </div>
                  <button onClick={() => { setShowAddRequest(!showAddRequest); setShowAddOffer(false) }} style={{ padding: '10px 24px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {showAddRequest ? '✕ Cancel' : '+ Add Request'}
                  </button>
                </div>

                {showAddRequest && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #d1fae5', padding: '28px', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Add a new request</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                      <select aria-label="Request category" value={requestForm.category} onChange={e => setRequestForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, border: '1.5px solid #d1fae5', background: '#f0fdf4' }}>
                        <option value="">Select a category</option>
                        {categories_seek.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                      <textarea value={requestForm.description} onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))}
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const, border: '1.5px solid #d1fae5', background: '#f0fdf4' }}
                        placeholder="Describe what you need..." />
                    </div>
                    <button onClick={addRequest} disabled={saving} style={{ padding: '12px 32px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'Saving...' : 'Save Request'}
                    </button>
                  </div>
                )}

                {requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed #d1fae5', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                    <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No requests yet</p>
                    <button onClick={() => setShowAddRequest(true)} style={{ padding: '10px 24px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}>
                      Post Your First Request
                    </button>
                  </div>
                ) : requests.map(req => (
                  <div key={req.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '24px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: '100px', fontWeight: 600 }}>{req.category}</span>
                      <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, marginTop: '10px' }}>{req.description}</p>
                    </div>
                      <button onClick={() => deleteRequest(req.id)} style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0, alignSelf: 'flex-start' }}
                      onMouseOver={e => (e.target as HTMLElement).style.color = '#ef4444'}
                      onMouseOut={e => (e.target as HTMLElement).style.color = '#d1d5db'}>
                      Delete
                    </button>
                  <RequestMatches
                    userId={user!.id}
                    requestCategory={req.category}
                    requestDescription={req.description}
                    userLanguages={profile?.languages || []}
                  />
                  </div>
                ))}
              </div>

              {/* Bottom padding */}
              <div style={{ height: '60px' }} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
