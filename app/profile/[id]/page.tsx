'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User,
  Award,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Star,
  Activity,
  Share2,
  Copy,
  CheckCircle,
  Users,
  GraduationCap,
  Heart,
  ArrowLeft
} from 'lucide-react'

interface PublicProfile {
  id: string
  fullName: string
  studentId: string
  bio: string
  clubs: Array<{
    id: string
    name: string
    description: string
  }>
  memberSince: string
  volunteerStats: {
    totalHours: number
    totalActivities: number
    recentActivities: Array<{
      description: string
      hours: number
      date: string
    }>
  }
  upcomingOpportunities: Array<{
    title: string
    organization: string
    date: string
    location: string
  }>
}

export default function PublicProfile() {
  const params = useParams()
  const profileId = params?.id as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (profileId) {
      loadProfile()
    }
  }, [profileId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      // Get the share token from URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const shareToken = urlParams.get('token')
      
      if (!shareToken) {
        throw new Error('Share token is required')
      }
      
      const response = await fetch(`/api/public/profile/${profileId}?token=${shareToken}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profile not found')
        }
        if (response.status === 410) {
          throw new Error('This share link has expired or been deactivated')
        }
        throw new Error('Failed to load profile')
      }
      
      const data = await response.json()
      
      // Transform the API response to match the expected interface
      if (data.success && data.profile) {
        const transformedProfile: PublicProfile = {
          id: data.profile.id,
          fullName: data.profile.full_name,
          studentId: data.profile.student_id,
          bio: data.profile.bio || '',
          clubs: data.profile.clubs || [],
          memberSince: data.profile.created_at,
          volunteerStats: {
            totalHours: data.volunteer_hours?.reduce((total: number, hour: any) => total + (hour.hours || 0), 0) || 0,
            totalActivities: data.volunteer_hours?.length || 0,
            recentActivities: data.volunteer_hours?.slice(0, 5).map((hour: any) => ({
              description: hour.description || 'Volunteer Activity',
              hours: hour.hours || 0,
              date: hour.date
            })) || []
          },
          upcomingOpportunities: data.registrations?.map((reg: any) => ({
            title: reg.volunteer_opportunities?.title || 'Volunteer Opportunity',
            organization: reg.volunteer_opportunities?.description || 'Organization',
            date: reg.volunteer_opportunities?.date || reg.registered_at,
            location: reg.volunteer_opportunities?.location || 'Location TBD'
          })) || []
        }
        setProfile(transformedProfile)
      } else {
        throw new Error('Invalid profile data received')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleShareProfile = async () => {
    const profileUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.fullName} - Volunteer Profile`,
          text: `Check out ${profile?.fullName}'s volunteer profile on Volunteer Central`,
          url: profileUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
        copyToClipboard(profileUrl)
      }
    } else {
      copyToClipboard(profileUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
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

  if (error || !profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="glass-effect border-0 shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested profile could not be found.'}</p>
            <Button asChild className="btn-primary">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
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
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Public Profile</p>
                </div>
              </Link>
            </div>
            <Button 
              onClick={handleShareProfile}
              variant="outline" 
              className="btn-secondary btn-hover-effect"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profile.fullName.split(' ').map(name => name[0]).join('')}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {profile.fullName}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <GraduationCap className="h-3 w-3 mr-1" />
              Student ID: {profile.studentId}
            </Badge>
          </div>

          {/* Club Memberships */}
          {profile.clubs && profile.clubs.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {profile.clubs.map((club) => (
                <Badge key={club.id} variant="outline" className="border-blue-500 text-blue-700">
                  <Star className="h-3 w-3 mr-1" />
                  {club.name}
                </Badge>
              ))}
            </div>
          )}

          {profile.bio && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {profile.bio}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Volunteer since {new Date(profile.memberSince).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Volunteer Hours
              </CardTitle>
              <CardDescription>Total contribution to the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile.volunteerStats.totalHours}
              </div>
              <p className="text-gray-600">
                Across {profile.volunteerStats.totalActivities} activities
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Impact Score
              </CardTitle>
              <CardDescription>Community engagement level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profile.volunteerStats.totalActivities > 0 ? 
                  Math.min(100, Math.round((profile.volunteerStats.totalHours / 10) * 10 + profile.volunteerStats.totalActivities * 5)) : 0}
              </div>
              <p className="text-gray-600">
                Based on hours and activities
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest volunteer contributions</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.volunteerStats.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {profile.volunteerStats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Heart className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.hours} hours
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No activities recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Opportunities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Opportunities
                </CardTitle>
                <CardDescription>Registered volunteer events</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.upcomingOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {profile.upcomingOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{opportunity.title}</p>
                          <div className="space-y-1 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {opportunity.organization}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(opportunity.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {opportunity.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Inspired by {profile.fullName.split(' ')[0]}'s volunteer work?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join Volunteer Central to track your own volunteer hours, find opportunities, and make a difference in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-primary">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" className="btn-secondary">
                  <Link href="/">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
