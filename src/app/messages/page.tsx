'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Send, ArrowLeft } from 'lucide-react'

type Profile = { id: string; name: string; country: string; role: string }
type Message = { id: string; sender_id: string; content: string; created_at: string }
type Conversation = { id: string; other: Profile; lastMsg: string; unread: number }

function MessagesContent() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const toId = searchParams.get('to')
  const ADMIN_ID = 'c7990cfb-25a6-4f4c-bf32-ac23900b12f6'
  const isGift = searchParams.get('gift') === 'true'
  const fromCat = searchParams.get('cat') || ''
  const fromDesc = searchParams.get('desc') || ''

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { if (user) fetchConversations() }, [user])

  useEffect(() => {
    if (!user || !toId) return
    startOrOpenConvo(toId)

  }, [user, toId])

  useEffect(() => {
    if (!activeConvo) return
    fetchMessages(activeConvo.id)
    const channel = supabase
      .channel('messages-' + activeConvo.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${activeConvo.id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConvo])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*, volunteer:volunteer_id(id,name,country,role), seeker:seeker_id(id,name,country,role)')
      .or(`volunteer_id.eq.${user!.id},seeker_id.eq.${user!.id}`)
      .order('created_at', { ascending: false })

    if (!data) return setLoading(false)

    const convos: Conversation[] = await Promise.all(data.map(async (c: any) => {
      const other = c.volunteer_id === user!.id ? c.seeker : c.volunteer
      const { data: msgs } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
      return { id: c.id, other, lastMsg: msgs?.[0]?.content || 'No messages yet', unread: 0 }
    }))

    setConversations(convos)
    setLoading(false)
  }

  async function startOrOpenConvo(otherId: string) {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', otherId).single()
    if (!profile) return

    const volunteerIdVal = profile.role === 'volunteer' ? otherId : user!.id
    const seekerIdVal = profile.role === 'volunteer' ? user!.id : otherId

    // Check if convo exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('volunteer_id', volunteerIdVal)
      .eq('seeker_id', seekerIdVal)
      .single()

    let convoId = existing?.id
    if (!convoId) {
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({ volunteer_id: volunteerIdVal, seeker_id: seekerIdVal })
        .select().single()
      convoId = newConvo?.id
    }

    if (convoId) {
      const convo: Conversation = { id: convoId, other: profile, lastMsg: '', unread: 0 }
      setActiveConvo(convo)
      setShowChat(true)
      fetchConversations()
      // Only pre-fill if conversation is empty
      const { data: existingMsgs } = await supabase
        .from('messages').select('id').eq('conversation_id', convoId).limit(1)
      if (!existingMsgs || existingMsgs.length === 0) {
        const gift = new URLSearchParams(window.location.search).get('gift')
        const cat = new URLSearchParams(window.location.search).get('cat') || ''
        const desc = new URLSearchParams(window.location.search).get('desc') || ''
        const isSeeker = new URLSearchParams(window.location.search).get('seeker')
        if (gift) setNewMsg(`🎁 Hi! I'd love to gift you a free course. What topic would help you most right now? (e.g. English, coding, design...)`)
        else if (cat && desc && !isSeeker) setNewMsg(`Assalamu Alaikum 🕊️ I saw your request for ${cat} and I'd love to help. I'm offering: "${desc.slice(0, 120)}${desc.length > 120 ? '...' : ''}". Would you be interested in connecting?`)
        else if (cat && desc && isSeeker) setNewMsg(`Assalamu Alaikum 🕊️ I need help with ${cat}. ${desc.slice(0, 120)}${desc.length > 120 ? '...' : ''} — would you be able to help me?`)
      }
    }
  }

  async function fetchMessages(convoId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeConvo || !user) return
    setSending(true)
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeConvo.other.id,
      content: newMsg.trim(),
      conversation_id: activeConvo.id,
    })
    setNewMsg('')
    setSending(false)
  }

  function formatTime(date: string) {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    return isToday
      ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (!user) return null

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', height: 'calc(100vh - 120px)' }}>
      <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>Messages</h1>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '300px 1fr' : '1fr', height: 'calc(100% - 60px)', border: '1px solid #fde68a', borderRadius: '20px', overflow: 'hidden', position: 'relative' as const }}>

        {/* Sidebar */}
        {(isDesktop || !showChat) && (
        <div style={{ borderRight: isDesktop ? '1px solid #fde68a' : 'none', display: 'flex', flexDirection: 'column', background: '#fffbeb', height: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #fde68a', fontWeight: 700, fontSize: '0.95rem' }}>
            Conversations ({conversations.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#fde68a #fffbeb' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                No conversations yet.<br />
                <a href="/volunteers" style={{ color: '#d97706' }}>Browse volunteers</a> to start one.
              </div>
            ) : conversations.map(c => (
              <div key={c.id} onClick={() => { setActiveConvo(c); setShowChat(true) }}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid #fef3c7', cursor: 'pointer',
                  background: activeConvo?.id === c.id ? '#fef3c7' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s'
                }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {getInitials(c.other?.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.other?.id === ADMIN_ID ? '🛡️ GazaBridge Admin' : c.other?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMsg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Chat area */}
        {(isDesktop || showChat) && (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', height: '100%', overflow: 'hidden' }}>
          {!activeConvo ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
              <p style={{ fontSize: '0.95rem' }}>Select a conversation to start chatting</p>
              <a href="/volunteers" style={{ marginTop: '12px', color: '#d97706', fontSize: '0.875rem' }}>Browse volunteers →</a>
            </div>
          ) : (
            <>
              {/* Mobile Back Button - Sticky at top */}
              {!isDesktop && (
                <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(250,246,238,0.97)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderBottom: '1px solid rgba(192,122,26,0.15)' }}>
                  <button type="button" onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#C07A1A', fontFamily: 'inherit', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
                    <ArrowLeft size={18} /> Back to conversations
                  </button>
                </div>
              )}

              {/* Desktop Header */}
              {isDesktop && (
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '14px', background: '#fffbeb' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                  {getInitials(activeConvo.other?.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{activeConvo.other?.id === ADMIN_ID ? '🛡️ GazaBridge Admin' : activeConvo.other?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4A5C3A' }}>🟢 {activeConvo.other?.country}</div>
                </div>
              </div>
              )}

              {/* Messages */}
              <div className="messages-scroll" style={{ 
                flex: 1, 
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                scrollbarWidth: 'thin' as const, 
                scrollbarColor: 'rgba(192,122,26,0.4) transparent',
                minHeight: 0
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '40px 0' }}>
                    No messages yet — say hello! 👋
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.sender_id === user.id
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%', padding: '12px 16px', borderRadius: '18px',
                        background: isMe ? '#d97706' : '#f9fafb',
                        color: isMe ? '#fff' : '#1a1a2e',
                        border: isMe ? 'none' : '1px solid #fde68a',
                        borderBottomRightRadius: isMe ? '4px' : '18px',
                        borderBottomLeftRadius: isMe ? '18px' : '4px',
                        fontSize: '0.9rem', lineHeight: 1.6,
                      }}>
                        {msg.content}
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #fde68a', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: '1.5px solid #fde68a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: '#fffbeb' }}
                  placeholder="Type a message… / اكتب رسالة…" />
                <button onClick={sendMessage} disabled={sending || !newMsg.trim()} aria-label="Send message"
                  style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d97706', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sending || !newMsg.trim() ? 0.5 : 1 }}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <>
      <div aria-hidden="true" style={{position: 'fixed',inset: 0,zIndex: -1,pointerEvents: 'none',backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)',animation: 'shaderDrift 14s ease-in-out infinite alternate',backgroundSize: '200% 200%',}} />
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Loading...</div>}>
        <MessagesContent />
      </Suspense>
    </>
  )
}
