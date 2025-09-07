'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center"
      >
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
              <p className="text-xs text-gray-600">Authentication Error</p>
            </div>
          </Link>
        </motion.div>

        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-600">
            The password reset link you clicked is invalid or has expired. This can happen if:
          </p>
        </div>

        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• The link has already been used</li>
            <li>• The link has expired (links expire after 1 hour)</li>
            <li>• The link was clicked from an email preview</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/forgot-password" 
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Request New Reset Link
          </Link>
          <Link 
            href="/login" 
            className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Login
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you continue to have issues, please contact support.
        </p>
      </motion.div>
    </div>
  )
}
