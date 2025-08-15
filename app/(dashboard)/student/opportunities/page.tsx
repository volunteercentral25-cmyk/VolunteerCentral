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
  Filter
} from 'lucide-react'

export default function StudentOpportunities() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: 'Community Garden Cleanup',
      organization: 'Green Thumb Initiative',
      description: 'Help maintain and beautify our community garden. Tasks include weeding, planting, and general maintenance.',
      location: 'Central Park Community Garden',
      date: '2024-02-15',
      time: '9:00 AM - 12:00 PM',
      duration: 3,
      volunteersNeeded: 8,
      volunteersRegistered: 5,
      category: 'environment',
      difficulty: 'easy',
      featured: true
    },
    {
      id: 2,
      title: 'Food Bank Volunteer',
      organization: 'Community Food Bank',
      description: 'Assist with sorting, packaging, and distributing food to families in need. Great opportunity to help combat food insecurity.',
      location: 'Downtown Food Bank',
      date: '2024-02-20',
      time: '10:00 AM - 2:00 PM',
      duration: 4,
      volunteersNeeded: 12,
      volunteersRegistered: 8,
      category: 'hunger',
      difficulty: 'medium',
      featured: false
    },
    {
      id: 3,
      title: 'Library Reading Program',
      organization: 'Public Library',
      description: 'Read books to children and help foster a love of reading. Perfect for students who enjoy working with kids.',
      location: 'Central Public Library',
      date: '2024-02-18',
      time: '3:00 PM - 5:00 PM',
      duration: 2,
      volunteersNeeded: 6,
      volunteersRegistered: 4,
      category: 'education',
      difficulty: 'easy',
      featured: true
    },
    {
      id: 4,
      title: 'Senior Center Activities',
      organization: 'Golden Years Center',
      description: 'Lead activities and provide companionship for senior citizens. Activities include games, crafts, and conversation.',
      location: 'Golden Years Senior Center',
      date: '2024-02-22',
      time: '1:00 PM - 4:00 PM',
      duration: 3,
      volunteersNeeded: 10,
      volunteersRegistered: 7,
      category: 'elderly',
      difficulty: 'medium',
      featured: false
    },
    {
      id: 5,
      title: 'Animal Shelter Helper',
      organization: 'Paws & Hearts Shelter',
      description: 'Help care for animals at the local shelter. Tasks include feeding, cleaning, and socializing with animals.',
      location: 'Paws & Hearts Animal Shelter',
      date: '2024-02-25',
      time: '9:00 AM - 1:00 PM',
      duration: 4,
      volunteersNeeded: 8,
      volunteersRegistered: 3,
      category: 'animals',
      difficulty: 'easy',
      featured: false
    },
    {
      id: 6,
      title: 'Beach Cleanup',
      organization: 'Ocean Conservation Group',
      description: 'Help clean up our local beaches and protect marine life. All equipment provided.',
      location: 'Sunset Beach',
      date: '2024-02-28',
      time: '8:00 AM - 11:00 AM',
      duration: 3,
      volunteersNeeded: 15,
      volunteersRegistered: 12,
      category: 'environment',
      difficulty: 'easy',
      featured: true
    }
  ])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
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

  const handleRegister = (opportunityId: number) => {
    // In a real app, this would make an API call to register
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunityId 
        ? { ...opp, volunteersRegistered: opp.volunteersRegistered + 1 }
        : opp
    ))
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
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/images/cata-logo.png" alt="CATA Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">CATA Volunteer</p>
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

        {/* Featured Opportunities */}
        {filteredOpportunities.filter(opp => opp.featured).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Featured Opportunities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.filter(opp => opp.featured).map((opportunity) => (
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
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              Featured
                            </Badge>
                            <Badge className={getCategoryColor(opportunity.category)}>
                              {opportunity.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                          <CardDescription className="text-sm font-medium text-purple-600">
                            {opportunity.organization}
                          </CardDescription>
                        </div>
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
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

                      <div className="flex items-center justify-between pt-2">
                        <Badge className={getDifficultyColor(opportunity.difficulty)}>
                          {opportunity.difficulty}
                        </Badge>
                        <Button 
                          onClick={() => handleRegister(opportunity.id)}
                          className="btn-primary"
                          disabled={opportunity.volunteersRegistered >= opportunity.volunteersNeeded}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {opportunity.volunteersRegistered >= opportunity.volunteersNeeded ? 'Full' : 'Register'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {filteredOpportunities.filter(opp => !opp.featured).length > 0 ? 'All Opportunities' : 'No Opportunities Found'}
          </h2>
          {filteredOpportunities.filter(opp => !opp.featured).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.filter(opp => !opp.featured).map((opportunity) => (
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
                          <Badge className={`mb-2 ${getCategoryColor(opportunity.category)}`}>
                            {opportunity.category}
                          </Badge>
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

                      <div className="flex items-center justify-between pt-2">
                        <Badge className={getDifficultyColor(opportunity.difficulty)}>
                          {opportunity.difficulty}
                        </Badge>
                        <Button 
                          onClick={() => handleRegister(opportunity.id)}
                          className="btn-primary"
                          disabled={opportunity.volunteersRegistered >= opportunity.volunteersNeeded}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {opportunity.volunteersRegistered >= opportunity.volunteersNeeded ? 'Full' : 'Register'}
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
