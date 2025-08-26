'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AuthErrorHandler() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        router.push('/')
      }
    })

    // Handle auth errors
    const handleAuthError = (error: any) => {
      console.error('Auth error detected:', error)
      
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('Token expired')) {
        console.log('Session expired, redirecting to login')
        supabase.auth.signOut()
        router.push('/')
      }
    }

    // Listen for unhandled promise rejections (auth errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Invalid Refresh Token') ||
          event.reason?.message?.includes('Refresh Token Not Found') ||
          event.reason?.message?.includes('Token expired')) {
        event.preventDefault()
        handleAuthError(event.reason)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router, supabase])

  return null
}
