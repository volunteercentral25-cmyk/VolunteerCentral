'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { ClubSelectionModal } from '@/components/profile'
import {
  DashboardHeader,
  StatsCards,
  QuickActions,
  RecentActivity,
  ProgressSection,
  LoadingSpinner,
  ErrorDisplay
} from '@/components/dashboard'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Star,
  ArrowRight,
  Activity,
  Download,
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react'

export default function MobileStudentDashboard() {
  const { data, loading, error, refetch } = useDashboard()
  const [showClubModal, setShowClubModal] = useState(false)
  const [clubModalChecked, setClubModalChecked] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if user needs to complete club selection
  useEffect(() => {
    const checkClubStatus = async () => {
      if (data?.profile && !clubModalChecked) {
        try {
          const response = await fetch('/api/student/clubs')
          if (response.ok) {
            const clubData = await response.json()
            // Show modal only if clubs_setup_completed is false or null (first login)
            if (!clubData.clubs_setup_completed) {
              setShowClubModal(true)
            }
          }
        } catch (error) {
          console.error('Error checking club status:', error)
        }
        setClubModalChecked(true)
      }
    }

    if (!loading && data) {
      checkClubStatus()
    }
  }, [data, loading, clubModalChecked])

  const handleClubModalComplete = () => {
    setShowClubModal(false)
    // Refresh dashboard data to get updated club information
    refetch()
    // Also refresh the page to ensure all components get updated data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <ErrorDisplay error={error} onRetry={refetch} className="min-h-screen" />
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Preparing your dashboard..." />
      </div>
    )
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
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Volunteer Central Logo" width={28} height={28} className="rounded-lg shadow-glow" priority />
              <div>
                <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                <p className="text-xs text-gray-600">Student Dashboard</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <Link href="/student/hours" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Log Hours
                  </Button>
                </Link>
                <Link href="/student/opportunities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Opportunities
                  </Button>
                </Link>
                <Link href="/student/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link href="/student/hours/review" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Review Hours
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 w-full">
        {/* Mobile Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Welcome back!
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Hello, <span className="text-gradient">{data.profile.full_name}</span>! 👋
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Ready to make a difference? Track your progress, discover opportunities, and continue building your community impact.
          </p>
        </motion.div>

        {/* Mobile Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Hours</p>
                    <p className="text-xl font-bold text-purple-600">{data.stats.totalHours || 0}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Opportunities</p>
                    <p className="text-xl font-bold text-green-600">{data.stats.opportunities || 0}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Achievements</p>
                    <p className="text-xl font-bold text-blue-600">{data.stats.achievements || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Goal Progress</p>
                    <p className="text-xl font-bold text-orange-600">{data.stats.goalProgress || 0}%</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Mobile Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/student/hours">
                <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700">
                  <span>Log Hours</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/opportunities">
                <Button className="w-full justify-between bg-green-600 hover:bg-green-700">
                  <span>Find Opportunities</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/profile">
                <Button className="w-full justify-between bg-blue-600 hover:bg-blue-700">
                  <span>View Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/hours/review">
                <Button className="w-full justify-between bg-orange-600 hover:bg-orange-700">
                  <span>Review Hours</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Progress</span>
                <span className="font-medium">{data.stats.totalHours}/{data.stats.goalHours || 20} hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.stats.goalProgress || 0}%` }}
                  transition={{ duration: 1, delay: 1 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-600">
                {Math.max(0, (data.stats.goalHours || 20) - data.stats.totalHours)} hours remaining to reach your goal
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Club Selection Modal */}
      <ClubSelectionModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        onComplete={handleClubModalComplete}
        userRole="student"
      />
    </div>
  )
}
