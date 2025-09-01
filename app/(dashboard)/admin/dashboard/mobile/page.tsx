'use client'

import { useEffect, useState, Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import MobileAdminLayout from '@/components/layout/mobile-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClubSelectionModal } from '@/components/profile'
import AdminClubSelectionModal from '@/components/admin/AdminClubSelectionModal'
import { 
  Users,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Star,
  ArrowRight,
  Activity,
  Download,
  Settings,
  Shield
} from 'lucide-react'
import Link from 'next/link'

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
        <MobileAdminLayout currentPage="dashboard">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <Activity className="h-8 w-8 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </MobileAdminLayout>
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

export default function MobileAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClubModal, setShowClubModal] = useState(false)
  const [showAdminClubModal, setShowAdminClubModal] = useState(false)
  const [clubModalChecked, setClubModalChecked] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
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
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <MobileAdminLayout currentPage="dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </MobileAdminLayout>
    )
  }

  if (error) {
    return (
      <MobileAdminLayout currentPage="dashboard">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </MobileAdminLayout>
    )
  }

  return (
    <ErrorBoundary>
      <MobileAdminLayout currentPage="dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Admin Control Center
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="text-gray-600 text-sm">
          Manage the volunteer system. Monitor students, opportunities, and volunteer hours.
        </p>
        {dashboardData?.supervisedClubs && dashboardData.supervisedClubs.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">
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
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Students</p>
                <p className="text-xl font-bold text-blue-600">{dashboardData?.stats.totalStudents || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Opportunities</p>
                <p className="text-xl font-bold text-green-600">{dashboardData?.stats.totalOpportunities || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pending Hours</p>
                <p className="text-xl font-bold text-orange-600">{dashboardData?.stats.pendingHours || 0}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Hours</p>
                <p className="text-xl font-bold text-purple-600">{dashboardData?.stats.totalHours || 0}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/students">
              <Button className="w-full justify-between bg-blue-600 hover:bg-blue-700">
                <span>Manage Students</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/opportunities">
              <Button className="w-full justify-between bg-green-600 hover:bg-green-700">
                <span>Manage Opportunities</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/hours">
              <Button className="w-full justify-between bg-orange-600 hover:bg-orange-700">
                <span>Review Hours</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/domains">
              <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700">
                <span>Manage Domains</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              onClick={handleExportData}
              disabled={exporting}
              className="w-full justify-between bg-indigo-600 hover:bg-indigo-700"
            >
              <span>{exporting ? 'Generating...' : 'Export Data'}</span>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowAdminClubModal(true)}
              className="w-full justify-between bg-teal-600 hover:bg-teal-700"
            >
              <span>Manage Clubs</span>
              <Settings className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {/* Recent Hours */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recent Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentHours && dashboardData.recentHours.length ? (
                dashboardData.recentHours.slice(0, 3).map((hour, index) => {
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
                          <p className="font-medium text-gray-900 text-sm">{profileName}</p>
                          <p className="text-xs text-gray-600">{hoursValue} hours</p>
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
                <p className="text-gray-500 text-center py-4 text-sm">No recent hours</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              Upcoming Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentOpportunities && dashboardData.recentOpportunities.length ? (
                dashboardData.recentOpportunities.slice(0, 3).map((opportunity, index) => {
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
                          <p className="font-medium text-gray-900 text-sm">{title}</p>
                          <p className="text-xs text-gray-600">{location}</p>
                        </div>
                        <p className="text-xs text-gray-500">
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
                <p className="text-gray-500 text-center py-4 text-sm">No upcoming opportunities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
    </MobileAdminLayout>
  </ErrorBoundary>
  )
}
