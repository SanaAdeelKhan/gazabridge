'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function NewNavbar() {
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user) {
      fetchUnread()
      checkAdmin()

      const channel = supabase
        .channel('unread-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, () => fetchUnread())
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        }, () => fetchUnread())
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    } else {
      setUnreadCount(0)
      setIsAdmin(false)
    }
  }, [user])

  async function fetchUnread() {
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant1.eq.${user!.id},participant2.eq.${user!.id}`)

    if (!convs || convs.length === 0) return

    const convIds = convs.map(c => c.id)

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', user!.id)

    setUnreadCount(count || 0)
  }

  async function checkAdmin() {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user!.id)
      .single()
    setIsAdmin(data?.is_admin || false)
  }

  const badge = unreadCount > 0 ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--amber)', color: '#fff', borderRadius: '100px',
      fontSize: '0.65rem', fontWeight: 700, minWidth: '18px', height: '18px',
      padding: '0 5px', marginLeft: '4px', lineHeight: 1,
    }}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  ) : null

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      zIndex: 1000,
      background: scrolled ? 'rgba(250,246,238,0.88)' : 'rgba(250,246,238,0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: scrolled ? '1px solid rgba(92,107,46,0.15)' : '1px solid rgba(250,246,238,0.25)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        height: '100%',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/gazabridge-logo.png?v=2" 
            alt="GazaBridge" 
            width="192"
            height="48"
            style={{ 
              height: '120px', 
              width: 'auto',
              objectFit: 'contain',
            }} 
          />
        </Link>

        {/* Center nav - desktop only */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden md:flex">
          <a href="#hiw" style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '1rem',
            fontWeight: 500,
            position: 'relative',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark)'}>
            How it Works
          </a>
          <a href="#contact" style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '1rem',
            fontWeight: 500,
            position: 'relative',
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark)'}>
            Contact Us
          </a>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              <div className="hidden md:flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                {isAdmin && (
                  <Link href="/admin" style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '100px',
                    background: 'var(--amber)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}>
                    ⚙️ Admin
                  </Link>
                )}
                <Link href="/messages" style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '100px',
                  border: '1.5px solid var(--olive)',
                  background: 'transparent',
                  color: 'var(--olive)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}>
                  Messages{badge}
                </Link>
                <Link href="/dashboard" style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '100px',
                  background: 'var(--amber)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Dashboard
                </Link>
              </div>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--dark)',
              }}>
                {menuOpen ? '✕' : '☰'}
              </button>
            </>
          ) : (
            <>
              <div className="hidden md:flex" style={{ gap: '0.75rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Link href="/login" className="btn-glow-amber" style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '100px',
                    background: 'var(--amber)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    Get Started
                  </Link>
                  <span style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '100px',
                    border: '2px solid rgba(192,122,26,0.4)',
                    animation: 'pulseRing 2s ease infinite',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--dark)',
              }}>
                {menuOpen ? '✕' : '☰'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          background: 'rgba(250,246,238,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(92,107,46,0.15)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <a href="#hiw" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '0.5rem 0',
          }}>
            How it Works
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none',
            color: 'var(--dark)',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '0.5rem 0',
          }}>
            Contact Us
          </a>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
                  textDecoration: 'none',
                  color: 'var(--amber)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 0',
                }}>
                  ⚙️ Admin
                </Link>
              )}
              <Link href="/messages" onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none',
                color: 'var(--dark)',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 0',
                display: 'inline-flex',
                alignItems: 'center',
              }}>
                Messages{badge}
              </Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none',
                color: 'var(--dark)',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 0',
              }}>
                Dashboard
              </Link>
              <button onClick={signOut} style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 0',
                cursor: 'pointer',
              }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none',
                color: 'var(--amber)',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 0',
              }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
