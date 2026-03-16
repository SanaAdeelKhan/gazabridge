'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type MatchedVolunteer = {
  id: string
  name: string
  country: string
  languages: string[]
  category: string
  description: string
  availability?: string
}

const categoryMap: Record<string, string> = {
  '📚 Learn a language':      '📚 Teaching / Language',
  '💻 Learn tech / AI skills': '💻 Tech / Coding / AI',
  '💼 Career / CV help':       '💼 Career / Mentorship',
  '🫂 Mental health support':  '🫂  Mental Health',
  '📖 Academic tutoring':      '📖 Academic Tutoring',
  '🎨 Creative skills':        '🎨 Creative / Design',
  '🌐 Other':                  '🌐 Other',
}

export default function RequestMatches({ userId, requestCategory, requestDescription, userLanguages }: {
  userId: string
  requestCategory: string
  requestDescription: string
  userLanguages: string[]
}) {
  const router = useRouter()
  const [volunteers, setVolunteers] = useState<MatchedVolunteer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMatches() }, [requestCategory])

  async function fetchMatches() {
    setLoading(true)
    const mappedCat = categoryMap[requestCategory] || requestCategory
    const { data: offers } = await supabase
      .from('offers')
      .select('*, profiles(id, name, country, languages)')
      .eq('category', mappedCat)

    if (!offers) { setLoading(false); return }

    const scored = offers
      .filter(o => o.profiles && o.user_id !== userId)
      .map(o => {
        const sharedLangs = (o.profiles.languages || []).filter((l: string) => userLanguages.includes(l)).length
        return { ...o.profiles, category: o.category, description: o.description, availability: o.availability, score: 2 + sharedLangs }
      })
      .sort((a, b) => b.score - a.score)

    setVolunteers(scored)
    setLoading(false)
  }

  if (loading) return <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '8px 0' }}>Finding volunteers...</div>
  if (volunteers.length === 0) return <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '8px 0' }}>No volunteers for this category yet</div>

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #d1fae5', paddingTop: '16px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', marginBottom: '10px' }}>
        🙌 {volunteers.length} volunteer{volunteers.length > 1 ? 's' : ''} can help
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {volunteers.map(v => (
          <div key={v.id} style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                {v.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{v.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📍 {v.country}</div>
                {v.availability && <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>🕐 {v.availability}</div>}
              </div>
            </div>
            <button
              onClick={() => router.push(`/messages?to=${v.id}&cat=${encodeURIComponent(requestCategory)}&desc=${encodeURIComponent(requestDescription)}&seeker=true`)}
              style={{ padding: '6px 16px', borderRadius: '100px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              💬 Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
