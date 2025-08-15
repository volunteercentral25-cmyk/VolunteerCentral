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
  Calendar,
  User,
  LogOut,
  ArrowLeft,
  Plus,
  CheckCircle,
  AlertCircle,
  Activity,
  Target
} from 'lucide-react'

export default function StudentHours() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    activity: '',
    hours: '',
    date: '',
    description: ''
  })
  const [hours, setHours] = useState([
    {
      id: 1,
      activity: 'Community Garden Cleanup',
      hours: 4,
      date: '2024-01-15',
      description: 'Helped clean and maintain the community garden',
      status: 'approved'
    },
    {
      id: 2,
      activity: 'Food Bank Volunteer',
      hours: 6,
      date: '2024-01-10',
      description: 'Assisted with food sorting and distribution',
      status: 'approved'
    },
    {
      id: 3,
      activity: 'Library Reading Program',
      hours: 3,
      date: '2024-01-08',
      description: 'Read books to children at the local library',
      status: 'pending'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newHour = {
      id: hours.length + 1,
      ...formData,
      hours: parseInt(formData.hours),
      status: 'pending'
    }
    setHours([newHour, ...hours])
    setFormData({ activity: '', hours: '', date: '', description: '' })
    setShowForm(false)
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
                  <p className="text-xs text-gray-600">Hours Tracking</p>
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
            Track Your Impact
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Volunteer <span className="text-gradient">Hours</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Log your volunteer activities and track your community impact. Every hour counts towards making a difference.
          </p>
        </motion.div>

        {/* Add Hours Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary btn-hover-effect"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add New Hours'}
          </Button>
        </motion.div>

        {/* Add Hours Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gradient">Log New Hours</CardTitle>
                <CardDescription>Record your volunteer activity and hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="activity">Activity Name</Label>
                      <Input 
                        id="activity"
                        value={formData.activity}
                        onChange={(e) => setFormData({...formData, activity: e.target.value})}
                        placeholder="e.g., Community Garden Cleanup"
                        className="input-focus-effect"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input 
                        id="hours"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: e.target.value})}
                        placeholder="2.5"
                        className="input-focus-effect"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="input-focus-effect"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what you did during this volunteer activity..."
                      className="input-focus-effect"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="btn-primary">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Hours
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hours List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Hours History</h2>
          <div className="space-y-4">
            {hours.map((hour) => (
              <motion.div
                key={hour.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-effect border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-3 ${
                          hour.status === 'approved' 
                            ? 'bg-green-100' 
                            : 'bg-yellow-100'
                        }`}>
                          {hour.status === 'approved' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{hour.activity}</h3>
                          <p className="text-sm text-gray-600">{hour.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {hour.hours} hours
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(hour.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        hour.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {hour.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gradient">
                    {hours.reduce((sum, hour) => sum + hour.hours, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">
                    {hours.filter(h => h.status === 'approved').length}
                  </p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">
                    {hours.filter(h => h.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
