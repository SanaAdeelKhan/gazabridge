import NewNavbar from '@/components/NewNavbar'
import SubjectTabsHome from '@/components/SubjectTabsHome'
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
        <section style={{ width: '100%', background: '#fffbeb', borderTop: '1px solid #fde68a', borderBottom: '1px solid #fde68a', padding: '40px 24px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#b45309', fontWeight: 600, marginBottom: '20px' }}>Browse by subject</p>
            <SubjectTabsHome />
          </div>
        </section>
        <HowItWorksSection />
        <CTABanner />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
