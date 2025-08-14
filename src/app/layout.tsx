import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CATA Volunteer',
  description: 'Community Action Through Volunteering',
  icons: {
    icon: [
      { url: '/cata-logo.png' },
      { url: '/images/cata-logo.png' },
    ],
    apple: [
      { url: '/cata-logo.png' },
      { url: '/images/cata-logo.png' },
    ],
    shortcut: ['/cata-logo.png'],
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
