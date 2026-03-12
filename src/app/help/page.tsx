'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function HelpPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!formData.message.trim()) {
      setError('Please tell us what you need help with')
      return
    }

    const mailtoLink = `mailto:YOUR_EMAIL_HERE?subject=Help Request from ${encodeURIComponent(formData.name)}&body=Name: ${encodeURIComponent(formData.name)}%0D%0AEmail: ${encodeURIComponent(formData.email)}%0D%0AMessage: ${encodeURIComponent(formData.message)}`
    window.location.href = mailtoLink
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid rgba(192,122,26,0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1rem',
    color: '#1A1A14',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#fff',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#3D3D2E',
    marginBottom: '8px',
    display: 'block',
  }

  return (
    <>
      <div aria-hidden="true" style={{position: 'fixed',inset: 0,zIndex: -1,pointerEvents: 'none',backgroundImage: 'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(92,107,46,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 80%, rgba(192,122,26,0.08) 0%, transparent 60%)',animation: 'shaderDrift 14s ease-in-out infinite alternate',backgroundSize: '200% 200%',}} />
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#FAF6EE', padding: '48px 24px', fontFamily: "'Cormorant Garamond', serif" }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 700, color: '#1A1A14', marginBottom: '12px' }}>
              Get Help
            </h1>
            <p style={{ color: '#8A8572', fontSize: '1.05rem', marginBottom: '8px' }}>
              Fill in the form below and our team will get back to you as soon as possible
            </p>
            <p style={{ color: '#8A8572', fontSize: '1.05rem', direction: 'rtl', fontFamily: "'Noto Naskh Arabic', serif" }}>
              تواصل معنا وسنرد عليك في أقرب وقت
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(192,122,26,0.2)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(92,107,46,0.08)',
          }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', color: '#dc2626', marginBottom: '20px', fontSize: '0.95rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Your full name"
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#fffbeb'
                    e.currentTarget.style.borderColor = '#C07A1A'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = 'rgba(192,122,26,0.3)'
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="your.email@example.com"
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#fffbeb'
                    e.currentTarget.style.borderColor = '#C07A1A'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = 'rgba(192,122,26,0.3)'
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>What do you need help with? *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Please describe what you need help with..."
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#fffbeb'
                    e.currentTarget.style.borderColor = '#C07A1A'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = 'rgba(192,122,26,0.3)'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #C07A1A, #E09030)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '14px',
                  width: '100%',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: "'Cormorant Garamond', serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(192,122,26,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Send Message 🕊️
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
