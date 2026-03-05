'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Request = {
  id: string
  category: string
  description: string
  tags: string[]
  created_at: string
  profiles: {
    name: string
    country: string
    languages: string[]
  }
}

const categories = ['All', '📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills']

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const avatarColors = [
  'from-amber-500 to-orange-400',
  'from-teal-500 to-green-400',
  'from-olive-500 to-green-700',
  'from-rose-500 to-pink-400',
  'from-blue-500 to-indigo-400',
]

export default function NeedsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filtered, setFiltered] = useState<Request[]>([])
  const [activecat, setActivecat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from('requests')
        .select('*, profiles(name, country, languages)')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setRequests(data as any)
        setFiltered(data as any)
      }
      setLoading(false)
    }
    fetchRequests()
  }, [])

  useEffect(() => {
    let result = requests
    if (activecat !== 'All') result = result.filter(r => r.category === activecat)
    if (search) result = result.filter(r =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.name.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activecat, search, requests])

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-playfair text-4xl font-bold mb-2">People Seeking Help</h1>
          <p className="text-gray-400">Browse requests from Gaza — reach out and offer your support</p>
          <p className="font-arabic text-gray-400 text-sm mt-1" dir="rtl">طلبات المساعدة من أهل غزة</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-5 py-3 rounded-full border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
            placeholder="Search requests..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActivecat(cat)}
              className={`px-4 py-2 rounded-full text-sm border transition ${activecat === cat ? 'bg-[#4A5C3A] text-white border-[#4A5C3A]' : 'border-gray-200 hover:border-green-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-amber-100 p-6 animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-4"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="font-playfair text-2xl font-bold mb-2">No requests yet</h3>
            <p className="text-gray-400 mb-6">Be the first to post a request or check back soon</p>
            <Link href="/join?role=seeker" className="px-6 py-3 rounded-full bg-[#4A5C3A] text-white font-semibold hover:bg-[#3a4a2c] transition">
              Post a Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req, i) => (
              <div key={req.id} className="bg-white rounded-2xl border border-amber-100 p-6 flex items-start gap-4 hover:border-amber-200 hover:shadow-md transition">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {getInitials(req.profiles?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{req.profiles?.name}</span>
                    <span className="text-gray-400 text-xs">📍 {req.profiles?.country}</span>
                    <span className="text-gray-300 text-xs">{timeAgo(req.created_at)}</span>
                  </div>
                  <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full mb-2">{req.category}</span>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{req.description}</p>
                  {req.profiles?.languages?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {req.profiles.languages.map(l => (
                        <span key={l} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">{l}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Link href={`/messages?to=${req.profiles?.name}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-[#4A5C3A] text-[#4A5C3A] text-sm font-semibold hover:bg-[#4A5C3A] hover:text-white transition whitespace-nowrap">
                  Offer Help
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
