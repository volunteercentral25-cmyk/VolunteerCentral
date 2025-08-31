'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MobileAdminLayout from '@/components/layout/mobile-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Star,
  ArrowRight,
  Activity
} from 'lucide-react'
import Link from 'next/link'

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MobileAdminLayout currentPage="dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </MobileAdminLayout>
    )
  }

  if (error) {
    return (
      <MobileAdminLayout currentPage="dashboard">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </MobileAdminLayout>
    )
  }

  return (
    <MobileAdminLayout currentPage="dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Admin Control Center
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="text-gray-600 text-sm">
          Manage the volunteer system. Monitor students, opportunities, and volunteer hours.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Students</p>
                <p className="text-xl font-bold text-blue-600">{dashboardData?.stats.totalStudents || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Opportunities</p>
                <p className="text-xl font-bold text-green-600">{dashboardData?.stats.totalOpportunities || 0}</p>
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
                <p className="text-xs font-medium text-gray-600">Pending Hours</p>
                <p className="text-xl font-bold text-orange-600">{dashboardData?.stats.pendingHours || 0}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Hours</p>
                <p className="text-xl font-bold text-purple-600">{dashboardData?.stats.totalHours || 0}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/students">
              <Button className="w-full justify-between bg-blue-600 hover:bg-blue-700">
                <span>Manage Students</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/opportunities">
              <Button className="w-full justify-between bg-green-600 hover:bg-green-700">
                <span>Manage Opportunities</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/hours">
              <Button className="w-full justify-between bg-orange-600 hover:bg-orange-700">
                <span>Review Hours</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/domains">
              <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700">
                <span>Manage Domains</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {/* Recent Hours */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recent Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentHours && dashboardData.recentHours.length ? (
                dashboardData.recentHours.slice(0, 3).map((hour) => {
                  try {
                    return (
                      <div key={hour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{hour.profiles?.full_name || 'Unknown Student'}</p>
                          <p className="text-xs text-gray-600">{hour.hours} hours</p>
                        </div>
                        <Badge className={
                          hour.status === 'approved' ? 'bg-green-100 text-green-800' :
                          hour.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {hour.status}
                        </Badge>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering hour:', error, hour);
                    return null;
                  }
                })
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No recent hours</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              Upcoming Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentOpportunities && dashboardData.recentOpportunities.length ? (
                dashboardData.recentOpportunities.slice(0, 3).map((opportunity) => {
                  try {
                    return (
                      <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{opportunity.title}</p>
                          <p className="text-xs text-gray-600">{opportunity.location}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(opportunity.date).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering opportunity:', error, opportunity);
                    return null;
                  }
                })
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No upcoming opportunities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MobileAdminLayout>
  )
}
