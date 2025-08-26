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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar,
  Search,
  ArrowLeft,
  User,
  LogOut,
  MapPin,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Star,
  X
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  location: string
  date: string
  start_time: string
  end_time: string
  max_volunteers: number
  created_at: string
  totalRegistrations: number
  pendingRegistrations: number
  confirmedRegistrations: number
  isFull: boolean
  isPast: boolean
  club_restriction?: string
}

interface Registration {
  id: string
  student_id: string
  status: string
  registered_at: string
  student_name: string
  student_email: string
  opportunity_title: string
}

interface OpportunitiesData {
  opportunities: Opportunity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminOpportunities() {
  const [user, setUser] = useState<any>(null)
  const [opportunitiesData, setOpportunitiesData] = useState<OpportunitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clubFilter, setClubFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    max_volunteers: 10,
    requirements: '',
    club_restriction: 'anyone'
  })
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [managingRegistration, setManagingRegistration] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadOpportunities()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  useEffect(() => {
    loadOpportunities()
  }, [currentPage, search, statusFilter, clubFilter])

  const loadOpportunities = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (clubFilter) params.append('club', clubFilter)

      const response = await fetch(`/api/admin/opportunities?${params}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load opportunities')
      }
      const data = await response.json()
      setOpportunitiesData(data)
    } catch (error) {
      console.error('Error loading opportunities:', error)
      setError('Failed to load opportunities')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleClubFilter = (value: string) => {
    setClubFilter(value)
    setCurrentPage(1)
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

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/admin/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create opportunity')
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        start_time: '',
        end_time: '',
        max_volunteers: 10,
        requirements: '',
        club_restriction: 'anyone'
      })
      setShowCreateForm(false)
      await loadOpportunities()
    } catch (error) {
      console.error('Error creating opportunity:', error)
      setError('Failed to create opportunity')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return

    try {
      const response = await fetch('/api/admin/opportunities', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete opportunity')
      }

      await loadOpportunities()
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      setError('Failed to delete opportunity')
    }
  }

  const handleViewRegistrations = async (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowRegistrations(true)
    await loadRegistrations(opportunity.id)
  }

  const loadRegistrations = async (opportunityId: string) => {
    try {
      setLoadingRegistrations(true)
      console.log('Loading registrations for opportunity:', opportunityId)
      const response = await fetch(`/api/admin/opportunities/${opportunityId}/registrations`)
      
      if (!response.ok) {
        throw new Error('Failed to load registrations')
      }
      
      const data = await response.json()
      console.log('Registrations data received:', data)
      console.log('Registrations array:', data.registrations)
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error('Error loading registrations:', error)
      setError('Failed to load registrations')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const handleManageRegistration = async (registrationId: string, action: 'approve' | 'decline' | 'kick') => {
    if (!selectedOpportunity) return

    // Add confirmation for kick action
    if (action === 'kick') {
      if (!confirm('Are you sure you want to remove this student from the opportunity? This action cannot be undone.')) {
        return
      }
    }

    try {
      setManagingRegistration(registrationId)
      console.log(`Frontend - ${action}ing registration:`, registrationId)
      
      const response = await fetch(`/api/admin/opportunities/${selectedOpportunity.id}/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationId, action }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${action} registration`)
      }

      const result = await response.json()
      console.log(`Frontend - ${action} result:`, result)

             // Clear registrations state and reload with a small delay to ensure database updates
       setRegistrations([])
       await new Promise(resolve => setTimeout(resolve, 500))
       await loadRegistrations(selectedOpportunity.id)
       await loadOpportunities()
      
      // Show success message
      console.log(`Successfully ${action}ed registration`)
      setSuccessMessage(`Successfully ${action}ed registration`)
      setTimeout(() => setSuccessMessage(null), 3000) // Clear after 3 seconds
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error)
      setError(`Failed to ${action} registration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setManagingRegistration(null)
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
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Opportunities</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOpportunities} className="btn-primary">
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

             {/* Success Message */}
       {successMessage && (
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
         >
           {successMessage}
         </motion.div>
       )}

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
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" priority />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Opportunity Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Admin</span>
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
          <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            Opportunity Management
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Manage <span className="text-gradient">Opportunities</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, edit, and manage volunteer opportunities for students to participate in.
          </p>
        </motion.div>

        {/* Search, Filters, and Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Opportunities</option>
                    <option value="future">Future</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <div>
                  <select
                    value={clubFilter}
                    onChange={(e) => handleClubFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Clubs</option>
                    <option value="beta_club">Beta Club</option>
                    <option value="nths">NTHS</option>
                    <option value="both">Both Clubs</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{opportunitiesData?.pagination.total || 0} opportunities</span>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Opportunity
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Opportunity Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Create New Opportunity</CardTitle>
                <CardDescription>Add a new volunteer opportunity for students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOpportunity} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Community Garden Cleanup"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., Central Park"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the volunteer opportunity..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_volunteers">Max Volunteers</Label>
                      <Input
                        id="max_volunteers"
                        type="number"
                        min="1"
                        value={formData.max_volunteers}
                        onChange={(e) => setFormData({...formData, max_volunteers: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (Optional)</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      placeholder="Any specific requirements for volunteers (e.g., age restrictions, skills needed, equipment required)..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club_restriction">Club Restriction</Label>
                    <select
                      id="club_restriction"
                      value={formData.club_restriction}
                      onChange={(e) => setFormData({...formData, club_restriction: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="anyone">Anyone can participate</option>
                      <option value="beta_club">Beta Club members only</option>
                      <option value="nths">NTHS members only</option>
                      <option value="both">Both Beta Club and NTHS members</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={creating}
                    >
                      {creating ? 'Creating...' : 'Create Opportunity'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary"
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Opportunities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid gap-6">
            {opportunitiesData?.opportunities.length ? (
              opportunitiesData.opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 rounded-full">
                            <Calendar className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                            <p className="text-gray-600 mb-3">{opportunity.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {opportunity.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(opportunity.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {opportunity.start_time} - {opportunity.end_time}
                              </span>
                              <Badge className={getClubRestrictionColor(opportunity.club_restriction || 'anyone')}>
                                {getClubRestrictionText(opportunity.club_restriction || 'anyone')}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-semibold text-green-600">{opportunity.confirmedRegistrations}</p>
                                <p className="text-gray-500">Confirmed</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-orange-600">{opportunity.pendingRegistrations}</p>
                                <p className="text-gray-500">Pending</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-purple-600">{opportunity.max_volunteers}</p>
                                <p className="text-gray-500">Max Capacity</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {/* Status Badges */}
                        <div className="flex flex-col gap-2">
                          {opportunity.isPast && (
                            <Badge className="bg-gray-100 text-gray-800">Past</Badge>
                          )}
                          {opportunity.isFull && (
                            <Badge className="bg-red-100 text-red-800">Full</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="btn-secondary"
                            onClick={() => handleViewRegistrations(opportunity)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            View ({opportunity.totalRegistrations})
                          </Button>
                          <Button variant="outline" size="sm" className="btn-secondary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="btn-secondary text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters, or create a new opportunity.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {opportunitiesData && opportunitiesData.pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: opportunitiesData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "btn-primary" : "btn-secondary"}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(opportunitiesData.pagination.totalPages, currentPage + 1))}
              disabled={currentPage === opportunitiesData.pagination.totalPages}
              className="btn-secondary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </main>

                           {/* Registrations Modal */}
       {showRegistrations && selectedOpportunity && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Registrations for {selectedOpportunity.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedOpportunity.location} • {new Date(selectedOpportunity.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowRegistrations(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {loadingRegistrations ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : registrations.length > 0 ? (
                <div className="space-y-4">

                  {registrations.map((registration) => (
                    <Card key={registration.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                                                         <div className="flex items-center gap-3 mb-2">
                               <h3 className="font-semibold text-gray-900">
                                 {registration.student_name || 'Unknown Student'}
                               </h3>
                               <Badge className={
                                 registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                                 registration.status === 'denied' ? 'bg-red-100 text-red-800' :
                                 'bg-orange-100 text-orange-800'
                               }>
                                 {registration.status}
                               </Badge>
                             </div>
                             <div className="text-sm text-gray-600 space-y-1">
                               <p>Email: {registration.student_email || 'No email available'}</p>
                               <p>Student ID: {registration.student_id || 'No student ID'}</p>
                               <p>Registered: {new Date(registration.registered_at).toLocaleDateString()}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {registration.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="btn-primary"
                                  onClick={() => handleManageRegistration(registration.id, 'approve')}
                                  disabled={managingRegistration === registration.id}
                                >
                                  {managingRegistration === registration.id ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="btn-secondary"
                                  onClick={() => handleManageRegistration(registration.id, 'decline')}
                                  disabled={managingRegistration === registration.id}
                                >
                                  {managingRegistration === registration.id ? 'Declining...' : 'Decline'}
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="btn-secondary text-red-600 hover:text-red-700"
                              onClick={() => handleManageRegistration(registration.id, 'kick')}
                              disabled={managingRegistration === registration.id}
                            >
                              {managingRegistration === registration.id ? 'Removing...' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations yet</h3>
                  <p className="text-gray-600">Students can sign up for this opportunity from their dashboard.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
