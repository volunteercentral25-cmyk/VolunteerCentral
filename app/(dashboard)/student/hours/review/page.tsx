'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  User,
  LogOut,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface VolunteerHour {
  id: string
  hours: number
  date: string
  description: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  updated_at: string
  verification_email?: string
  verified_by?: string
  verification_date?: string
  verification_notes?: string
  admin_override_by?: string
  admin_override_reason?: string
  admin_override_date?: string
  volunteer_opportunities?: {
    title: string
    location: string
  }
}

export default function ReviewVolunteerHours() {
  const [user, setUser] = useState<any>(null)
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalHours: 0,
    pendingHours: 0,
    approvedHours: 0,
    deniedHours: 0
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadVolunteerHours()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const loadVolunteerHours = async () => {
    try {
      const { data: hours, error } = await supabase
        .from('volunteer_hours')
        .select(`
          *,
          volunteer_opportunities (
            title,
            location
          )
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setVolunteerHours(hours || [])

      // Calculate stats
      const totalHours = hours?.reduce((sum, hour) => sum + (hour.hours || 0), 0) || 0
      const pendingHours = hours?.filter(hour => hour.status === 'pending').length || 0
      const approvedHours = hours?.filter(hour => hour.status === 'approved').length || 0
      const deniedHours = hours?.filter(hour => hour.status === 'denied').length || 0

      setStats({
        totalHours,
        pendingHours,
        approvedHours,
        deniedHours
      })
    } catch (error) {
      console.error('Error loading volunteer hours:', error)
      setError('Failed to load volunteer hours')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hours</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadVolunteerHours} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard" className="flex items-center gap-3">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Student Dashboard</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Student</span>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="btn-secondary btn-hover-effect"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Volunteer Hours Review
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Review <span className="text-gradient">Volunteer Hours</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your volunteer service hours and their approval status.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalHours}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingHours}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedHours}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Denied</p>
                  <p className="text-3xl font-bold text-red-600">{stats.deniedHours}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hours List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Volunteer Hours History
              </CardTitle>
              <CardDescription>Your complete volunteer service record</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteerHours.length > 0 ? (
                <div className="space-y-4">
                  {volunteerHours.map((hour) => (
                    <div key={hour.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {hour.volunteer_opportunities?.title || 'Volunteer Service'}
                          </h3>
                          <p className="text-gray-600 mb-2">{hour.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(hour.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {hour.hours} hours
                            </span>
                            {hour.volunteer_opportunities?.location && (
                              <span>{hour.volunteer_opportunities.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(hour.status)}
                        </div>
                      </div>

                      {/* Additional details based on status */}
                      {hour.status === 'approved' && hour.verified_by && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <p className="text-sm text-green-800">
                            <strong>Verified by:</strong> {hour.verified_by}
                          </p>
                          {hour.verification_date && (
                            <p className="text-sm text-green-800">
                              <strong>Verified on:</strong> {formatDate(hour.verification_date)}
                            </p>
                          )}
                          {hour.verification_notes && (
                            <p className="text-sm text-green-800 mt-2">
                              <strong>Notes:</strong> {hour.verification_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {hour.status === 'denied' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                          {hour.admin_override_reason && (
                            <p className="text-sm text-red-800">
                              <strong>Reason:</strong> {hour.admin_override_reason}
                            </p>
                          )}
                          {hour.admin_override_date && (
                            <p className="text-sm text-red-800">
                              <strong>Denied on:</strong> {formatDate(hour.admin_override_date)}
                            </p>
                          )}
                        </div>
                      )}

                      {hour.status === 'pending' && hour.verification_email && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Verification email sent to:</strong> {hour.verification_email}
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Waiting for verification from the organization.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteer hours yet</h3>
                  <p className="text-gray-600 mb-6">Start logging your volunteer service hours to see them here.</p>
                  <Link href="/student/hours">
                    <Button className="btn-primary">
                      Log Hours
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
