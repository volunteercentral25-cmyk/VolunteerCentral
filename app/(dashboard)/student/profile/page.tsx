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
import { EditProfileModal } from '@/components/profile'
import { ClubSelectionModal } from '@/components/profile'
import { 
  User,
  LogOut,
  ArrowLeft,
  Mail,
  GraduationCap,
  Award,
  Clock,
  Calendar,
  Target,
  Edit,
  Shield,
  Loader2,
  XCircle,
  Users,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    email: string
    student_id: string | null
    full_name: string
    role: string
    created_at: string
    beta_club?: boolean
    nths?: boolean
    first_steps_achieved_at?: string
    dedicated_helper_achieved_at?: string
    community_champion_achieved_at?: string
  }
  stats: {
    totalHours: number
    pendingHours: number
    opportunities: number
    achievements: number
    goalProgress: number
    goalHours: number
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    earned: boolean
    earnedAt?: string
    progress?: number
    target?: number
  }>
  clubs: Array<{
    id: string
    name: string
    description: string
  }>
}

export default function StudentProfile() {
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isClubModalOpen, setIsClubModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          
          // Fetch profile data from API
          const response = await fetch('/api/student/profile')
          console.log('Profile API response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Profile API response data:', data)
            
            // Validate the data structure
            if (data && data.profile && data.stats && Array.isArray(data.achievements) && Array.isArray(data.clubs)) {
              setProfileData(data)
            } else {
              console.error('Invalid profile data structure:', data)
              setError('Invalid profile data received from server')
            }
          } else {
            const errorData = await response.json()
            console.error('Profile API error:', errorData)
            setError(errorData.error || 'Failed to fetch profile data')
          }
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    if (profileData && updatedProfile && typeof updatedProfile === 'object') {
      setProfileData({
        ...profileData,
        profile: {
          ...profileData.profile,
          ...updatedProfile
        }
      })
    }
  }

  const handleClubModalComplete = () => {
    console.log('Club modal completed, refreshing page...')
    setIsClubModalOpen(false)
    // Refresh the page to get updated club information
    setTimeout(() => {
      console.log('Reloading page to get updated club data...')
      window.location.reload()
    }, 2000) // Increased delay to ensure API has time to process
  }

  const handleShareProfile = async () => {
    if (!safeProfile?.id) return
    
    try {
      // Create a new share token
      const response = await fetch('/api/student/share-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresInDays: 30 // Share link expires in 30 days
        })
      })

      if (response.ok) {
        const data = await response.json()
        const shareUrl = data.shareUrl
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${safeProfile.full_name} - Volunteer Profile`,
              text: `Check out ${safeProfile.full_name}'s volunteer profile on Volunteer Central`,
              url: shareUrl
            })
          } catch (error) {
            console.error('Error sharing:', error)
            copyToClipboard(shareUrl)
          }
        } else {
          copyToClipboard(shareUrl)
        }
      } else {
        console.error('Failed to create share link')
        // Fallback to old method
        const profileUrl = `${window.location.origin}/profile/${safeProfile.id}`
        copyToClipboard(profileUrl)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      // Fallback to old method
      const profileUrl = `${window.location.origin}/profile/${safeProfile.id}`
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

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 text-purple-600 mx-auto animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Profile</h2>
            <p className="text-gray-600">Please wait while we load your data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { profile, stats, achievements, clubs } = profileData

  // Ensure arrays are always defined to prevent map errors
  const safeAchievements = achievements || []
  const safeClubs = clubs || []
  
  // Ensure other properties exist
  const safeProfile = profile || {}
  const safeStats = stats || { totalHours: 0, pendingHours: 0, opportunities: 0, achievements: 0, goalProgress: 0, goalHours: 20 }
  
  // Debug logging
  console.log('Profile data received:', { profile, clubs, safeClubs })
  console.log('Club display info:', {
    safeClubs: safeClubs.map(c => c.name),
    betaClubFromClubs: safeClubs.some(club => club.name === 'Beta Club'),
    nthsFromClubs: safeClubs.some(club => club.name === 'NTHS'),
    betaClubFromProfile: safeProfile.beta_club,
    nthsFromProfile: safeProfile.nths
  })
  
  // Additional safety checks
  if (!safeProfile.id || !safeProfile.full_name || !safeProfile.email) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Profile Data</h2>
            <p className="text-gray-600 mb-4">The profile data is missing required information.</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  try {
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
                <Link href="/student/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <Link href="/" className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" priority />
                  <div>
                    <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                    <p className="text-xs text-gray-600">Profile</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{safeProfile.full_name}</span>
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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Your Profile
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Student <span className="text-gradient">Profile</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              View your volunteer history, achievements, and progress towards your {safeStats.goalHours}-hour community service goal.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{safeProfile.full_name}</h2>
                    <p className="text-gray-600">{safeProfile.email}</p>
                    <Badge className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Student Volunteer
                    </Badge>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{safeProfile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Student ID</p>
                        <p className="text-sm text-gray-600">{safeProfile.student_id || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Account Status</p>
                        <p className="text-sm text-green-600">Verified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {new Date(safeProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Club Memberships</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {/* Show clubs from student_clubs table */}
                          {safeClubs && safeClubs.length > 0 ? (
                            safeClubs.map((club) => (
                              <Badge key={club.id} className="bg-purple-100 text-purple-800 text-xs">
                                {club.name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No clubs selected yet</p>
                          )}
                        </div>
                        {/* Debug info for development */}
                        {process.env.NODE_ENV === 'development' && (
                          <p className="text-xs text-gray-400 mt-1">
                            Clubs: {safeClubs.map(c => c.name).join(', ') || 'None'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Button 
                      className="btn-primary w-full"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline"
                      className="btn-secondary w-full"
                      onClick={() => setIsClubModalOpen(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Update Clubs
                    </Button>
                    <Button 
                      variant="outline"
                      className="btn-secondary w-full"
                      onClick={handleShareProfile}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats and Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gradient">{safeStats.totalHours}</p>
                    <p className="text-xs text-gray-600">Total Hours</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gradient">{safeStats.opportunities}</p>
                    <p className="text-xs text-gray-600">Opportunities</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gradient">{safeStats.achievements}</p>
                    <p className="text-xs text-gray-600">Achievements</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-red-600">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gradient">{safeStats.goalProgress}%</p>
                    <p className="text-xs text-gray-600">Goal Progress</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Section */}
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gradient">Hours Goal Progress</CardTitle>
                  <CardDescription>Track your progress towards your {safeStats.goalHours}-hour community service goal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Progress</span>
                    <span className="font-medium">{safeStats.totalHours}/{safeStats.goalHours} hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${safeStats.goalProgress}%` }}
                      transition={{ duration: 1, delay: 1 }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.max(0, safeStats.goalHours - safeStats.totalHours)} hours remaining to reach your goal
                  </p>
                  {safeStats.pendingHours > 0 && (
                    <p className="text-sm text-blue-600">
                      {safeStats.pendingHours} hours pending approval
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gradient">Achievements</CardTitle>
                  <CardDescription>Celebrate your milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeAchievements && safeAchievements.length > 0 ? (
                      safeAchievements.map((achievement, index) => (
                        <div 
                          key={achievement.id}
                          className={`flex items-center gap-4 p-4 rounded-lg bg-white/50 ${
                            !achievement.earned ? 'opacity-50' : ''
                          }`}
                        >
                          <div className={`rounded-full p-3 ${
                            achievement.earned 
                              ? 'bg-purple-100' 
                              : 'bg-gray-100'
                          }`}>
                            <Award className={`h-6 w-6 ${
                              achievement.earned 
                                ? 'text-purple-600' 
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.earned ? (
                              <p className="text-xs text-gray-500 mt-1">
                                Earned {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'recently'}
                              </p>
                            ) : achievement.progress !== undefined && achievement.target !== undefined ? (
                              <p className="text-xs text-gray-500 mt-1">
                                {achievement.progress}/{achievement.target} hours completed
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">In progress</p>
                            )}
                          </div>
                          <Badge className={
                            achievement.earned 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-600'
                          }>
                            {achievement.earned ? 'Achieved' : 'In Progress'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No achievements yet. Start volunteering to earn your first badge!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={safeProfile}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* Club Selection Modal */}
        <ClubSelectionModal
          isOpen={isClubModalOpen}
          onClose={() => setIsClubModalOpen(false)}
          onComplete={handleClubModalComplete}
          userRole="student"
          initialClubs={{
            beta_club: safeClubs.some(club => club.name === 'Beta Club'),
            nths: safeClubs.some(club => club.name === 'NTHS')
          }}
        />
      </div>
    )
  } catch (error) {
    console.error('Error rendering profile:', error)
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Render Error</h2>
            <p className="text-gray-600 mb-4">An error occurred while rendering the profile.</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
