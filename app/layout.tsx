import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionExpiryModal from '@/components/auth/SessionExpiryModal'
import PWARegister from '@/components/PWARegister'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Somatic Tinnitus Project',
  description: 'A structured rehabilitation programme for somatic tinnitus.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STP',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#4A9B8E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
      </head>
      <body className="min-h-full">
        {children}
        <SessionExpiryModal />
        <PWARegister />
      </body>
    </html>
  )
}
