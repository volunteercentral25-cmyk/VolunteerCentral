'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClubSelectionModal } from '@/components/profile'
import MobileAdminLayout from '@/components/layout/mobile-admin-layout'
import { 
  Users,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Star,
  Shield,
  ArrowRight
} from 'lucide-react'

interface DashboardData {
  stats: {
    totalStudents: number
    totalOpportunities: number
    pendingHours: number
    totalHours: number
  }
  recentHours: Array<{
    id: string
    hours: number
    status: string
    created_at: string
    profiles: {
      full_name: string
      email: string
    }
  }>
  recentOpportunities: Array<{
    id: string
    title: string
    date: string
    location: string
  }>
  recentRegistrations: Array<{
    id: string
    status: string
    volunteer_opportunities: {
      title: string
    }
    profiles: {
      full_name: string
    }
  }>
  profile: any
}

export default function MobileAdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClubModal, setShowClubModal] = useState(false)
  const [clubModalChecked, setClubModalChecked] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadDashboardData()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load dashboard data')
      }
      const data = await response.json()
      setDashboardData(data)
      
      // Check if admin needs to complete club selection
      if (!clubModalChecked) {
        try {
          const clubResponse = await fetch('/api/student/clubs')
          if (clubResponse.ok) {
            const clubData = await clubResponse.json()
            // Show modal if clubs_completed is false or null
            if (!clubData.clubs_completed) {
              setShowClubModal(true)
            }
          }
        } catch (error) {
          console.error('Error checking club status:', error)
        }
        setClubModalChecked(true)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    }
  }

  const handleClubModalComplete = () => {
    setShowClubModal(false)
    // Refresh dashboard data to get updated club information
    loadDashboardData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MobileAdminLayout
      currentPage="dashboard"
      pageTitle="Admin Dashboard"
      pageDescription="Manage the volunteer system. Monitor students, opportunities, and volunteer hours."
      onSignOut={handleSignOut}
      userName={dashboardData?.profile?.full_name || 'Admin'}
    >
      {/* Stats Cards - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats.totalStudents || 0}</p>
              <p className="text-xs text-gray-600">Students</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="p-2 bg-green-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.stats.totalOpportunities || 0}</p>
              <p className="text-xs text-gray-600">Opportunities</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="p-2 bg-orange-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{dashboardData?.stats.pendingHours || 0}</p>
              <p className="text-xs text-gray-600">Pending Hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{dashboardData?.stats.totalHours || 0}</p>
              <p className="text-xs text-gray-600">Total Hours</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Management Cards - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4 mb-6"
      >
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              Student Management
            </CardTitle>
            <CardDescription className="text-sm">View and manage student accounts, profiles, and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/admin/students">
                Manage Students
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Opportunity Management
            </CardTitle>
            <CardDescription className="text-sm">Create, edit, and manage volunteer opportunities.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/admin/opportunities">
                Manage Opportunities
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Hours Approval
            </CardTitle>
            <CardDescription className="text-sm">Review and approve pending volunteer hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/admin/hours">
                Review Hours
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-indigo-600" />
              Email Domains
            </CardTitle>
            <CardDescription className="text-sm">Manage trusted and untrusted email domains for verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/admin/domains">
                Manage Domains
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="space-y-4"
      >
        {/* Recent Hours */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recent Hours
            </CardTitle>
            <CardDescription className="text-sm">Latest volunteer hours submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentHours.length ? (
                dashboardData.recentHours.slice(0, 3).map((hour) => (
                  <div key={hour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{hour.profiles.full_name}</p>
                      <p className="text-xs text-gray-600">{hour.hours} hours</p>
                    </div>
                    <Badge className={
                      hour.status === 'approved' ? 'bg-green-100 text-green-800 text-xs' :
                      hour.status === 'pending' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                      'bg-red-100 text-red-800 text-xs'
                    }>
                      {hour.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No recent hours</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              Upcoming Opportunities
            </CardTitle>
            <CardDescription className="text-sm">Latest volunteer opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentOpportunities.length ? (
                dashboardData.recentOpportunities.slice(0, 3).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{opportunity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{opportunity.location}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-2">
                      {new Date(opportunity.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No upcoming opportunities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Club Selection Modal */}
      <ClubSelectionModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        onComplete={handleClubModalComplete}
        userRole="admin"
      />
    </MobileAdminLayout>
  )
}
