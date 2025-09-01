'use client'

import { useEffect, useState, Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClubSelectionModal } from '@/components/profile'
import AdminClubSelectionModal from '@/components/admin/AdminClubSelectionModal'
import { isMobileDevice, isMobileViewport } from '@/lib/utils/mobileDetection'
import { 
  Users,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Activity,
  User,
  LogOut,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star,
  Shield,
  Download,
  Settings
} from 'lucide-react'

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Activity className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

interface DashboardData {
  needsClubSelection: boolean
  stats: {
    totalStudents: number
    totalOpportunities: number
    pendingHours: number
    totalHours: number
  }
  recentHours: Array<{
    id: string
    hours: number
    status: string
    created_at: string
    profiles: {
      full_name: string
      email: string
    }
  }>
  recentOpportunities: Array<{
    id: string
    title: string
    date: string
    location: string
  }>
  recentRegistrations: Array<{
    id: string
    status: string
    volunteer_opportunities: {
      title: string
    }
    profiles: {
      full_name: string
    }
  }>
  supervisedClubs: Array<{
    club_id: string
    clubs: {
      id: string
      name: string
      description: string
    }
  }>
  profile: any
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClubModal, setShowClubModal] = useState(false)
  const [showAdminClubModal, setShowAdminClubModal] = useState(false)
  const [clubModalChecked, setClubModalChecked] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadDashboardData()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  // Check if mobile device and redirect to mobile version
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        if (isMobileDevice() || isMobileViewport()) {
          router.push('/admin/dashboard/mobile')
        }
      }
      
      // Check immediately
      checkMobile()
      
      // Check on resize
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [router])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load dashboard data')
      }
      const data = await response.json()
      setDashboardData(data)
      
      // Check if admin needs to complete club selection
      if (!clubModalChecked) {
        if (data.needsClubSelection) {
          setShowAdminClubModal(true)
        } else {
          try {
            const clubResponse = await fetch('/api/student/clubs')
            if (clubResponse.ok) {
              const clubData = await clubResponse.json()
              // Show modal only if clubs_setup_completed is false or null (first login)
              if (!clubData.clubs_setup_completed) {
                setShowClubModal(true)
              }
            }
          } catch (error) {
            console.error('Error checking club status:', error)
          }
        }
        setClubModalChecked(true)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    }
  }

  const handleClubModalComplete = () => {
    setShowClubModal(false)
    // Refresh dashboard data to get updated club information
    loadDashboardData()
  }

  const handleAdminClubModalComplete = () => {
    setShowAdminClubModal(false)
    // Refresh dashboard data to get updated club information
    loadDashboardData()
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/export-data')
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      
      const data = await response.json()
      const csv = generateCSV(data)
      
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      const adminName = dashboardData?.profile?.full_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Admin'
      const clubs = dashboardData?.supervisedClubs?.map(sc => sc.clubs?.name?.replace(/[^a-zA-Z0-9]/g, '_')).join('_') || 'All'
      const filename = `VolunteerCentral_${adminName}_${clubs}_${timestamp}.csv`
      
      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert(`✅ Data exported successfully!\n\nFile: ${filename}\nStudents: ${data.summary.totalStudents}\nHours: ${data.summary.totalHours}\nOpportunities: ${data.summary.totalOpportunities}`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const generateCSV = (data: any) => {
    let csv = ''

    // Helper function to sanitize CSV values
    const sanitizeValue = (value: any) => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Header with title and generation info
    csv += 'VOLUNTEER CENTRAL - COMPREHENSIVE DATA EXPORT\n'
    csv += '='.repeat(60) + '\n'
    csv += `Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`
    csv += `Generated by: ${dashboardData?.profile?.full_name || 'Admin'}\n`
    csv += `Supervised Clubs: ${dashboardData?.supervisedClubs?.map(sc => sc.clubs?.name).join(', ') || 'None'}\n`
    csv += `Export Scope: Students in supervised clubs + opportunities open to all\n\n`
    
    // Executive Summary Section
    csv += 'EXECUTIVE SUMMARY\n'
    csv += '-'.repeat(25) + '\n'
    csv += 'Metric,Value,Description\n'
    csv += `Total Students,${data.summary.totalStudents},Students in supervised clubs\n`
    csv += `Total Volunteer Hours,${data.summary.totalHours},All hours logged (approved + pending + denied)\n`
    csv += `Approved Hours,${data.summary.approvedHours},Hours verified and counted\n`
    csv += `Pending Hours,${data.summary.pendingHours},Hours awaiting verification\n`
    csv += `Denied Hours,${data.summary.deniedHours},Hours rejected\n`
    csv += `Total Opportunities,${data.summary.totalOpportunities},Club-specific + open-to-all opportunities\n`
    csv += `Total Registrations,${data.summary.totalRegistrations},Student registrations for opportunities\n\n`

    // Students Table
    csv += 'STUDENT INFORMATION\n'
    csv += '-'.repeat(20) + '\n'
    csv += 'Full Name,Email Address,Student ID,Phone Number,Bio,Club Membership,Date Joined,Last Updated\n'
    data.students.forEach((student: any) => {
      csv += `${sanitizeValue(student.name)},${sanitizeValue(student.email)},${sanitizeValue(student.studentId)},${sanitizeValue(student.phone)},${sanitizeValue(student.bio)},${sanitizeValue(student.club)},${sanitizeValue(student.joinedDate)},${sanitizeValue(student.lastUpdated)}\n`
    })
    csv += '\n'

    // Volunteer Hours Table
    csv += 'VOLUNTEER HOURS DETAILS\n'
    csv += '-'.repeat(20) + '\n'
    csv += 'Student Name,Student Email,Student ID,Student Phone,Club,Hours Logged,Activity Date,Activity Description,Status,Verification Email,Date Submitted,Date Verified,Verified By,Verification Notes\n'
    data.volunteerHours.forEach((hour: any) => {
      csv += `${sanitizeValue(hour.studentName)},${sanitizeValue(hour.studentEmail)},${sanitizeValue(hour.studentId)},${sanitizeValue(hour.studentPhone)},${sanitizeValue(hour.club)},${sanitizeValue(hour.hours)},${sanitizeValue(hour.date)},${sanitizeValue(hour.description)},${sanitizeValue(hour.status)},${sanitizeValue(hour.verificationEmail)},${sanitizeValue(hour.submittedDate)},${sanitizeValue(hour.verifiedDate)},${sanitizeValue(hour.verifiedBy)},${sanitizeValue(hour.notes)}\n`
    })
    csv += '\n'

    // Opportunities Table
    csv += 'VOLUNTEER OPPORTUNITIES\n'
    csv += '-'.repeat(20) + '\n'
    csv += 'Opportunity Title,Description,Date,Location,Club Restriction,Created Date\n'
    data.opportunities.forEach((opp: any) => {
      csv += `${sanitizeValue(opp.title)},${sanitizeValue(opp.description)},${sanitizeValue(opp.date)},${sanitizeValue(opp.location)},${sanitizeValue(opp.club)},${sanitizeValue(opp.createdDate)}\n`
    })
    csv += '\n'

    // Registrations Table
    csv += 'OPPORTUNITY REGISTRATIONS\n'
    csv += '-'.repeat(20) + '\n'
    csv += 'Student Name,Student Email,Student ID,Opportunity Title,Opportunity Date,Club Restriction,Registration Status,Date Registered\n'
    data.registrations.forEach((reg: any) => {
      csv += `${sanitizeValue(reg.studentName)},${sanitizeValue(reg.studentEmail)},${sanitizeValue(reg.studentId)},${sanitizeValue(reg.opportunity)},${sanitizeValue(reg.opportunityDate)},${sanitizeValue(reg.club)},${sanitizeValue(reg.status)},${sanitizeValue(reg.registeredDate)}\n`
    })
    csv += '\n'

    // Footer with additional info
    csv += 'NOTES AND LEGEND\n'
    csv += '-'.repeat(25) + '\n'
    csv += '• Club Restriction "Open to All Students" means the opportunity is available to all students regardless of club membership\n'
    csv += '• Hours status: "pending" = awaiting approval, "approved" = verified and counted, "denied" = rejected\n'
    csv += '• Registration status: "pending" = awaiting approval, "approved" = confirmed, "denied" = rejected\n'
    csv += '• All dates are in MM/DD/YYYY format\n'
    csv += '• This export contains only data for students in your supervised clubs\n'
    csv += '• Opportunities include both club-specific and open-to-all opportunities\n'
    csv += '• Student club membership is based on Beta Club and NTHS boolean flags\n'
    csv += '• Verification emails are sent to supervisors for hours approval\n'
    csv += '• Phone numbers and bios are optional fields and may be empty\n'

    return csv
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg overflow-hidden w-full">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Header */}
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md w-full"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                  <div>
                    <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                    <p className="text-xs text-gray-600">Admin Dashboard</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{dashboardData?.profile?.full_name || 'Admin'}</span>
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

        <main className="mx-auto max-w-7xl px-4 py-8 w-full">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Admin Control Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage the volunteer system. Monitor students, opportunities, and volunteer hours.
            </p>
            {dashboardData?.supervisedClubs && dashboardData.supervisedClubs.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="outline" className="text-sm">
                  Supervising: {dashboardData.supervisedClubs.map((sc, index) => {
                    try {
                      // Ensure we're working with a safe object structure
                      const clubName = sc && typeof sc === 'object' && sc.clubs && typeof sc.clubs === 'object' 
                        ? sc.clubs.name || 'Unknown Club'
                        : 'Unknown Club';
                    return clubName;
                  } catch (error) {
                    console.error('Error accessing club name:', error, sc);
                    return 'Unknown Club';
                  }
                }).join(', ')}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData?.stats.totalStudents || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData?.stats.totalOpportunities || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Hours</p>
                  <p className="text-3xl font-bold text-orange-600">{dashboardData?.stats.pendingHours || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Approved Hours</p>
                  <p className="text-3xl font-bold text-purple-600">{dashboardData?.stats.totalHours || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

        {/* Management Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Student Management
              </CardTitle>
              <CardDescription>View and manage student accounts, profiles, and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/students">
                <Button className="w-full btn-primary">
                  Manage Students
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Opportunity Management
              </CardTitle>
              <CardDescription>Create, edit, and manage volunteer opportunities.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/opportunities">
                <Button className="w-full btn-primary">
                  Manage Opportunities
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Hours Approval
              </CardTitle>
              <CardDescription>Review and approve pending volunteer hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/hours">
                <Button className="w-full btn-primary">
                  Review Hours
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Email Domains
              </CardTitle>
              <CardDescription>Manage trusted and untrusted email domains for verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/domains">
                <Button className="w-full btn-primary">
                  Manage Domains
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Export Data
              </CardTitle>
              <CardDescription>Generate comprehensive spreadsheet with all student and volunteer data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleExportData}
                disabled={exporting}
                className="w-full btn-primary"
              >
                {exporting ? 'Generating...' : 'Generate Spreadsheet'}
                <Download className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Club Supervision
              </CardTitle>
              <CardDescription>Manage which clubs you supervise.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAdminClubModal(true)}
                className="w-full btn-primary"
              >
                Manage Clubs
                <Settings className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          </motion.div>

        {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Recent Hours */}
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Recent Hours
              </CardTitle>
              <CardDescription>Latest volunteer hours submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentHours && dashboardData.recentHours.length ? (
                  dashboardData.recentHours.map((hour, index) => {
                    try {
                      // Ensure we're working with safe object structures
                      const hourId = hour && typeof hour === 'object' && hour.id 
                        ? String(hour.id) 
                        : `hour-${index}`;
                      const profileName = hour && typeof hour === 'object' && hour.profiles && typeof hour.profiles === 'object'
                        ? hour.profiles.full_name || 'Unknown Student'
                        : 'Unknown Student';
                      const hoursValue = hour && typeof hour === 'object' && typeof hour.hours === 'number'
                        ? hour.hours
                        : 0;
                      const status = hour && typeof hour === 'object' && hour.status
                        ? String(hour.status)
                        : 'unknown';
                      
                      return (
                        <div key={hourId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{profileName}</p>
                            <p className="text-sm text-gray-600">{hoursValue} hours</p>
                          </div>
                          <Badge className={
                            status === 'approved' ? 'bg-green-100 text-green-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {status}
                          </Badge>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering hour:', error, hour);
                      return null;
                    }
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent hours</p>
                )}
        </div>
            </CardContent>
          </Card>

          {/* Recent Opportunities */}
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Upcoming Opportunities
              </CardTitle>
              <CardDescription>Latest volunteer opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentOpportunities && dashboardData.recentOpportunities.length ? (
                  dashboardData.recentOpportunities.map((opportunity, index) => {
                    try {
                      // Ensure we're working with safe object structures
                      const oppId = opportunity && typeof opportunity === 'object' && opportunity.id 
                        ? String(opportunity.id) 
                        : `opportunity-${index}`;
                      const title = opportunity && typeof opportunity === 'object' && opportunity.title
                        ? String(opportunity.title)
                        : 'Unknown Opportunity';
                      const location = opportunity && typeof opportunity === 'object' && opportunity.location
                        ? String(opportunity.location)
                        : 'Unknown Location';
                      const date = opportunity && typeof opportunity === 'object' && opportunity.date
                        ? String(opportunity.date)
                        : '';
                      
                      return (
                        <div key={oppId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{title}</p>
                            <p className="text-sm text-gray-600">{location}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {date ? new Date(date).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering opportunity:', error, opportunity);
                      return null;
                    }
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming opportunities</p>
                )}
      </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Club Selection Modal */}
      <ClubSelectionModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        onComplete={handleClubModalComplete}
        userRole="admin"
      />

      {/* Admin Club Selection Modal */}
      <AdminClubSelectionModal
        isOpen={showAdminClubModal}
        onClose={() => setShowAdminClubModal(false)}
        onComplete={handleAdminClubModalComplete}
      />
    </div>
    </ErrorBoundary>
  )
}
