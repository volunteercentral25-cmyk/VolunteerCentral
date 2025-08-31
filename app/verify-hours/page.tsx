'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface VerificationData {
  hours_id: string
  action: 'approve' | 'deny'
  email: string
  token: string
}

interface HoursDetails {
  id: string
  student_id: string
  hours: number
  date: string
  description: string
  status: string
  verification_email: string
  created_at: string
}

interface StudentProfile {
  id: string
  full_name: string
  email: string
  student_id: string
}

function VerifyHoursContent() {
  const searchParams = useSearchParams()
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [hoursDetails, setHoursDetails] = useState<HoursDetails | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const action = searchParams.get('action') as 'approve' | 'deny'
    const hours_id = searchParams.get('hours_id')
    const email = searchParams.get('email')

    if (!token || !action || !hours_id || !email) {
      setError('Invalid verification link. Missing required parameters.')
      setLoading(false)
      return
    }

    setVerificationData({ hours_id, action, email, token })
    verifyTokenAndLoadData(token, action, hours_id, email)
  }, [searchParams])

  const verifyTokenAndLoadData = async (token: string, action: string, hours_id: string, email: string) => {
    try {
      // Call Next.js API to verify token and get data (NO FINAL ACTION)
      const response = await fetch(`/api/email-service/verify-hours?token=${token}&action=${action}&hours_id=${hours_id}&email=${email}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify token')
      }

      const data = await response.json()
      
      // Set the data from the API response
      if (data.hours_data) {
        setHoursDetails(data.hours_data)
      }
      
      if (data.student_profile) {
        setStudentProfile(data.student_profile)
      }

    } catch (error) {
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to verify token')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationData) return

    setVerifying(true)
    try {
      const url = `/api/email-service/verify-hours?token=${verificationData.token}&action=${verificationData.action}&hours_id=${verificationData.hours_id}&email=${verificationData.email}&final_action=true`
      const finalUrl = notes ? `${url}&notes=${encodeURIComponent(notes)}` : url

      const response = await fetch(finalUrl)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify hours')
      }

      const data = await response.json()
      setSuccess(true)
      
      // Update local state
      if (hoursDetails) {
        setHoursDetails({
          ...hoursDetails,
          status: verificationData.action === 'approve' ? 'approved' : 'denied'
        })
      }

    } catch (error) {
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to verify hours')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Request</h2>
            <p className="text-gray-600">Please wait while we verify your verification link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This link may have expired or is invalid. Please contact the student for a new verification request.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hours {verificationData?.action === 'approve' ? 'Approved' : 'Denied'} Successfully
            </h2>
            <p className="text-gray-600 mb-4">
              The volunteer hours have been {verificationData?.action === 'approve' ? 'approved' : 'denied'} and the student has been notified.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-green-800 mb-2">Verification Details:</h3>
              <p className="text-sm text-green-700">
                <strong>Student:</strong> {studentProfile?.full_name}<br />
                <strong>Activity:</strong> {hoursDetails?.description}<br />
                <strong>Hours:</strong> {hoursDetails?.hours}<br />
                <strong>Date:</strong> {hoursDetails?.date}<br />
                <strong>Status:</strong> {verificationData?.action === 'approve' ? 'Approved' : 'Denied'}<br />
                <strong>Verified by:</strong> {verificationData?.email}<br />
                <strong>Verified on:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Hours Verification
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Verify <span className="text-gradient">Volunteer Hours</span>
            </h1>
            <p className="text-xl text-gray-600">
              Please review the volunteer hours below and approve or deny the submission.
            </p>
          </div>

          {/* Student Information */}
          {studentProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <Card className="glass-effect border-0 shadow-xl border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Name</p>
                      <p className="text-blue-900">{studentProfile.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Email</p>
                      <p className="text-blue-900">{studentProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Student ID</p>
                      <p className="text-blue-900">{studentProfile.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Verifier</p>
                      <p className="text-blue-900">{verificationData?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Hours Details */}
          {hoursDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-6"
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Volunteer Hours Details
                  </CardTitle>
                  <CardDescription>
                    Review the volunteer activity details below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Activity</p>
                        <p className="text-gray-900 font-medium">{hoursDetails.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Hours</p>
                        <p className="text-gray-900 font-medium">{hoursDetails.hours} hours</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Date</p>
                        <p className="text-gray-900 font-medium">{new Date(hoursDetails.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Submitted</p>
                        <p className="text-gray-900 font-medium">{new Date(hoursDetails.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                    <p className="text-gray-900">{hoursDetails.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Verification Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationData?.action === 'approve' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {verificationData?.action === 'approve' ? 'Approve' : 'Deny'} Hours
                </CardTitle>
                <CardDescription>
                  {verificationData?.action === 'approve' 
                    ? 'Confirm that these volunteer hours are accurate and should be approved.'
                    : 'Provide a reason for denying these volunteer hours (optional).'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationData?.action === 'deny' && (
                  <div className="mb-6">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Reason for Denial (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Please provide a reason for denying these hours..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleVerification}
                    disabled={verifying}
                    className={`flex-1 ${
                      verificationData?.action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {verificationData?.action === 'approve' ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {verificationData?.action === 'approve' ? 'Approve' : 'Deny'} Hours
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Important</p>
                      <p className="text-sm text-yellow-700">
                        This action will {verificationData?.action === 'approve' ? 'approve' : 'deny'} the volunteer hours 
                        and notify the student. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyHoursPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we load the verification page...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyHoursContent />
    </Suspense>
  )
}
