import NewNavbar from '@/components/NewNavbar'
import { supabase } from '@/lib/supabase'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import CTABanner from '@/components/landing/CTABanner'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/landing/Footer'

async function getStats() {
  const [{ count: volunteers }, { count: connections }, { count: requests }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
  ])
  return { volunteers: volunteers || 11, connections: connections || 0, requests: requests || 11 }
}

export default async function Home() {
  const stats = await getStats()

  return (
    <>
      <NewNavbar />
      <main style={{ width: '100%', overflowX: 'hidden' }}>
        <HeroSection />
        <StatsBar stats={stats} />
        <HowItWorksSection />
        <CTABanner />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
