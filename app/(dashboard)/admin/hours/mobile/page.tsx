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
  Clock,
  Search,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  MapPin,
  Mail,
  X,
  Save,
  User
} from 'lucide-react'

interface HourEntry {
  id: string
  activity: string
  hours: number
  date: string
  description: string
  status: string
  location: string
  verification_email?: string
  verified_by?: string
  verification_date?: string
  verification_notes?: string
  created_at: string
  profiles: {
    full_name: string
    email: string
    student_id: string
  }
}

interface HoursData {
  hours: HourEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function MobileAdminHours() {
  const [user, setUser] = useState<any>(null)
  const [hoursData, setHoursData] = useState<HoursData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedHour, setSelectedHour] = useState<HourEntry | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    notes: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadHours()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  useEffect(() => {
    loadHours()
  }, [currentPage, search, statusFilter])

  const loadHours = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/hours?${params}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load hours')
      }
      const data = await response.json()
      setHoursData(data)
      setError(null)
    } catch (error) {
      console.error('Error loading hours:', error)
      setError('Failed to load hours')
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

  const handleReviewHour = (hour: HourEntry) => {
    setSelectedHour(hour)
    setReviewData({
      status: hour.status,
      notes: hour.verification_notes || ''
    })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedHour) return

    try {
      setReviewing(true)
      const response = await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hoursId: selectedHour.id,
          status: reviewData.status,
          notes: reviewData.notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update hour entry')
      }

      // Reload hours to get updated data
      await loadHours()
      setShowReviewModal(false)
      setSelectedHour(null)
      setSuccessMessage('Hour entry updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error updating hour entry:', error)
      setError('Failed to update hour entry')
    } finally {
      setReviewing(false)
    }
  }

  if (loading && !hoursData) {
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

  if (error && !hoursData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hours</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={loadHours} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MobileAdminLayout
      currentPage="hours"
      pageTitle="Review Hours"
      pageDescription="Review and approve pending volunteer hours submitted by students."
      onSignOut={handleSignOut}
      userName="Admin"
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg"
        >
          <p className="text-green-800 text-sm text-center">{successMessage}</p>
        </motion.div>
      )}

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
                  placeholder="Search by student name or activity..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{hoursData?.pagination.total || 0} hour entries</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hours List - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4"
      >
        {hoursData?.hours.length ? (
          hoursData.hours.map((hour) => (
            <Card key={hour.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base">{hour.profiles.full_name}</h3>
                      <p className="text-sm text-gray-600 truncate">{hour.profiles.email}</p>
                    </div>
                    <Badge className={
                      hour.status === 'approved' ? 'bg-green-100 text-green-800 text-xs' :
                      hour.status === 'pending' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                      'bg-red-100 text-red-800 text-xs'
                    }>
                      {hour.status}
                    </Badge>
                  </div>
                  
                  {/* Activity Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-gray-900">{hour.activity}</span>
                    </div>
                    <p className="text-sm text-gray-600">{hour.description}</p>
                  </div>
                  
                  {/* Time and Location */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(hour.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{hour.hours} hours</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{hour.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-xs">{hour.verification_email || 'No verification'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  {hour.verification_notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>Notes:</strong> {hour.verification_notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    {hour.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleReviewHour(hour)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </>
                    )}
                    {hour.status !== 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleReviewHour(hour)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hour entries found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Pagination - Mobile Optimized */}
      {hoursData && hoursData.pagination.totalPages > 1 && (
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
            {Array.from({ length: hoursData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
            onClick={() => setCurrentPage(Math.min(hoursData.pagination.totalPages, currentPage + 1))}
            disabled={currentPage === hoursData.pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Review Hour Entry
            </DialogTitle>
            <DialogDescription>
              Review and update the status for {selectedHour?.profiles.full_name}'s hour entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedHour && (
            <div className="space-y-4">
              {/* Entry Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Student:</span>
                    <span>{selectedHour.profiles.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Activity:</span>
                    <span>{selectedHour.activity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hours:</span>
                    <span>{selectedHour.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedHour.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                  placeholder="Add any notes about this review..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewing}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={reviewing}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {reviewing ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileAdminLayout>
  )
}
