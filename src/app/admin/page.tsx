'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NewNavbar from '@/components/NewNavbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type Profile = { id: string; name: string; email?: string; is_volunteer: boolean; is_seeker: boolean; is_admin: boolean; is_vetted: boolean; country: string }

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [broadcast, setBroadcast] = useState({ message: '', target: 'all' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'broadcast' | 'users' | 'admins'>('broadcast')

  useEffect(() => {
    if (user) checkAdmin()
  }, [user])

  async function checkAdmin() {
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user!.id).single()
    if (!data?.is_admin) { router.push('/'); return }
    setIsAdmin(true)
    fetchProfiles()
    setLoading(false)
  }

  async function fetchProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select("id, name, is_volunteer, is_seeker, is_admin, is_vetted, country")
      .order('created_at', { ascending: false })
    if (data) setProfiles(data)
  }

  async function sendBroadcast() {
    if (!broadcast.message.trim()) return
    setSending(true)
    const ADMIN_ID = 'c7990cfb-25a6-4f4c-bf32-ac23900b12f6'
    let targets: Profile[] = []
    if (broadcast.target === 'all') targets = profiles
    else if (broadcast.target === 'volunteers') targets = profiles.filter(p => p.is_volunteer)
    else if (broadcast.target === 'seekers') targets = profiles.filter(p => p.is_seeker)
    let sent = 0
    for (const target of targets) {
      if (target.id === ADMIN_ID) continue
      let convId: string | null = null
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('volunteer_id', ADMIN_ID)
        .eq('seeker_id', target.id)
        .maybeSingle()
      if (existing) {
        convId = existing.id
      } else {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({ volunteer_id: ADMIN_ID, seeker_id: target.id })
          .select('id')
          .single()
        if (convErr) continue
        convId = newConv?.id
      }
      if (convId) {
        const { error: msgErr } = await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: ADMIN_ID,
          receiver_id: target.id,
          content: `📢 ${broadcast.message}`,
          is_read: false,
        })
        if (msgErr) continue
        sent++
      }
    }
    setSuccess(`✅ Broadcast sent to ${sent} users!`)
    setTimeout(() => setSuccess(''), 4000)
    setBroadcast(b => ({ ...b, message: '' }))
    setSending(false)
  }

  async function toggleVetted(profileId: string, current: boolean) {
    const { error: vetError } = await supabase.from("profiles").update({ is_vetted: !current }).eq("id", profileId)
    if (vetError) console.error('Failed to update vetted status', vetError)
    fetchProfiles()
  }

  async function toggleAdmin(profileId: string, current: boolean) {
    const { error: adminError } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', profileId)
    if (adminError) console.error('Failed to update admin status', adminError)
    fetchProfiles()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #fde68a', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fffbeb' }

  if (loading) return <><NewNavbar /><div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Checking access...</div></>
  if (!isAdmin) return null

  const volunteers = profiles.filter(p => p.is_volunteer)
  const seekers = profiles.filter(p => p.is_seeker)
  const admins = profiles.filter(p => p.is_admin)

  return (
    <>
      <NewNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px', fontFamily: 'inherit' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '6px' }}>⚙️ Admin Dashboard</h1>
          <p style={{ color: '#9ca3af' }}>Manage GazaBridge users and send announcements</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users', value: profiles.length, color: '#d97706', bg: '#fffbeb' },
            { label: 'Volunteers', value: volunteers.length, color: '#d97706', bg: '#fef3c7' },
            { label: 'Seekers', value: seekers.length, color: '#16a34a', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '16px', padding: '24px', textAlign: 'center', border: `1px solid ${s.bg}` }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['broadcast', 'users', 'admins'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: '100px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              background: activeTab === tab ? '#d97706' : '#fff',
              color: activeTab === tab ? '#fff' : '#6b7280',
              border: activeTab === tab ? 'none' : '1.5px solid #e5e7eb',
            }}>
              {tab === 'broadcast' ? '📢 Broadcast' : tab === 'users' ? '👥 Users' : '🔑 Admins'}
            </button>
          ))}
        </div>

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontWeight: 500 }}>
            {success}
          </div>
        )}

        {/* Broadcast tab */}
        {activeTab === 'broadcast' && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px' }}>Send Message to Users</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '10px' }}>Send to:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: `🌍 Everyone (${profiles.length})` },
                  { value: 'volunteers', label: `🙌 Volunteers (${volunteers.length})` },
                  { value: 'seekers', label: `🌟 Seekers (${seekers.length})` },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setBroadcast(b => ({ ...b, target: opt.value }))} style={{
                    padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                    border: broadcast.target === opt.value ? '2px solid #d97706' : '2px solid #e5e7eb',
                    background: broadcast.target === opt.value ? '#fffbeb' : '#fff',
                    color: broadcast.target === opt.value ? '#d97706' : '#6b7280',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Message</label>
              <textarea
                value={broadcast.message}
                onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Type your announcement or message here..."
              />
            </div>

            <button onClick={sendBroadcast} disabled={sending || !broadcast.message.trim()} style={{
              padding: '14px 36px', borderRadius: '100px', background: sending ? '#f59e0b' : '#d97706', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '1rem', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              opacity: !broadcast.message.trim() ? 0.5 : 1,
            }}>
              {sending ? 'Sending...' : '📢 Send Broadcast'}
            </button>
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px' }}>All Users ({profiles.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profiles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: '#f9fafb', flexWrap: 'wrap' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{p.country}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {p.is_volunteer && <span style={{ fontSize: '0.7rem', background: '#fffbeb', color: '#b45309', padding: '2px 10px', borderRadius: '100px', fontWeight: 600 }}>🙌 Volunteer</span>}
                    {p.is_seeker && <span style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: '100px', fontWeight: 600 }}>🌟 Seeker</span>}
                    {p.is_vetted && <span style={{ fontSize: "0.7rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 10px", borderRadius: "100px", fontWeight: 600 }}>✅ Vetted</span>}
                    {p.is_admin && <span style={{ fontSize: "0.7rem", background: "#fef3c7", color: "#d97706", padding: "2px 10px", borderRadius: "100px", fontWeight: 600 }}>⚙️ Admin</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admins tab */}
        {activeTab === 'admins' && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '28px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Manage Admins</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>Grant or revoke admin access for any user.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profiles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: p.is_admin ? '#fffbeb' : '#f9fafb', border: p.is_admin ? '1px solid #fde68a' : '1px solid transparent' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{p.country}</div>
                  </div>
                  {p.id !== user!.id && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {p.is_seeker && <button onClick={() => toggleVetted(p.id, p.is_vetted)} style={{ padding: "6px 16px", borderRadius: "100px", fontFamily: "inherit", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, background: p.is_vetted ? "#fef2f2" : "#f0fdf4", color: p.is_vetted ? "#dc2626" : "#16a34a", border: p.is_vetted ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>{p.is_vetted ? "Unvet" : "✅ Vet"}</button>}
                      <button onClick={() => toggleAdmin(p.id, p.is_admin)} style={{ padding: "6px 16px", borderRadius: "100px", fontFamily: "inherit", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, background: p.is_admin ? "#fef2f2" : "#f0fdf4", color: p.is_admin ? "#dc2626" : "#16a34a", border: p.is_admin ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                        {p.is_admin ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </div>
                  )}
                  {p.id === user!.id && <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>You</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
