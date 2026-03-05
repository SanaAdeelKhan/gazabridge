'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Profile = {
  name: string
  role: string
  country: string
  languages: string[]
}

type Offer = {
  id: string
  category: string
  description: string
  availability: string
  created_at: string
}

type Request = {
  id: string
  category: string
  description: string
  created_at: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  async function fetchData() {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()

    if (prof) setProfile(prof)

    if (prof?.role === 'volunteer') {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (data) setOffers(data)
    } else {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (data) setRequests(data)
    }

    setLoading(false)
  }

  async function deleteOffer(id: string) {
    await supabase.from('offers').delete().eq('id', id)
    setOffers(o => o.filter(x => x.id !== id))
  }

  async function deleteRequest(id: string) {
    await supabase.from('requests').delete().eq('id', id)
    setRequests(r => r.filter(x => x.id !== id))
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="font-playfair text-2xl font-bold mb-2">Sign in to view your dashboard</h3>
          <Link href="/login" className="text-amber-600 hover:underline">Go to login →</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/3"></div>
            <div className="h-32 bg-gray-100 rounded-2xl"></div>
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-amber-100 p-8 mb-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {profile?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="font-playfair text-2xl font-bold">{profile?.name}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${profile?.role === 'volunteer' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {profile?.role === 'volunteer' ? '🙌 Volunteer' : '🌟 Member'}
                  </span>
                  {profile?.country && `📍 ${profile.country}`}
                </p>
                {profile?.languages && profile.languages.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {profile.languages.map(l => (
                      <span key={l} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">{l}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/messages" className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition text-center">
                  💬 Messages
                </Link>
                <button onClick={signOut} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-red-300 hover:text-red-500 transition">
                  Sign Out
                </button>
              </div>
            </div>

            {/* Offers or Requests */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl font-bold">
                {profile?.role === 'volunteer' ? 'Your Offers' : 'Your Requests'}
              </h2>
              <Link
                href={profile?.role === 'volunteer' ? '/join?role=volunteer' : '/join?role=seeker'}
                className="px-4 py-2 rounded-full bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition">
                + Add New
              </Link>
            </div>

            {profile?.role === 'volunteer' ? (
              offers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-amber-100 rounded-2xl">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400 mb-4">You haven't posted any offers yet</p>
                  <Link href="/join?role=volunteer" className="px-6 py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition text-sm">
                    Post Your First Offer
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map(offer => (
                    <div key={offer.id} className="bg-white rounded-2xl border border-amber-100 p-6 hover:border-amber-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className="inline-block text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold mb-2">{offer.category}</span>
                          <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
                          {offer.availability && (
                            <p className="text-xs text-gray-400 mt-2">⏱ {offer.availability}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteOffer(offer.id)}
                          className="text-xs text-gray-300 hover:text-red-400 transition flex-shrink-0">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              requests.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-green-100 rounded-2xl">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400 mb-4">You haven't posted any requests yet</p>
                  <Link href="/join?role=seeker" className="px-6 py-3 rounded-full bg-[#4A5C3A] text-white font-semibold hover:bg-[#3a4a2c] transition text-sm">
                    Post Your First Request
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl border border-green-100 p-6 hover:border-green-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className="inline-block text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold mb-2">{req.category}</span>
                          <p className="text-gray-600 text-sm leading-relaxed">{req.description}</p>
                        </div>
                        <button
                          onClick={() => deleteRequest(req.id)}
                          className="text-xs text-gray-300 hover:text-red-400 transition flex-shrink-0">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </>
  )
}
