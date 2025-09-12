'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MobileVerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleResendVerification = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await supabase.auth.getUser()).data.user?.email || ''
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Verification email sent! Check your inbox.')
      }
    } catch (err) {
      console.error('Resend verification error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email_confirmed_at) {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    // Check verification status periodically
    const interval = setInterval(checkVerificationStatus, 3000)
    return () => clearInterval(interval)
  }, [router, supabase])

  return (
    <div className="min-h-screen gradient-bg overflow-hidden w-full">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Mobile Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md w-full"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 w-full">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Volunteer Central Logo" width={28} height={28} className="rounded-lg shadow-glow" />
              <div>
                <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                <p className="text-xs text-gray-600">Verify Email</p>
              </div>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8 w-full">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 rounded-lg shadow-xl p-6 w-full max-w-sm backdrop-blur-sm"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <Image src="/logo.png" alt="Volunteer Central Logo" width={24} height={24} className="rounded-lg" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-gray-600 text-sm">Check your inbox for a verification link</p>
            </div>

            <div className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm"
                >
                  {message}
                </motion.div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </motion.button>
            </div>

            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-600 text-sm">
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Back to Sign In
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
