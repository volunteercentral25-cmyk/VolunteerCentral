'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter a valid email address.' 
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ 
          type: 'error', 
          text: data.error || 'An error occurred. Please try again.' 
        })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Password reset email sent! Please check your inbox and follow the instructions to reset your password.' 
        })
        setEmail('') // Clear the email field
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
              <div>
                <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                <p className="text-xs text-gray-600">Reset Password</p>
              </div>
            </Link>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-4 py-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-600' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </motion.button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link href="/#auth?tab=login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/#auth?tab=register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Only registered users can reset their password. If you don't have an account, please sign up first.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
