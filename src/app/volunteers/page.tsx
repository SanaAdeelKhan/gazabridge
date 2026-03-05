'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Offer = {
  id: string
  category: string
  description: string
  availability: string
  tags: string[]
  profiles: {
    name: string
    country: string
    languages: string[]
  }
}

const categories = ['All', '📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring']

export default function VolunteersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [filtered, setFiltered] = useState<Offer[]>([])
  const [activecat, setActivecat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      const { data, error } = await supabase
        .from('offers')
        .select('*, profiles(name, country, languages)')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setOffers(data as any)
        setFiltered(data as any)
      }
      setLoading(false)
    }
    fetchOffers()
  }, [])

  useEffect(() => {
    let result = offers
    if (activecat !== 'All') result = result.filter(o => o.category === activecat)
    if (search) result = result.filter(o =>
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.profiles?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [activecat, search, offers])

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-playfair text-4xl font-bold mb-2">Volunteer Offers</h1>
          <p className="text-gray-400">People offering their skills for free — browse and request help directly</p>
          <p className="font-arabic text-gray-400 text-sm mt-1" dir="rtl">المتطوعون يقدمون مهاراتهم مجاناً</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-5 py-3 rounded-full border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
            placeholder="Search by skill, name, or keyword..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActivecat(cat)}
              className={`px-4 py-2 rounded-full text-sm border transition ${activecat === cat ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 hover:border-amber-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-amber-100 p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3"></div>
                <div className="h-16 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-playfair text-2xl font-bold mb-2">No offers found</h3>
            <p className="text-gray-400 mb-6">Try a different filter or be the first to offer!</p>
            <Link href="/join?role=volunteer" className="px-6 py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition">
              Post Your Offer
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(offer => (
              <div key={offer.id} className="bg-white rounded-2xl border border-amber-100 p-6 hover:border-amber-300 hover:shadow-lg transition group">
                <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 px-3 py-1 rounded-full mb-4">
                  {offer.category}
                </span>
                <div className="font-bold text-base mb-1">
                  {offer.profiles?.name}
                  <span className="text-gray-400 font-normal text-sm ml-2">{offer.profiles?.country}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{offer.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {offer.profiles?.languages?.map(l => (
                    <span key={l} className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-full text-gray-500">{l}</span>
                  ))}
                  {offer.availability && (
                    <span className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-full text-gray-500">⏱ {offer.availability}</span>
                  )}
                </div>
                <Link href={`/messages?to=${offer.profiles?.name}`}
                  className="block w-full text-center py-2.5 rounded-full bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition">
                  Request This Service
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
