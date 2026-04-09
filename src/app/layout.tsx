import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'GazaBridge — Connect. Help. Rebuild.',
  description: 'Connecting volunteers worldwide with people in Gaza',
  metadataBase: new URL('https://gazabridge.netlify.app'),
  openGraph: {
    title: 'GazaBridge — Connect. Help. Rebuild.',
    description: 'Connecting volunteers worldwide with people in Gaza. Free help, no barriers, real impact.',
    url: 'https://gazabridge.netlify.app',
    siteName: 'GazaBridge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GazaBridge Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GazaBridge — Connect. Help. Rebuild.',
    description: 'Connecting volunteers worldwide with people in Gaza.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen w-full overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
