'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type MatchedSeeker = {
  id: string
  name: string
  country: string
  languages: string[]
  category: string
  description: string
  english_level?: string
}

const categoryMap: Record<string, string> = {
  '📚 Teaching / Language': '📚 Learn a language',
  '💻 Tech / Coding / AI': '💻 Learn tech / AI skills',
  '💼 Career / Mentorship': '💼 Career / CV help',
  '🫂  Mental Health': '🫂  Mental health support',
  '📖 Academic Tutoring': '📖 Academic tutoring',
  '🎨 Creative / Design': '🎨 Creative skills',
  '🌐 Other': '🌐 Other',
}

export default function OfferMatches({ userId, offerCategory, offerDescription, userLanguages }: {
  userId: string
  offerCategory: string
  offerDescription: string
  userLanguages: string[]
}) {
  const router = useRouter()
  const [seekers, setSeekers] = useState<MatchedSeeker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [offerCategory])

  async function fetchMatches() {
    setLoading(true)
    const mappedCat = categoryMap[offerCategory] || offerCategory
    const { data: requests } = await supabase
      .from('requests')
      .select('*, profiles(id, name, country, languages, english_level)')
      .eq('category', mappedCat)

    if (!requests) { setLoading(false); return }

    const scored = requests
      .filter(r => r.profiles && r.user_id !== userId)
      .map(r => {
        const sharedLangs = (r.profiles.languages || []).filter((l: string) => userLanguages.includes(l)).length
        return { ...r.profiles, category: r.category, description: r.description, score: 2 + sharedLangs }
      })
      .sort((a, b) => b.score - a.score)

    setSeekers(scored)
    setLoading(false)
  }

  if (loading) return <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '8px 0' }}>Finding matches...</div>
  if (seekers.length === 0) return <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '8px 0' }}>No seekers for this offer yet</div>

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #fde68a', paddingTop: '16px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '10px' }}>
        🎯 {seekers.length} seeker{seekers.length > 1 ? 's' : ''} need this
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {seekers.map(s => (
          <div key={s.id} style={{ background: '#fffbeb', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                {s.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📍 {s.country}</div>
                {s.english_level && <div style={{ fontSize: '0.7rem', color: '#b45309' }}>{s.english_level === 'Beginner' ? '🌱' : s.english_level === 'Intermediate' ? '📘' : '🏆'} {s.english_level} English</div>}
              </div>
            </div>
            <button onClick={() => router.push(`/messages?to=${s.id}&cat=${encodeURIComponent(offerCategory)}&desc=${encodeURIComponent(offerDescription)}`)}
              style={{ padding: '6px 16px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              💬 Help
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
