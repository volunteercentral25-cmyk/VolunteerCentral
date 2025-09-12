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
import { Input } from '@/components/ui/input'
import { 
  Clock,
  Calendar,
  User,
  LogOut,
  ArrowLeft,
  Search,
  MapPin,
  Users,
  Heart,
  Star,
  Filter,
  Activity,
  CheckCircle
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  organization: string
  description: string
  location: string
  date: string
  time: string
  duration: number
  volunteersNeeded: number
  volunteersRegistered: number
  category: string
  difficulty: string
  featured: boolean
  isRegistered: boolean
  isFull: boolean
  requirements?: string
  club_restriction?: string
}

export default function StudentOpportunities() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedClub, setSelectedClub] = useState('all')
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [userClubs, setUserClubs] = useState({ beta_club: false, nths: false })
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchOpportunities()
      } else {
        router.push('/')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  useEffect(() => {
    if (user) {
      fetchOpportunities()
    }
  }, [selectedClub])

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedClub !== 'all') {
        params.append('club', selectedClub)
      }
      
      const response = await fetch(`/api/student/opportunities?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }
      const data = await response.json()
      setOpportunities(data.opportunities)
      setUserClubs(data.userClubs || { beta_club: false, nths: false })
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      setError('Failed to load opportunities')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleRegister = async (opportunityId: string) => {
    setRegistering(opportunityId)
    
    try {
      const response = await fetch('/api/student/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register')
      }

      // Update local state to reflect registration
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { 
              ...opp, 
              isRegistered: true,
              volunteersRegistered: opp.volunteersRegistered + 1,
              isFull: opp.volunteersRegistered + 1 >= opp.volunteersNeeded
            }
          : opp
      ))
    } catch (error) {
      console.error('Error registering for opportunity:', error)
      setError(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setRegistering(null)
    }
  }

  const canRegisterForOpportunity = (opportunity: Opportunity) => {
    // Check if student meets club requirements
    if (opportunity.club_restriction && opportunity.club_restriction !== 'anyone') {
      if (opportunity.club_restriction === 'beta_club') {
        return userClubs.beta_club
      } else if (opportunity.club_restriction === 'nths') {
        return userClubs.nths
      } else if (opportunity.club_restriction === 'both') {
        return userClubs.beta_club && userClubs.nths
      }
    }
    return true
  }

  const getRestrictionMessage = (restriction: string) => {
    switch (restriction) {
      case 'beta_club':
        return 'Beta Club members only'
      case 'nths':
        return 'NTHS members only'
      case 'both':
        return 'Both Beta Club and NTHS members only'
      default:
        return 'Open to all students'
    }
  }

  const handleLeave = async (opportunityId: string) => {
    setLeaving(opportunityId)
    
    try {
      const response = await fetch('/api/student/opportunities', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to leave opportunity')
      }

      // Update local state to reflect leaving
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { 
              ...opp, 
              isRegistered: false,
              volunteersRegistered: Math.max(0, opp.volunteersRegistered - 1),
              isFull: Math.max(0, opp.volunteersRegistered - 1) >= opp.volunteersNeeded
            }
          : opp
      ))
    } catch (error) {
      console.error('Error leaving opportunity:', error)
      setError(error instanceof Error ? error.message : 'Failed to leave opportunity')
    } finally {
      setLeaving(null)
    }
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: 'Environment' },
    { value: 'hunger', label: 'Hunger Relief' },
    { value: 'education', label: 'Education' },
    { value: 'elderly', label: 'Elderly Care' },
    { value: 'animals', label: 'Animal Care' }
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      environment: 'bg-green-100 text-green-800',
      hunger: 'bg-orange-100 text-orange-800',
      education: 'bg-blue-100 text-blue-800',
      elderly: 'bg-purple-100 text-purple-800',
      animals: 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getClubRestrictionText = (restriction: string) => {
    switch (restriction) {
      case 'beta_club':
        return 'Beta Club Only'
      case 'nths':
        return 'NTHS Only'
      case 'both':
        return 'Both Clubs Only'
      default:
        return 'Open to All'
    }
  }

  const getClubRestrictionColor = (restriction: string) => {
    switch (restriction) {
      case 'beta_club':
        return 'bg-blue-100 text-blue-800'
      case 'nths':
        return 'bg-green-100 text-green-800'
      case 'both':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (error && opportunities.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Opportunities</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchOpportunities} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg overflow-hidden overflow-x-hidden w-full max-w-full">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-0 h-64 w-64 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
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
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Opportunities</p>
                </div>
              </Link>
            </div>
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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Discover Opportunities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Volunteer <span className="text-gradient">Opportunities</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find meaningful ways to give back to your community. Browse opportunities that match your interests and schedule.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-focus-effect"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="glass-effect border-0 shadow-xl card-hover-effect h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {opportunity.featured && (
                              <>
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                  Featured
                                </Badge>
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              </>
                            )}
                            <Badge className={getCategoryColor(opportunity.category)}>
                              {opportunity.category}
                            </Badge>
                            <Badge className={getClubRestrictionColor(opportunity.club_restriction || 'anyone')}>
                              {getClubRestrictionText(opportunity.club_restriction || 'anyone')}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                          <CardDescription className="text-sm font-medium text-purple-600">
                            {opportunity.organization}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">{opportunity.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{opportunity.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{opportunity.time} ({opportunity.duration} hours)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{opportunity.volunteersRegistered}/{opportunity.volunteersNeeded} volunteers</span>
                        </div>
                      </div>

                      {/* Requirements Section */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Comfortable clothing and closed-toe shoes</li>
                          <li>• Bring water and snacks</li>
                          <li>• Arrive 10 minutes early</li>
                          <li>• Complete safety orientation</li>
                          {opportunity.requirements && (
                            <li>• {opportunity.requirements}</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge className={getDifficultyColor(opportunity.difficulty)}>
                          {opportunity.difficulty}
                        </Badge>
                        
                        {/* Show restriction message if applicable */}
                        {opportunity.club_restriction && opportunity.club_restriction !== 'anyone' && (
                          <div className="text-xs text-gray-500 text-center mb-2">
                            {getRestrictionMessage(opportunity.club_restriction)}
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => opportunity.isRegistered ? handleLeave(opportunity.id) : handleRegister(opportunity.id)}
                          className={opportunity.isRegistered ? "btn-secondary" : "btn-primary"}
                          disabled={
                            opportunity.isFull && !opportunity.isRegistered || 
                            registering === opportunity.id || 
                            leaving === opportunity.id ||
                            !canRegisterForOpportunity(opportunity)
                          }
                        >
                          {registering === opportunity.id || leaving === opportunity.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              {leaving === opportunity.id ? 'Leaving...' : 'Registering...'}
                            </>
                          ) : opportunity.isRegistered ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Leave
                            </>
                          ) : opportunity.isFull ? (
                            'Full'
                          ) : !canRegisterForOpportunity(opportunity) ? (
                            'Not Eligible'
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Register
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass-effect border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters to find more opportunities.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  )
}
