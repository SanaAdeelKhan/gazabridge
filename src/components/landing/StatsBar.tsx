'use client'
import { useEffect, useRef, useState } from 'react'

interface StatsBarProps {
  stats: {
    volunteers: number
    connections: number
    requests: number
  }
}

export default function StatsBar({ stats }: StatsBarProps) {
  const [counts, setCounts] = useState({ volunteers: 0, connections: 0, requests: 0 })
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateCounts()
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  const animateCounts = () => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setCounts({
        volunteers: Math.floor(stats.volunteers * progress),
        connections: Math.floor(stats.connections * progress),
        requests: Math.floor(stats.requests * progress),
      })

      if (step >= steps) {
        clearInterval(timer)
        setCounts(stats)
      }
    }, interval)
  }

  return (
    <section ref={sectionRef} className="section-shader section-shader-dark" style={{
      width: '100%',
      background: 'var(--dark)',
      padding: '3rem 2rem',
      ['--shader-duration' as string]: '10s',
    } as React.CSSProperties}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '0 1rem',
        }}>
          <div className="font-playfair" style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--amber-light)',
            marginBottom: '0.5rem',
          }}>
            {counts.volunteers}
          </div>
          <div style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--muted)',
          }}>
            Volunteers
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '0 1rem',
          borderLeft: '1px solid rgba(250,246,238,0.15)',
          borderRight: '1px solid rgba(250,246,238,0.15)',
        }}>
          <div className="font-playfair" style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--amber-light)',
            marginBottom: '0.5rem',
          }}>
            {counts.connections}
          </div>
          <div style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--muted)',
          }}>
            Messages Sent
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '0 1rem',
        }}>
          <div className="font-playfair" style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--amber-light)',
            marginBottom: '0.5rem',
          }}>
            {counts.requests}
          </div>
          <div style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--muted)',
          }}>
            Help Requests
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          section > div > div {
            border: none !important;
          }
        }
      `}</style>
    </section>
  )
}
