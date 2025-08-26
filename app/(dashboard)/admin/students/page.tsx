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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users,
  Search,
  ArrowLeft,
  User,
  LogOut,
  Mail,
  Calendar,
  Award,
  Clock,
  Edit,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Phone,
  MapPin,
  Save,
  X,
  Clock as ClockIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Student {
  id: string
  full_name: string
  email: string
  student_id: string
  phone?: string
  bio?: string
  role: string
  status: string
  created_at: string
  totalHours: number
  approvedHours: number
  pendingHours: number
  totalRegistrations: number
  activeRegistrations: number
}

interface VolunteerHistory {
  id: string
  hours: number
  description: string
  status: string
  created_at: string
  verification_email?: string
  verified_by?: string
  verification_date?: string
  verification_notes?: string
}

interface StudentsData {
  students: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminStudents() {
  const [user, setUser] = useState<any>(null)
  const [studentsData, setStudentsData] = useState<StudentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clubFilter, setClubFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [volunteerHistory, setVolunteerHistory] = useState<VolunteerHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    student_id: '',
    phone: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadStudents()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  useEffect(() => {
    loadStudents()
  }, [currentPage, search, statusFilter, clubFilter])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (clubFilter) params.append('club', clubFilter)

      console.log('Loading students with params:', params.toString())
      const response = await fetch(`/api/admin/students?${params}`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load students')
      }
      const data = await response.json()
      console.log('Students data received:', data)
      setStudentsData(data)
      setError(null)
    } catch (error) {
      console.error('Error loading students:', error)
      setError('Failed to load students')
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setViewModalOpen(true)
    fetchVolunteerHistory(student.id)
  }

  const fetchVolunteerHistory = async (studentId: string) => {
    try {
      setLoadingHistory(true)
      console.log('Fetching volunteer history for student:', studentId)
      const response = await fetch(`/api/admin/students/${studentId}/history`)
      console.log('History response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Volunteer history data received:', data)
        setVolunteerHistory(data.history || [])
      } else {
        console.error('Failed to fetch volunteer history')
        setVolunteerHistory([])
      }
    } catch (error) {
      console.error('Error fetching volunteer history:', error)
      setVolunteerHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setEditForm({
      full_name: student.full_name,
      email: student.email,
      student_id: student.student_id,
      phone: student.phone || '',
      bio: student.bio || ''
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStudent) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          updates: editForm
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update student')
      }

      // Reload students to get updated data
      await loadStudents()
      setEditModalOpen(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error updating student:', error)
      setError('Failed to update student')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !studentsData) {
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

  if (error && !studentsData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Students</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadStudents} className="btn-primary">
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
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" priority />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Student Management</p>
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
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Student Management
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Manage <span className="text-gradient">Students</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View and manage student accounts, track their volunteer activities, and monitor their progress.
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
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name, email, or ID..."
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
                    <option value="">All Students</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                  <Users className="h-4 w-4" />
                  <span>{studentsData?.pagination.total || 0} students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid gap-6">
            {studentsData?.students.length ? (
              studentsData.students.map((student) => (
                <Card key={student.id} className="glass-effect border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
                            <Badge className={
                              student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }>
                              {student.status}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{student.email}</span>
                              </div>
                              {student.student_id && (
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  <span>Student ID: {student.student_id}</span>
                                </div>
                              )}
                              {student.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{student.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Joined {new Date(student.created_at).toLocaleDateString()}</span>
                              </div>
                              {student.bio && (
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  <span className="text-xs">{student.bio}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-lg font-bold text-purple-600">{student.approvedHours}</p>
                              <p className="text-xs text-gray-500">Approved Hours</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-orange-600">{student.pendingHours}</p>
                              <p className="text-xs text-gray-500">Pending Hours</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{student.totalRegistrations}</p>
                              <p className="text-xs text-gray-500">Total Registrations</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-600">{student.activeRegistrations}</p>
                              <p className="text-xs text-gray-500">Active Registrations</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="btn-secondary"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="btn-secondary"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {studentsData && studentsData.pagination.totalPages > 1 && (
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
              {Array.from({ length: studentsData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(Math.min(studentsData.pagination.totalPages, currentPage + 1))}
              disabled={currentPage === studentsData.pagination.totalPages}
              className="btn-secondary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* View Student Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => setViewModalOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="text-lg font-semibold">{selectedStudent.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Student ID</Label>
                    <p className="text-gray-900">{selectedStudent.student_id}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    <p className="text-gray-900">{selectedStudent.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Join Date</Label>
                    <p className="text-gray-900">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge className={
                      selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedStudent.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <p className="text-gray-900 mt-1">{selectedStudent.bio}</p>
                </div>
              )}

              {/* Volunteer Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Volunteer Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <p className="text-xl font-bold text-purple-600">{selectedStudent.approvedHours}</p>
                    </div>
                    <p className="text-xs text-gray-500">Approved Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ClockIcon className="h-5 w-5 text-orange-600" />
                      <p className="text-xl font-bold text-orange-600">{selectedStudent.pendingHours}</p>
                    </div>
                    <p className="text-xs text-gray-500">Pending Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-5 w-5 text-green-600" />
                      <p className="text-xl font-bold text-green-600">{selectedStudent.totalRegistrations}</p>
                    </div>
                    <p className="text-xs text-gray-500">Total Registrations</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <p className="text-xl font-bold text-blue-600">{selectedStudent.activeRegistrations}</p>
                    </div>
                    <p className="text-xs text-gray-500">Active Registrations</p>
                  </div>
                </div>
              </div>

              {/* Volunteer History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Volunteer History</h3>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"
                    />
                  </div>
                ) : volunteerHistory.length > 0 ? (
                  <div className="space-y-3">
                    {volunteerHistory.map((entry) => (
                      <div key={entry.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                entry.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {entry.status}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {entry.hours} hours
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{entry.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                              {entry.verification_email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {entry.verification_email}
                                </span>
                              )}
                            </div>
                            {entry.verification_notes && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                                <strong>Notes:</strong> {entry.verification_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No volunteer history found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update information for {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={editForm.student_id}
                    onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })}
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Enter bio or description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
