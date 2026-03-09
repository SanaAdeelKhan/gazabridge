'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type MatchedVolunteer = {
  id: string
  name: string
  country: string
  languages: string[]
  category: string
  description: string
  availability: string
  score: number
}

type MatchedSeeker = {
  id: string
  name: string
  country: string
  languages: string[]
  category: string
  description: string
  english_level?: string
  score: number
}

export default function MatchSection({
  userId,
  userRole,
  userLanguages,
  userCategories,
}: {
  userId: string
  userRole: string
  userLanguages: string[]
  userCategories: string[]
}) {
  const router = useRouter()
  const [matchedVolunteers, setMatchedVolunteers] = useState<MatchedVolunteer[]>([])
  const [matchedSeekers, setMatchedSeekers] = useState<MatchedSeeker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userCategories.length === 0) { setLoading(false); return }
    if (userRole === 'volunteer') fetchMatchedSeekers()
    else fetchMatchedVolunteers()
  }, [userCategories])

  async function fetchMatchedVolunteers() {
    // Get all offers whose category overlaps with seeker's request categories
    const { data: offers } = await supabase
      .from('offers')
      .select('*, profiles(id, name, country, languages)')
      .neq('user_id', userId)

    if (!offers) { setLoading(false); return }

    // Map volunteer categories to seeker categories
    const categoryMap: Record<string, string> = {
      '📚 Teaching / Language': '📚 Learn a language',
      '💻 Tech / Coding / AI': '💻 Learn tech / AI skills',
      '💼 Career / Mentorship': '💼 Career / CV help',
      '🫂 Mental Health': '🫂 Mental health support',
      '📖 Academic Tutoring': '📖 Academic tutoring',
      '🎨 Creative / Design': '🎨 Creative skills',
    }

    const scored: MatchedVolunteer[] = []
    const seen = new Set<string>()

    for (const offer of offers) {
      const profile = offer.profiles as any
      if (!profile) continue
      const mappedCat = categoryMap[offer.category] || offer.category
      if (!userCategories.includes(mappedCat)) continue

      let score = 2 // category match
      const sharedLangs = (profile.languages || []).filter((l: string) => userLanguages.includes(l))
      score += sharedLangs.length

      const key = profile.id
      if (seen.has(key)) continue
      seen.add(key)

      scored.push({
        id: profile.id,
        name: profile.name,
        country: profile.country,
        languages: profile.languages || [],
        category: offer.category,
        description: offer.description,
        availability: offer.availability,
        score,
      })
    }

    scored.sort((a, b) => b.score - a.score)
    setMatchedVolunteers(scored.slice(0, 3))
    setLoading(false)
  }

  async function fetchMatchedSeekers() {
    // Get all requests whose category overlaps with volunteer's offer categories
    const categoryMap: Record<string, string> = {
      '📚 Teaching / Language': '📚 Learn a language',
      '💻 Tech / Coding / AI': '💻 Learn tech / AI skills',
      '💼 Career / Mentorship': '💼 Career / CV help',
      '🫂 Mental Health': '🫂 Mental health support',
      '📖 Academic Tutoring': '📖 Academic tutoring',
      '🎨 Creative / Design': '🎨 Creative skills',
    }

    const mappedVolCats = userCategories.map(c => categoryMap[c] || c)

    const { data: requests } = await supabase
      .from('requests')
      .select('*, profiles(id, name, country, languages, english_level)')
      .neq('user_id', userId)

    if (!requests) { setLoading(false); return }

    const scored: MatchedSeeker[] = []
    const seen = new Set<string>()

    for (const req of requests) {
      const profile = req.profiles as any
      if (!profile) continue
      if (!mappedVolCats.includes(req.category)) continue

      let score = 2
      const sharedLangs = (profile.languages || []).filter((l: string) => userLanguages.includes(l))
      score += sharedLangs.length

      const key = profile.id
      if (seen.has(key)) continue
      seen.add(key)

      scored.push({
        id: profile.id,
        name: profile.name,
        country: profile.country,
        languages: profile.languages || [],
        category: req.category,
        description: req.description,
        english_level: profile.english_level,
        score,
      })
    }

    scored.sort((a, b) => b.score - a.score)
    setMatchedSeekers(scored)
    setLoading(false)
  }

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  const englishColors: Record<string, { bg: string; color: string }> = {
    Beginner: { bg: '#fef3c7', color: '#d97706' },
    Intermediate: { bg: '#dbeafe', color: '#1d4ed8' },
    Advanced: { bg: '#f0fdf4', color: '#16a34a' },
  }
  const englishEmoji: Record<string, string> = { Beginner: '🌱', Intermediate: '📘', Advanced: '🏆' }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '0.875rem' }}>Finding your matches...</div>
  )

  if (userRole === 'volunteer') {
    if (matchedSeekers.length === 0) return (
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #d1fae5', padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No matching seekers yet — check back soon!</p>
      </div>
    )

    return (
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 700 }}>🎯 Seekers Who Need You</h2>
          <span style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>{matchedSeekers.length} match{matchedSeekers.length !== 1 ? 'es' : ''}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {matchedSeekers.map(s => (
            <div key={s.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d1fae5', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A5C3A, #6b7c5a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {getInitials(s.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📍 {s.country}</div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '100px', alignSelf: 'flex-start' }}>{s.category}</span>
              {s.english_level && (
                <span style={{ fontSize: '0.72rem', fontWeight: 600, background: englishColors[s.english_level]?.bg, color: englishColors[s.english_level]?.color, padding: '3px 10px', borderRadius: '100px', alignSelf: 'flex-start' }}>
                  {englishEmoji[s.english_level]} {s.english_level} English
                </span>
              )}
              <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.5, flex: 1 }}>{s.description.slice(0, 100)}{s.description.length > 100 ? '...' : ''}</p>
              {s.languages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {s.languages.map(l => <span key={l} style={{ fontSize: '0.7rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>)}
                </div>
              )}
              <button onClick={() => router.push(`/messages?to=${s.id}`)}
                style={{ width: '100%', padding: '9px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                🤝 Offer Help
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Seeker view
  if (matchedVolunteers.length === 0) return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No matches yet — volunteers are joining every day!</p>
    </div>
  )

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 700 }}>✨ Your Best Matches</h2>
        <span style={{ fontSize: '0.8rem', background: '#fffbeb', color: '#d97706', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>Top {matchedVolunteers.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {matchedVolunteers.map(v => (
          <div key={v.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fde68a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                {getInitials(v.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📍 {v.country}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#fffbeb', color: '#b45309', padding: '3px 10px', borderRadius: '100px', alignSelf: 'flex-start' }}>{v.category}</span>
            <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.5, flex: 1 }}>{v.description.slice(0, 100)}{v.description.length > 100 ? '...' : ''}</p>
            {v.availability && <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>⏱ {v.availability}</p>}
            {v.languages.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {v.languages.map(l => <span key={l} style={{ fontSize: '0.7rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '100px', color: '#6b7280' }}>{l}</span>)}
              </div>
            )}
            <button onClick={() => router.push(`/messages?to=${v.id}`)}
              style={{ width: '100%', padding: '9px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              💬 Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
