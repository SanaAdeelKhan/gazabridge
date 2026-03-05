import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

async function getStats() {
  const [{ count: volunteers }, { count: connections }, { count: requests }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
  ])
  return { volunteers: volunteers || 0, connections: connections || 0, requests: requests || 0 }
}

const steps = [
  { icon: '📝', title: 'Post your offer or need', desc: 'Volunteers post what they can offer. People in Gaza post what they need. Takes 2 minutes.' },
  { icon: '🔍', title: 'Browse & match', desc: 'Search by category, language, or availability. Find the perfect match for your needs.' },
  { icon: '💬', title: 'Connect directly', desc: 'Message each other directly on the platform. No middleman, no delays.' },
]

export default async function Home() {
  const stats = await getStats()

  return (
    <>
      <Navbar />
      <main style={{ width: '100%', overflowX: 'hidden' }}>

        {/* Hero */}
        <section style={{ width: '100%', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', borderRadius: '100px', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '40px' }}>
            🕊️ Free Services · No Barriers · Real Help
          </div>

          <h1 className="font-playfair" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, maxWidth: '800px', marginBottom: '24px' }}>
            Where <em style={{ color: '#d97706', fontStyle: 'normal' }}>skills</em> meet<br />those who need them
          </h1>

          <p style={{ maxWidth: '520px', fontSize: '1.1rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '12px' }}>
            A bridge connecting volunteers worldwide with people in Gaza — offering free teaching, mentorship, tech skills, and more.
          </p>

          <p className="font-arabic" style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '40px', direction: 'rtl' }}>
            جسر يربط المتطوعين حول العالم بأهل غزة
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            <Link href="/join?role=volunteer" style={{ padding: '14px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}>
              🙌 I Want to Help
            </Link>
            <Link href="/join?role=seeker" style={{ padding: '14px 32px', borderRadius: '100px', background: '#4A5C3A', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}>
              🌟 I Need Support
            </Link>
            <Link href="/volunteers" style={{ padding: '14px 32px', borderRadius: '100px', border: '2px solid #e5e7eb', fontWeight: 600, textDecoration: 'none', color: '#1a1a2e', fontSize: '1rem' }}>
              Browse Volunteers →
            </Link>
          </div>

          {/* Stats */}
          <div style={{ width: '100%', maxWidth: '600px', borderTop: '1px solid #fde68a', paddingTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
              <div>
                <div className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d97706' }}>{stats.volunteers}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>Volunteers</div>
              </div>
              <div style={{ borderLeft: '1px solid #fde68a', borderRight: '1px solid #fde68a' }}>
                <div className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d97706' }}>{stats.connections}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>Messages Sent</div>
              </div>
              <div>
                <div className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d97706' }}>{stats.requests}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>Help Requests</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ width: '100%', background: '#fff', padding: '96px 24px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px' }}>How it works</h2>
            <p style={{ color: '#9ca3af', marginBottom: '56px' }}>Three simple steps to connect and help</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px', borderRadius: '24px', border: '1px solid #fde68a' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                    {s.icon}
                  </div>
                  <h3 className="font-playfair" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>{s.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ width: '100%', padding: '96px 24px', textAlign: 'center', boxSizing: 'border-box' }}>
          <h2 className="font-playfair" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Ready to make a difference?</h2>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '32px' }}>Join volunteers already helping people in Gaza</p>
          <Link href="/join" style={{ padding: '16px 40px', borderRadius: '100px', background: '#d97706', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1.1rem' }}>
            Get Started — It's Free
          </Link>
        </section>

      </main>
    </>
  )
}
