'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'volunteers' | 'needs' | 'home'

type TabDef = {
  label: string
  offerCat: string
  requestCat: string
}

const TABS: TabDef[] = [
  { label: '📚 Teaching / Language', offerCat: '📚 Teaching / Language',  requestCat: '📚 Learn a language' },
  { label: '💻 Tech & AI',           offerCat: '💻 Tech / Coding / AI',   requestCat: '💻 Learn tech / AI skills' },
  { label: '💼 Career',              offerCat: '💼 Career / Mentorship',  requestCat: '💼 Career / CV help' },
  { label: '🫂 Mental Health',       offerCat: '🫂  Mental Health',        requestCat: '🫂  Mental health support' },
  { label: '🎨 Creative',            offerCat: '🎨 Creative / Design',    requestCat: '🎨 Creative skills' },
  { label: '📖 Academic',            offerCat: '📖 Academic Tutoring',    requestCat: '📖 Academic tutoring' },
]

type Counts = Record<string, { volunteers: number; seekers: number }>

type Props = {
  mode: Mode
  activeLabel?: string
  onChange?: (offerCat: string, requestCat: string) => void
}

export default function SubjectTabs({ mode, activeLabel, onChange }: Props) {
  const router = useRouter()
  const [counts, setCounts] = useState<Counts>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      const [{ data: offers }, { data: requests }] = await Promise.all([
        supabase.from('offers').select('category'),
        supabase.from('requests').select('category'),
      ])
      const c: Counts = {}
      for (const tab of TABS) {
        c[tab.label] = {
          volunteers: offers?.filter(o => o.category === tab.offerCat).length ?? 0,
          seekers:    requests?.filter(r => r.category === tab.requestCat).length ?? 0,
        }
      }
      setCounts(c)
      setLoading(false)
    }
    fetchCounts()
  }, [])

  function handleClick(tab: TabDef) {
    if (mode === 'home') {
      router.push(`/volunteers?cat=${encodeURIComponent(tab.offerCat)}`)
      return
    }
    onChange?.(tab.offerCat, tab.requestCat)
  }

  const isVol   = mode === 'volunteers'
  const isNeeds = mode === 'needs'
  const isHome  = mode === 'home'
  const activeColor = isNeeds ? '#4A5C3A' : '#d97706'
  const activeBg    = isNeeds ? '#4A5C3A' : '#d97706'

  return (
    <div style={{ overflowX: 'auto', marginBottom: isHome ? '0' : '32px' }}>
      <div style={{ display: 'flex', gap: '10px', paddingBottom: '8px', minWidth: 'max-content' }}>
        {TABS.map(tab => {
          const c = counts[tab.label]
          const isActive = activeLabel === tab.label
          const count = isVol ? c?.volunteers : isNeeds ? c?.seekers : undefined
          return (
            <button
              key={tab.label}
              onClick={() => handleClick(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '100px',
                border: isActive ? `2px solid ${activeColor}` : '2px solid #e5e7eb',
                background: isActive ? activeBg : '#fff',
                color: isActive ? '#fff' : '#374151',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span>{tab.label}</span>
              {!loading && (
                <span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 400 }}>
                  {isHome
                    ? `${c?.volunteers ?? 0} volunteers · ${c?.seekers ?? 0} seekers`
                    : `${count ?? 0} ${isVol ? 'volunteers' : 'seekers'}`}
                </span>
              )}
              {loading && <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>...</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
