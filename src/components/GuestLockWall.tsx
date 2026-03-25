'use client'
import { useRouter } from 'next/navigation'

/**
 * GuestLockWall — shown in place of contact info or messaging for guest users.
 * Drop this anywhere in the dashboard/volunteers/needs pages.
 *
 * Usage:
 *   import GuestLockWall from '@/components/GuestLockWall'
 *   ...
 *   {isGuest ? <GuestLockWall /> : <ContactInfo ... />}
 */
export default function GuestLockWall({ message }: { message?: string }) {
  const router = useRouter()

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)',
      border: '1.5px solid rgba(192,122,26,0.2)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>🔒</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#1A1A14',
          marginBottom: '0.2rem',
        }}>
          {message || 'Create a profile to connect'}
        </div>
        <div style={{
          fontSize: '0.82rem',
          color: '#8A8572',
          lineHeight: 1.5,
        }}>
          Join GazaBridge free — takes 2 minutes.
        </div>
      </div>
      <button
        onClick={() => router.push('/choose-role')}
        style={{
          flexShrink: 0,
          background: 'linear-gradient(135deg, #C07A1A, #E09030)',
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          padding: '0.5rem 1.1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: "'Playfair Display', serif",
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(192,122,26,0.3)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(192,122,26,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,122,26,0.3)'
        }}
      >
        Join free →
      </button>
    </div>
  )
}
