'use client'
import { useState, useEffect, useRef } from 'react'
import { Stepper, Step } from '../ui/Stepper'

const volunteerSteps = [
  {
    titleEn: 'Create your profile',
    subtextEn: 'List your skills, languages, and availability. Takes just 2 minutes.',
    titleAr: 'أنشئ ملفك الشخصي',
    subtextAr: 'أدرج مهاراتك ولغاتك وتوفرك. يستغرق دقيقتين فقط.',
  },
  {
    titleEn: 'Browse open requests',
    subtextEn: 'Filter by skill, language, and timezone. Find opportunities that match.',
    titleAr: 'تصفح الطلبات المفتوحة',
    subtextAr: 'صفّح حسب المهارة واللغة والمنطقة الزمنية.',
  },
  {
    titleEn: 'Connect & start helping',
    subtextEn: 'Direct message, no middleman. Start making a real difference.',
    titleAr: 'تواصل وابدأ المساعدة',
    subtextAr: 'رسائل مباشرة، بلا وسيط. ابدأ في إحداث فرق حقيقي.',
  },
]

const needHelpSteps = [
  {
    titleEn: 'Post your need',
    subtextEn: 'Describe what help you\'re looking for. Always free, no barriers.',
    titleAr: 'انشر احتياجك',
    subtextAr: 'صف نوع المساعدة التي تبحث عنها. مجاني دائماً.',
  },
  {
    titleEn: 'Get matched with volunteers',
    subtextEn: 'Our global network finds the right volunteer for your exact need.',
    titleAr: 'تم مطابقتك مع متطوعين',
    subtextAr: 'تجد شبكتنا العالمية المتطوع المناسب لاحتياجك.',
  },
  {
    titleEn: 'Receive support directly',
    subtextEn: 'Connect safely and privately. Learn and grow on your own schedule.',
    titleAr: 'احصل على الدعم مباشرة',
    subtextAr: 'تواصل بأمان وخصوصية. تعلم وانمُ وفق جدولك.',
  },
]

export default function HowItWorksSection() {
  const [activePanel, setActivePanel] = useState<'volunteer' | 'help'>('volunteer')
  const [animated, setAnimated] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true)
          const cards = document.querySelectorAll('.step-card')
          cards.forEach((card, i) => {
            setTimeout(() => {
              (card as HTMLElement).style.opacity = '1'
              ;(card as HTMLElement).style.transform = 'translateY(0)'
            }, i * 150)
          })
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [animated])

  const steps = activePanel === 'volunteer' ? volunteerSteps : needHelpSteps
  const accentColor = activePanel === 'volunteer' ? '#5C6B2E' : '#C07A1A'

  return (
    <section ref={sectionRef} id="hiw" className="section-shader section-shader-light" style={{
      width: '100%',
      background: 'var(--warm-white)',
      padding: '6rem 2rem',
      ['--shader-duration' as string]: '14s',
    } as React.CSSProperties}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Section tag */}
        <div style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--amber)',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          Process
        </div>

        {/* Title */}
        <h2 className="font-playfair" style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--dark)',
          marginBottom: '0.75rem',
        }}>
          How it Works
        </h2>

        {/* Subtitle */}
        <p style={{
          color: 'var(--muted)',
          fontSize: '1rem',
          marginBottom: '3rem',
        }}>
          Three simple steps to connect and make a difference
        </p>

        {/* Toggle switcher */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(92,107,46,0.08)',
          borderRadius: '100px',
          padding: '0.25rem',
          marginBottom: '3.5rem',
        }}>
          <button
            type="button"
            onClick={() => setActivePanel('volunteer')}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '100px',
              border: 'none',
              background: activePanel === 'volunteer' ? 'var(--olive)' : 'transparent',
              color: activePanel === 'volunteer' ? '#fff' : 'var(--muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activePanel === 'volunteer' ? '0 4px 12px rgba(92,107,46,0.3)' : 'none',
            }}
          >
            🤝 I Want to Volunteer
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('help')}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '100px',
              border: 'none',
              background: activePanel === 'help' ? 'var(--olive)' : 'transparent',
              color: activePanel === 'help' ? '#fff' : 'var(--muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activePanel === 'help' ? '0 4px 12px rgba(92,107,46,0.3)' : 'none',
            }}
          >
            🌟 I Need Help
          </button>
        </div>

        {/* Stepper */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(250, 246, 238, 1) 0%, rgba(245, 238, 220, 0.95) 50%, rgba(240, 232, 210, 0.9) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(192, 122, 26, 0.2)',
          borderLeft: activePanel === 'volunteer' ? '3px solid rgba(92, 107, 46, 0.35)' : '3px solid rgba(192, 122, 26, 0.35)',
          padding: '2.5rem',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 24px rgba(192, 122, 26, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        }}>
          <Stepper
            activeColor={accentColor}
            completeColor={accentColor}
            backButtonText="السابق / Back"
            nextButtonText="التالي / Next"
          >
            {steps.map((step, i) => (
              <Step key={i}>
                <div style={{ padding: '1rem 0' }}>
                  <h3 className="font-playfair" style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#1A1A14',
                    marginBottom: '0.5rem',
                  }}>
                    {step.titleEn}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--muted)',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}>
                    {step.subtextEn}
                  </p>
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '0.75rem',
                    padding: '0.75rem',
                    borderTop: '1px dashed rgba(0,0,0,0.08)',
                    borderRadius: '10px',
                    background: activePanel === 'volunteer' ? 'rgba(92,107,46,0.04)' : 'rgba(192,122,26,0.04)',
                    textAlign: 'right',
                  }}>
                    <p className="font-arabic" style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#1A1A14',
                      direction: 'rtl',
                      marginBottom: '0.5rem',
                    }}>
                      {step.titleAr}
                    </p>
                    <p className="font-arabic" style={{
                      fontSize: '0.95rem',
                      color: 'var(--muted)',
                      direction: 'rtl',
                      lineHeight: 1.6,
                    }}>
                      {step.subtextAr}
                    </p>
                  </div>
                </div>
              </Step>
            ))}
          </Stepper>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          section > div > div:last-child {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  )
}
