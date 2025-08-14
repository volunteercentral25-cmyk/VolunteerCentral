'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, formatHours } from '@/lib/utils'
import { VolunteerHours } from '@/lib/supabase/types'

export default function StudentHoursPage() {
  const [hours, setHours] = useState<VolunteerHours[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [formData, setFormData] = useState({
    hours: '',
    date: '',
    description: '',
    opportunityId: ''
  })

  useEffect(() => {
    fetchHours()
  }, [])

  const fetchHours = async () => {
    try {
      const response = await fetch('/api/hours')
      if (response.ok) {
        const data = await response.json()
        setHours(data)
      }
    } catch (error) {
      console.error('Error fetching hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const logHours = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ hours: '', date: '', description: '', opportunityId: '' })
        setShowLogForm(false)
        fetchHours()
      }
    } catch (error) {
      console.error('Error logging hours:', error)
    }
  }

  const totalHours = hours.reduce((sum, hour) => sum + Number(hour.hours), 0)
  const approvedHours = hours
    .filter(hour => hour.status === 'approved')
    .reduce((sum, hour) => sum + Number(hour.hours), 0)
  const pendingHours = hours
    .filter(hour => hour.status === 'pending')
    .reduce((sum, hour) => sum + Number(hour.hours), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Volunteer Hours
        </h1>
        <p className="text-gray-600">
          Log and track your volunteer hours
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-3xl font-bold text-blue-600">{formatHours(totalHours)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Approved Hours</p>
              <p className="text-3xl font-bold text-green-600">{formatHours(approvedHours)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending Hours</p>
              <p className="text-3xl font-bold text-yellow-600">{formatHours(pendingHours)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Hours Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowLogForm(!showLogForm)}
          className="mb-4"
        >
          {showLogForm ? 'Cancel' : 'Log New Hours'}
        </Button>
      </div>

      {/* Log Hours Form */}
      {showLogForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Log Volunteer Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={logHours} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your volunteer work..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Log Hours
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Hours History */}
      <Card>
        <CardHeader>
          <CardTitle>Hours History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hours.map((hour) => (
              <div key={hour.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{formatHours(Number(hour.hours))}</p>
                  <p className="text-sm text-gray-600">{formatDate(hour.date)}</p>
                  {hour.description && (
                    <p className="text-sm text-gray-500 mt-1">{hour.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hour.status === 'approved' ? 'bg-green-100 text-green-800' :
                    hour.status === 'denied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hour.status}
                  </span>
                </div>
              </div>
            ))}
            
            {hours.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hours logged yet. Start by logging your first volunteer hours!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
