"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      checkUserRole()
    }
  }, [user, loading, router])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.profile?.role || 'student')
      } else {
        console.error('Error fetching user role:', response.statusText)
        setUserRole('student')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRole('student')
    } finally {
      setCheckingRole(false)
    }
  }

  useEffect(() => {
    if (userRole && !checkingRole) {
      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    }
  }, [userRole, checkingRole, router])

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading Dashboard" 
          className="text-center"
        />
      </div>
    )
  }

  return null
}
