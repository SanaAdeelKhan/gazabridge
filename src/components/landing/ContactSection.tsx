'use client'
import GazaCloudForm from '../ui/GazaCloudForm'

export default function ContactSection() {

  return (
    <section id="contact" className="section-shader section-shader-light" style={{
      width: '100%',
      background: 'var(--cream)',
      padding: '6rem 2rem',
      ['--shader-duration' as string]: '16s',
    } as React.CSSProperties}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gap: '4rem',
      }}>
        {/* Left column */}
        <div style={{
          background: 'rgba(255,255,255,0.45)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          color: '#1A1A14',
        }}>
          <div style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#C07A1A',
            fontWeight: 700,
            opacity: 1,
            marginBottom: '1rem',
          }}>
            Need Help?
          </div>

          <h2 className="font-playfair" style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1A1A14',
            opacity: 1,
            marginBottom: '1.25rem',
            lineHeight: 1.2,
          }}>
            Reach out, we're here.
          </h2>

          <p style={{
            color: '#2A2A1E',
            fontSize: '1.15rem',
            lineHeight: 1.8,
            marginBottom: '3rem',
            fontWeight: 500,
            opacity: 1,
          }}>
            Have questions? Want to get involved? Need support? We're here to help connect you with the right resources.
          </p>

          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(192,122,26,0.2)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                ✉️
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#3D3D2E', 
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 1,
                  marginBottom: '0.25rem' 
                }}>Email</div>
                <div style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1A1A14' 
                }}>hello@gazabridge.org</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(192,122,26,0.2)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                🌐
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#3D3D2E', 
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 1,
                  marginBottom: '0.25rem' 
                }}>Platform</div>
                <div style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1A1A14' 
                }}>gazabridge.netlify.app</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(192,122,26,0.2)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                🕊
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#3D3D2E', 
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 1,
                  marginBottom: '0.25rem' 
                }}>Mission</div>
                <div style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1A1A14' 
                }}>Free help, no barriers, always.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - GazaCloudForm */}
        <GazaCloudForm />
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  )
}
