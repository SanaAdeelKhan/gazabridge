'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut, isGuest } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (user) {
      fetchUnread()
      checkAdmin()

      // Realtime subscription for new messages
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
    // Get all conversations the user is part of
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
      background: '#dc2626', color: '#fff', borderRadius: '100px',
      fontSize: '0.65rem', fontWeight: 700, minWidth: '18px', height: '18px',
      padding: '0 5px', marginLeft: '4px', lineHeight: 1,
    }}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  ) : null

  const navLinkStyle = (href: string) => ({
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: pathname === href ? 600 : 500,
    color: pathname === href ? '#C07A1A' : '#3D3D2E',
    padding: '6px 14px',
    borderRadius: '100px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    background: pathname === href ? 'rgba(192,122,26,0.09)' : 'transparent',
  })

  const dashboardLinkStyle = {
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: pathname === '/dashboard' ? 600 : 500,
    color: pathname === '/dashboard' ? '#C07A1A' : '#3D3D2E',
    padding: '6px 14px',
    borderRadius: '100px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(192,122,26,0.09)',
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(250,246,238,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(192,122,26,0.15)',
      boxShadow: '0 2px 20px rgba(92,107,46,0.06)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="GazaBridge" loading="eager" decoding="async" style={{ height: "52px", width: "auto", objectFit: "contain", marginTop: "0", marginBottom: "0" }} />
        </Link>

        {/* Desktop nav - CENTER */}
        {isDesktop && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {(user || isGuest) && (
            <>
              <Link href="/volunteers" style={navLinkStyle('/volunteers')}
                onMouseEnter={(e) => {
                  if (pathname !== '/volunteers') {
                    e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/volunteers') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Volunteers
              </Link>
              <Link href="/needs" style={navLinkStyle('/needs')}
                onMouseEnter={(e) => {
                  if (pathname !== '/needs') {
                    e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/needs') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Needs
              </Link>
              {!isGuest && <Link href="/messages" style={navLinkStyle('/messages')}
                onMouseEnter={(e) => {
                  if (pathname !== '/messages') {
                    e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/messages') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Messages{badge}
              </Link>}
              {!isGuest && <Link href="/resources" style={navLinkStyle('/resources')}
                onMouseEnter={(e) => {
                  if (pathname !== '/resources') {
                    e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/resources') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Resources
              </Link>}
              {!isGuest && <Link href="/courses" style={navLinkStyle('/courses')}
                onMouseEnter={(e) => {
                  if (pathname !== '/courses') {
                    e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/courses') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Courses
              </Link>}
              {!isGuest && isAdmin && (
                <Link href="/admin" style={navLinkStyle('/admin')}
                  onMouseEnter={(e) => {
                    if (pathname !== '/admin') {
                      e.currentTarget.style.background = 'rgba(92,107,46,0.07)'
                      e.currentTarget.style.color = '#1A1A14'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/admin') {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#3D3D2E'
                    }
                  }}>
                  ⚙️ Admin
                </Link>
              )}
              <Link href="/dashboard" style={dashboardLinkStyle}
                onMouseEnter={(e) => {
                  if (pathname !== '/dashboard') {
                    e.currentTarget.style.color = '#1A1A14'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/dashboard') {
                    e.currentTarget.style.color = '#3D3D2E'
                  }
                }}>
                Dashboard
              </Link>
            </>
          )}
        </div>
        )}

        {/* Desktop nav - RIGHT */}
        {isDesktop && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user ? (
            <button type="button" onClick={signOut} style={{
              padding: '8px 20px',
              borderRadius: '100px',
              border: '1px solid rgba(192,122,26,0.3)',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: 500,
              color: '#8A8572',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C07A1A'
              e.currentTarget.style.borderColor = 'rgba(192,122,26,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8A8572'
              e.currentTarget.style.borderColor = 'rgba(192,122,26,0.3)'
            }}>
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 20px',
                borderRadius: '100px',
                border: '1px solid rgba(192,122,26,0.3)',
                background: 'transparent',
                fontSize: '14px',
                fontWeight: 500,
                color: '#8A8572',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                Login
              </Link>
              <Link href="/join" style={{
                padding: '8px 20px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #C07A1A, #E09030)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                Join Free
              </Link>
            </>
          )}
        </div>
        )}

        {/* Mobile menu button */}
        {!isDesktop && (
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#3D3D2E', fontSize: '1.4rem' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && !isDesktop && (
        <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, background: 'rgba(250,246,238,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(192,122,26,0.15)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 49 }}>
          {(user || isGuest) && <Link href="/volunteers" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Volunteers</Link>}
          {(user || isGuest) && <Link href="/needs" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Needs</Link>}
          {user && (
            <Link href="/messages" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }} onClick={() => setMenuOpen(false)}>
              Messages{badge}
            </Link>
          )}
          {user && (
            <Link href="/resources" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Resources</Link>
          )}
          {user && (
            <Link href="/courses" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Courses</Link>
          )}
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>
              )}
              <Link href="/dashboard" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            {isGuest && <button type="button" onClick={() => { try { localStorage.removeItem('gb_guest') } catch {} window.location.href = '/' }} style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>Exit Guest</button>}
              <button type="button" onClick={signOut} style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/join" style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 500, color: '#3D3D2E', padding: '10px 0', borderBottom: '1px solid rgba(192,122,26,0.08)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Join Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
