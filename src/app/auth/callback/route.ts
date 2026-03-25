import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || ''

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      // Guest intent — skip profile, go to dashboard with guest flag in URL
      if (next === 'guest') {
        return NextResponse.redirect(new URL('/dashboard?guest=true', requestUrl.origin))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', session.user.id)
        .single()

      // New user with no complete profile → complete-profile
      if (!profile || !profile.name || !profile.role) {
        const intentParam = next ? `?intent=${next}` : ''
        return NextResponse.redirect(new URL(`/complete-profile${intentParam}`, requestUrl.origin))
      }
    }
  }

  // Existing user with complete profile → dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
