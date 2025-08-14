'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOpportunities: 0,
    pendingHours: 0,
    totalHours: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') {
          router.push('/student/dashboard')
          return
        }
        
        setUser(user)
        await loadStats()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const loadStats = async () => {
    try {
      // Get total students
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Get total opportunities
      const { count: opportunitiesCount } = await supabase
        .from('volunteer_opportunities')
        .select('*', { count: 'exact', head: true })

      // Get pending hours
      const { count: pendingCount } = await supabase
        .from('volunteer_hours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get total hours
      const { data: hoursData } = await supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('status', 'approved')

      const totalHours = hoursData?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0

      setStats({
        totalStudents: studentsCount || 0,
        totalOpportunities: opportunitiesCount || 0,
        pendingHours: pendingCount || 0,
        totalHours: totalHours
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Image
              src="/images/cata-logo.png"
              alt="CATA Logo"
              width={100}
              height={100}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Manage CATA Volunteer System</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStudents}</div>
            <div className="text-gray-600">Total Students</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalOpportunities}</div>
            <div className="text-gray-600">Opportunities</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingHours}</div>
            <div className="text-gray-600">Pending Hours</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalHours}</div>
            <div className="text-gray-600">Total Hours</div>
          </motion.div>
        </div>

        {/* Management Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">Student Management</h3>
            <p className="text-gray-600 mb-4">View and manage student accounts, profiles, and permissions.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Manage Students
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">Opportunity Management</h3>
            <p className="text-gray-600 mb-4">Create, edit, and manage volunteer opportunities.</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Manage Opportunities
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">Hours Approval</h3>
            <p className="text-gray-600 mb-4">Review and approve pending volunteer hours.</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Review Hours
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
