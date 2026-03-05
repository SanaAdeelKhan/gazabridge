'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100 bg-[#FDF8F0]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-playfair text-2xl font-black tracking-tight">
          Gaza<span className="text-amber-600">Bridge</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/volunteers" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-50 transition">Volunteers</Link>
          <Link href="/needs" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-50 transition">Needs</Link>
          {user && <Link href="/messages" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-50 transition">Messages</Link>}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/dashboard" className="px-4 py-2 rounded-full text-sm font-medium bg-amber-50 hover:bg-amber-100 transition">Dashboard</Link>
              <button onClick={signOut} className="px-4 py-2 rounded-full text-sm font-medium border border-amber-200 hover:border-amber-400 transition">Sign Out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="px-4 py-2 rounded-full text-sm font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 transition">Login</Link>
              <Link href="/join" className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition">Join Free</Link>
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
          <Link href="/volunteers" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Volunteers</Link>
          <Link href="/needs" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Needs</Link>
          {user && <Link href="/messages" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Messages</Link>}
          {user ? (
            <button onClick={signOut} className="py-2 text-sm font-medium text-left text-red-500">Sign Out</button>
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
