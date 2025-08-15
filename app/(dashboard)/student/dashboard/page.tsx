'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Calendar,
  Award,
  User,
  LogOut,
  TrendingUp,
  Heart,
  Target,
  CheckCircle,
  ArrowRight,
  Activity,
  Star
} from 'lucide-react'

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHours: 0,
    opportunities: 0,
    achievements: 0,
    pendingHours: 0
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Mock stats - in real app, fetch from database
        setStats({
          totalHours: 24,
          opportunities: 3,
          achievements: 2,
          pendingHours: 8
        })
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/cata-logo.png" alt="CATA Logo" width={48} height={48} className="rounded-lg shadow-glow" />
              <div>
                <p className="text-lg font-semibold text-gradient">CATA Volunteer</p>
                <p className="text-xs text-gray-600">Student Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.user_metadata?.full_name || 'Student'}</span>
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Welcome back!
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hello, <span className="text-gradient">{user?.user_metadata?.full_name || 'Student'}</span>! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to make a difference? Track your progress, discover opportunities, and continue building your community impact.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gradient">{stats.totalHours}</p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gradient">{stats.opportunities}</p>
              <p className="text-sm text-gray-600">Opportunities</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                <Award className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gradient">{stats.achievements}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-red-600">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gradient">{stats.pendingHours}</p>
              <p className="text-sm text-gray-600">Pending Hours</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/student/hours">
              <Card className="glass-effect border-0 shadow-xl card-hover-effect cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Log Hours</h3>
                      <p className="text-sm text-gray-600">Record your volunteer activities</p>
                    </div>
                  </div>
                  <Button className="btn-primary w-full">
                    Log Hours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student/opportunities">
              <Card className="glass-effect border-0 shadow-xl card-hover-effect cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
                      <p className="text-sm text-gray-600">Find new volunteer events</p>
                    </div>
                  </div>
                  <Button className="btn-primary w-full">
                    Browse Opportunities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student/profile">
              <Card className="glass-effect border-0 shadow-xl card-hover-effect cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-3">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                      <p className="text-sm text-gray-600">View your progress & history</p>
                    </div>
                  </div>
                  <Button className="btn-primary w-full">
                    View Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Activity</h2>
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Community Garden Cleanup</p>
                    <p className="text-sm text-gray-600">4 hours logged • 2 days ago</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Food Bank Volunteer</p>
                    <p className="text-sm text-gray-600">6 hours logged • 1 week ago</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Library Reading Program</p>
                    <p className="text-sm text-gray-600">3 hours logged • 1 week ago</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Progress</h2>
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours Goal</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Progress</span>
                      <span className="font-medium">{stats.totalHours}/100 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.totalHours / 100) * 100}%` }}
                        transition={{ duration: 1, delay: 1 }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {100 - stats.totalHours} hours remaining to reach your goal
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <div className="rounded-full bg-purple-100 p-2">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">First Steps</p>
                        <p className="text-sm text-gray-600">Complete your first 10 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <div className="rounded-full bg-pink-100 p-2">
                        <TrendingUp className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Consistent Helper</p>
                        <p className="text-sm text-gray-600">Volunteer for 3 consecutive weeks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
