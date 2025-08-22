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
  Activity
} from 'lucide-react'

interface Student {
  id: string
  full_name: string
  email: string
  student_id: string
  role: string
  status: string
  created_at: string
  totalHours: number
  approvedHours: number
  pendingHours: number
  totalRegistrations: number
  activeRegistrations: number
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
  const [currentPage, setCurrentPage] = useState(1)
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
  }, [currentPage, search, statusFilter])

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/students?${params}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load students')
      }
      const data = await response.json()
      setStudentsData(data)
    } catch (error) {
      console.error('Error loading students:', error)
      setError('Failed to load students')
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
                <Image src="/images/cata-logo.png" alt="CATA Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">volunteer</p>
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                <Card key={student.id} className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {student.email}
                            </span>
                            {student.student_id && (
                              <span className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                ID: {student.student_id}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {new Date(student.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-purple-600">{student.approvedHours}</p>
                            <p className="text-gray-500">Approved Hours</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-orange-600">{student.pendingHours}</p>
                            <p className="text-gray-500">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">{student.totalRegistrations}</p>
                            <p className="text-gray-500">Registrations</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge className={
                          student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }>
                          {student.status}
                        </Badge>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="btn-secondary">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="btn-secondary">
                            <Edit className="h-4 w-4" />
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
    </div>
  )
}
