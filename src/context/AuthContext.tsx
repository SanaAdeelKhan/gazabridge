'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  isGuest: boolean
  signOut: () => Promise<void>
  mockLogin: (role?: 'volunteer' | 'seeker' | 'admin') => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  signOut: async () => {},
  mockLogin: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Check guest flag: only treat as guest if logged in but chose "Just Browsing"
      if (currentUser) {
        try {
          const guestFlag = localStorage.getItem('gb_guest')
          setIsGuest(guestFlag === 'true')
        } catch {
          setIsGuest(false)
        }
      } else {
        setIsGuest(false)
      }

      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        try {
          setIsGuest(localStorage.getItem('gb_guest') === 'true')
        } catch {
          setIsGuest(false)
        }
      } else {
        setIsGuest(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try { localStorage.removeItem('gb_guest') } catch { /* ignore */ }
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Keep mockLogin as no-op for type compatibility
  const mockLogin = () => {
    // No-op: mock login disabled in production
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
