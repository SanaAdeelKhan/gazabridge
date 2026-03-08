'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

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

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100 bg-[#FDF8F0]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/"><img src="/logo.png" alt="GazaBridge" style={{ height: "180px", width: "auto", objectFit: "contain", marginTop: "-16px", marginBottom: "-16px" }} /></Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/how-it-works" className="px-4 py-2 rounded-full text-base font-medium hover:bg-amber-50 transition">How it Works</Link>
          {user && <Link href="/volunteers" className="px-4 py-2 rounded-full text-base font-medium hover:bg-amber-50 transition">Volunteers</Link>}
          {user && <Link href="/needs" className="px-4 py-2 rounded-full text-base font-medium hover:bg-amber-50 transition">Needs</Link>}
          {user && (
            <Link href="/messages" className="px-4 py-2 rounded-full text-base font-medium hover:bg-amber-50 transition" style={{ display: "inline-flex", alignItems: "center" }}>
              Messages{badge}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              {isAdmin && (
                <Link href="/admin" className="px-4 py-2 rounded-full text-base font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition">
                  ⚙️ Admin
                </Link>
              )}
              <Link href="/dashboard" className="px-4 py-2 rounded-full text-base font-medium bg-amber-50 hover:bg-amber-100 transition">Dashboard</Link>
              <button onClick={signOut} className="px-4 py-2 rounded-full text-base font-medium border border-amber-200 hover:border-amber-400 transition">Sign Out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="px-4 py-2 rounded-full text-base font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 transition">Login</Link>
              <Link href="/join" className="px-4 py-2 rounded-full text-base font-semibold bg-amber-600 text-white hover:bg-amber-700 transition">Join Free</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 border-t border-amber-100">
          <Link href="/how-it-works" className="py-2 text-base font-medium" onClick={() => setMenuOpen(false)}>How it Works</Link>
          {user && <Link href="/volunteers" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Volunteers</Link>}
          {user && <Link href="/needs" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Needs</Link>}
          {user && (
            <Link href="/messages" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center' }}>
              Messages{badge}
            </Link>
          )}
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="py-2 text-sm font-semibold text-amber-700" onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>
              )}
              <Link href="/dashboard" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={signOut} className="py-2 text-sm font-medium text-left text-red-500">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/join" className="py-2 text-sm font-semibold text-amber-600" onClick={() => setMenuOpen(false)}>Join Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
