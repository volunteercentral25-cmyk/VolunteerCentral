import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Volunteer Central',
  description: 'Connect, serve, and make a difference in your community through volunteer opportunities.',
  keywords: 'volunteer, community service, opportunities, students, hours tracking',
  authors: [{ name: 'Volunteer Central Team' }],
  creator: 'Volunteer Central',
  publisher: 'Volunteer Central',
  robots: 'index, follow',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#7c3aed' }
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://volunteer-central.vercel.app',
    title: 'Volunteer Central',
    description: 'Connect, serve, and make a difference in your community through volunteer opportunities.',
    siteName: 'Volunteer Central',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Volunteer Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volunteer Central',
    description: 'Connect, serve, and make a difference in your community through volunteer opportunities.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
