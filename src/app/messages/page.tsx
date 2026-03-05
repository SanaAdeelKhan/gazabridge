'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Send } from 'lucide-react'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

type Profile = {
  id: string
  name: string
  country: string
}

function MessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Profile[]>([])
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    fetchConversations()
  }, [user])

  useEffect(() => {
    if (activeProfile) fetchMessages(activeProfile.id)
  }, [activeProfile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    const { data } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)

    if (!data) return setLoading(false)

    const otherIds = [...new Set(data.map(m =>
      m.sender_id === user!.id ? m.receiver_id : m.sender_id
    ))]

    if (otherIds.length === 0) return setLoading(false)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, country')
      .in('id', otherIds)

    if (profiles) setConversations(profiles)
    setLoading(false)
  }

  async function fetchMessages(otherId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user!.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user!.id})`
      )
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeProfile || !user) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeProfile.id,
      content: newMsg.trim(),
    })
    if (!error) {
      setNewMsg('')
      fetchMessages(activeProfile.id)
    }
    setSending(false)
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="font-playfair text-2xl font-bold mb-2">Sign in to view messages</h3>
        <a href="/login" className="text-amber-600 hover:underline">Go to login →</a>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="font-playfair text-3xl font-bold mb-6">Messages</h1>

      <div className="border border-amber-100 rounded-2xl overflow-hidden flex" style={{ height: '70vh' }}>

        {/* Sidebar */}
        <div className="w-72 border-r border-amber-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-amber-100 font-semibold text-sm">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <div className="text-3xl mb-2">💬</div>
                No conversations yet.<br />
                <a href="/volunteers" className="text-amber-600 hover:underline">Browse volunteers</a> to start one.
              </div>
            ) : (
              conversations.map(p => (
                <div key={p.id}
                  onClick={() => setActiveProfile(p)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-amber-50 transition ${activeProfile?.id === p.id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">📍 {p.country}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeProfile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="text-5xl mb-3">👈</div>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                  {activeProfile.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm">{activeProfile.name}</div>
                  <div className="text-xs text-green-500">🟢 Active</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-10">
                    No messages yet — say hello! 👋
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-amber-600 text-white rounded-br-sm' : 'bg-white border border-amber-100 rounded-bl-sm'}`}>
                          {msg.content}
                          <div className={`text-xs mt-1 ${isMe ? 'text-amber-200' : 'text-gray-400'}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-amber-100 flex gap-3 items-center">
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-5 py-3 rounded-full border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
                  placeholder="Type a message… / اكتب رسالة…"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMsg.trim()}
                  className="w-11 h-11 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition disabled:opacity-50">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <MessagesContent />
      </Suspense>
    </>
  )
}
