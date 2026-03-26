'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { jobBoardsData } from '@/data/jobBoards'

export default function JobBoardsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // Show nothing while checking auth
  if (!user) return null

  return (
    <>
      <div aria-hidden="true" style={{position: 'fixed',inset: 0,zIndex: -1,pointerEvents: 'none',backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)',animation: 'shaderDrift 14s ease-in-out infinite alternate',backgroundSize: '200% 200%',}} />
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>💼 Job Boards / Sites</h1>
          <p style={{ color: '#9ca3af' }}>Curated remote, startup, freelance, and AI-powered job platforms</p>
        </div>

        {jobBoardsData.map((category) => (
          <div key={category.id} style={{ marginBottom: '48px' }}>
            {/* Category Title */}
            <h2 className="font-cormorant" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
              {category.title}
            </h2>

            {/* If category has subcategories */}
            {category.subcategories && category.subcategories.map((subcategory) => (
              <div key={subcategory.name} style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#555' }}>
                  {subcategory.name}
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '16px' 
                }}>
                  {subcategory.jobs.map((job, idx) => (
                    <div 
                      key={`${job.name}-${idx}`}
                      style={{ 
                        background: '#fff', 
                        borderRadius: '16px', 
                        border: '1px solid #fde68a', 
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,122,26,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                        {job.name}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px', flex: 1 }}>
                        {job.description}
                      </p>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '8px 20px',
                          borderRadius: '100px',
                          background: '#d97706',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          alignSelf: 'flex-start'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#b45309'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#d97706'
                        }}
                      >
                        Visit →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* If category has direct jobs (no subcategories) */}
            {category.jobs && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                {category.jobs.map((job, idx) => (
                  <div 
                    key={`${job.name}-${idx}`}
                    style={{ 
                      background: '#fff', 
                      borderRadius: '16px', 
                      border: '1px solid #fde68a', 
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,122,26,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                      {job.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px', flex: 1 }}>
                      {job.description}
                    </p>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        background: '#d97706',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        alignSelf: 'flex-start'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#b45309'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#d97706'
                      }}
                    >
                      Visit →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Bottom padding */}
        <div style={{ height: '60px' }} />
      </div>
    </>
  )
}
