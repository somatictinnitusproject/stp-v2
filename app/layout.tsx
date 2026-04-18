import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionExpiryModal from '@/components/auth/SessionExpiryModal'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Somatic Tinnitus Project',
  description: 'A structured rehabilitation programme for somatic tinnitus.',
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
      </head>
      <body className="min-h-full">
        {children}
        <SessionExpiryModal />
      </body>
    </html>
  )
}
