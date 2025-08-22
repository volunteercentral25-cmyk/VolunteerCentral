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
  Clock,
  Search,
  ArrowLeft,
  User,
  LogOut,
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
  X
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

export default function AdminHours() {
  const [user, setUser] = useState<any>(null)
  const [hoursData, setHoursData] = useState<HoursData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    } catch (error) {
      console.error('Error loading hours:', error)
      setError('Failed to load hours')
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
      status: hour.status === 'pending' ? 'approved' : hour.status,
      notes: hour.verification_notes || ''
    })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedHour) return
    
    setReviewing(true)
    try {
      const response = await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hoursId: selectedHour.id,
          status: reviewData.status,
          notes: reviewData.notes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update hours')
      }

      setShowReviewModal(false)
      setSelectedHour(null)
      await loadHours()
    } catch (error) {
      console.error('Error updating hours:', error)
      setError('Failed to update hours')
    } finally {
      setReviewing(false)
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hours</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadHours} className="btn-primary">
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
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/images/cata-logo.png" alt="CATA Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">volunteer</p>
                  <p className="text-xs text-gray-600">Hours Approval</p>
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
          <Badge className="mb-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
            Hours Approval
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Review <span className="text-gradient">Volunteer Hours</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review and approve volunteer hours submitted by students. Ensure accuracy and maintain the integrity of the volunteer tracking system.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search hours..."
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
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{hoursData?.pagination.total || 0} hours</span>
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
        >
          <div className="grid gap-6">
            {hoursData?.hours.length ? (
              hoursData.hours.map((hour) => (
                <Card key={hour.id} className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          hour.status === 'approved' ? 'bg-green-100' :
                          hour.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {hour.status === 'approved' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : hour.status === 'pending' ? (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{hour.activity}</h3>
                            <Badge className={
                              hour.status === 'approved' ? 'bg-green-100 text-green-800' :
                              hour.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {hour.status}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{hour.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {hour.profiles.full_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {hour.profiles.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {hour.hours} hours
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(hour.date).toLocaleDateString()}
                            </span>
                            {hour.location !== 'N/A' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {hour.location}
                              </span>
                            )}
                          </div>

                          {hour.verification_email && (
                            <div className="text-sm text-gray-500 mb-2">
                              <span className="font-medium">Verification Email:</span> {hour.verification_email}
                            </div>
                          )}

                          {hour.verified_by && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Reviewed by:</span> {hour.verified_by} on {new Date(hour.verification_date!).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="btn-secondary"
                          onClick={() => handleReviewHour(hour)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hours found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {hoursData && hoursData.pagination.totalPages > 1 && (
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
              {Array.from({ length: hoursData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(Math.min(hoursData.pagination.totalPages, currentPage + 1))}
              disabled={currentPage === hoursData.pagination.totalPages}
              className="btn-secondary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedHour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <CardHeader>
              <CardTitle>Review Hours</CardTitle>
              <CardDescription>Review and approve/deny volunteer hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={reviewData.status}
                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="approved">Approve</option>
                  <option value="denied">Deny</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                  placeholder="Add any notes about this review..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmitReview}
                  className="btn-primary"
                  disabled={reviewing}
                >
                  {reviewing ? 'Updating...' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary"
                  disabled={reviewing}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </motion.div>
        </div>
      )}
    </div>
  )
}
