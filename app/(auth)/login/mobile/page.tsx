'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MobileLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('User logged in successfully:', data.user.id)
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          console.log('Profile not found, creating one...')
          // Create profile if it doesn't exist
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 'User',
              student_id: data.user.user_metadata?.student_id,
              role: data.user.user_metadata?.role || 'student'
            })

          if (createProfileError) {
            console.error('Failed to create profile:', createProfileError)
            // Continue anyway - user can still access the app
          }
        }

        // Redirect based on user role
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
                <p className="text-xs text-gray-600">Sign In</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm">Sign in to your volunteer account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Enter your password"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-600 text-sm">
                <Link href="/forgot-password" className="text-purple-600 hover:text-purple-700 font-medium">
                  Forgot your password?
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign up
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
