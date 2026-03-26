'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

export default function ResourcesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show nothing while checking auth
  if (loading || !user) return null

  return (
    <>
      <div aria-hidden="true" style={{position: 'fixed',inset: 0,zIndex: -1,pointerEvents: 'none',backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)',animation: 'shaderDrift 14s ease-in-out infinite alternate',backgroundSize: '200% 200%',}} />
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Resources</h1>
          <p style={{ color: '#9ca3af' }}>Tools and guidance to help you move forward</p>
        </div>

        {/* Featured Scholarship Advisor Card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>🎓 Scholarship Advisor</h2>
          <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            An AI advisor that helps Gaza students find fully funded scholarships, universities abroad, and study pathways. Get application guidance, essay advice, and strategic planning.
          </p>
          <a 
            href="https://chatgpt.com/g/g-69b186f6ed0081918247176f31030213-gaza-global-scholarship-navigator" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '12px 32px', 
              borderRadius: '100px', 
              background: '#d97706', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b45309'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#d97706'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Open Scholarship Advisor →
          </a>
        </div>

        {/* Job Boards / Sites Card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fde68a', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>💼 Job Boards / Sites</h2>
          <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Explore curated remote, startup, freelance, and AI-powered job platforms to find your next opportunity.
          </p>
          <a 
            href="/resources/job-boards"
            style={{ 
              display: 'inline-block',
              padding: '12px 32px', 
              borderRadius: '100px', 
              background: '#d97706', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b45309'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#d97706'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Open Job Boards →
          </a>
        </div>

        {/* Bottom padding */}
        <div style={{ height: '60px' }} />
      </div>
    </>
  )
}
