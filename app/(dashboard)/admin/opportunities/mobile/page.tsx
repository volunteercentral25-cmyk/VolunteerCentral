'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MobileAdminLayout from '@/components/layout/mobile-admin-layout'
import { 
  Calendar,
  Search,
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
  X,
  Save
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

export default function MobileAdminOpportunities() {
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
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
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
      setError(null)
    } catch (error) {
      console.error('Error loading opportunities:', error)
      setError('Failed to load opportunities')
    } finally {
      setLoading(false)
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

  const handleCreateOpportunity = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/admin/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create opportunity')
      }

      // Reset form and reload opportunities
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

  const handleViewRegistrations = async (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowRegistrations(true)
    await fetchRegistrations(opportunity.id)
  }

  const fetchRegistrations = async (opportunityId: string) => {
    try {
      setLoadingRegistrations(true)
      const response = await fetch(`/api/admin/opportunities/${opportunityId}/registrations`)
      
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations || [])
      } else {
        console.error('Failed to fetch registrations')
        setRegistrations([])
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const handleManageRegistration = async (registrationId: string, status: string) => {
    try {
      setManagingRegistration(registrationId)
      const response = await fetch(`/api/admin/opportunities/${selectedOpportunity?.id}/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          status
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update registration')
      }

      // Reload registrations
      await fetchRegistrations(selectedOpportunity!.id)
    } catch (error) {
      console.error('Error updating registration:', error)
      setError('Failed to update registration')
    } finally {
      setManagingRegistration(null)
    }
  }

  if (loading && !opportunitiesData) {
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

  if (error && !opportunitiesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Opportunities</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={loadOpportunities} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MobileAdminLayout
      currentPage="opportunities"
      pageTitle="Manage Opportunities"
      pageDescription="Create, edit, and manage volunteer opportunities for students."
      onSignOut={handleSignOut}
      userName="Admin"
    >
      {/* Create Opportunity Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mb-6"
      >
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Opportunity
        </Button>
      </motion.div>

      {/* Search and Filters - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="full">Full</option>
                </select>
                
                <select
                  value={clubFilter}
                  onChange={(e) => handleClubFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">All Clubs</option>
                  <option value="beta_club">Beta Club</option>
                  <option value="nths">NTHS</option>
                  <option value="anyone">Anyone</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{opportunitiesData?.pagination.total || 0} opportunities</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Opportunities List - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4"
      >
        {opportunitiesData?.opportunities.length ? (
          opportunitiesData.opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Opportunity Header */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-base">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{opportunity.description}</p>
                  </div>
                  
                  {/* Opportunity Details */}
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
                      <span>{opportunity.start_time} - {opportunity.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.totalRegistrations}/{opportunity.max_volunteers} volunteers</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {opportunity.isPast && (
                      <Badge className="bg-gray-100 text-gray-800 text-xs">Past</Badge>
                    )}
                    {opportunity.isFull && (
                      <Badge className="bg-red-100 text-red-800 text-xs">Full</Badge>
                    )}
                    {opportunity.club_restriction && opportunity.club_restriction !== 'anyone' && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">{opportunity.club_restriction}</Badge>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewRegistrations(opportunity)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View ({opportunity.totalRegistrations})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your search or filters, or create a new opportunity.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Pagination - Mobile Optimized */}
      {opportunitiesData && opportunitiesData.pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: opportunitiesData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                size="sm"
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(opportunitiesData.pagination.totalPages, currentPage + 1))}
            disabled={currentPage === opportunitiesData.pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Create Opportunity Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Opportunity
            </DialogTitle>
            <DialogDescription>
              Create a new volunteer opportunity for students
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter opportunity title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter opportunity description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max_volunteers">Max Volunteers</Label>
                <Input
                  id="max_volunteers"
                  type="number"
                  value={formData.max_volunteers}
                  onChange={(e) => setFormData({ ...formData, max_volunteers: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            
            <div>
              <Label htmlFor="club_restriction">Club Restriction</Label>
              <select
                id="club_restriction"
                value={formData.club_restriction}
                onChange={(e) => setFormData({ ...formData, club_restriction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="anyone">Anyone</option>
                <option value="beta_club">Beta Club Only</option>
                <option value="nths">NTHS Only</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateOpportunity}
                disabled={creating}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Registrations Modal */}
      <Dialog open={showRegistrations} onOpenChange={setShowRegistrations}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registrations
            </DialogTitle>
            <DialogDescription>
              View and manage registrations for {selectedOpportunity?.title}
            </DialogDescription>
          </DialogHeader>
          
          {loadingRegistrations ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"
              />
            </div>
          ) : registrations.length > 0 ? (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <div key={registration.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{registration.student_name}</p>
                      <p className="text-xs text-gray-600">{registration.student_email}</p>
                    </div>
                    <Badge className={
                      registration.status === 'confirmed' ? 'bg-green-100 text-green-800 text-xs' :
                      registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                      'bg-red-100 text-red-800 text-xs'
                    }>
                      {registration.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {registration.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleManageRegistration(registration.id, 'confirmed')}
                          disabled={managingRegistration === registration.id}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleManageRegistration(registration.id, 'rejected')}
                          disabled={managingRegistration === registration.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No registrations found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileAdminLayout>
  )
}
