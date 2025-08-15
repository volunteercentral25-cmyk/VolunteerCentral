'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/lib/utils'
import { VolunteerOpportunity } from '@/lib/supabase/types'

export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities')
      if (response.ok) {
        const data = await response.json()
        setOpportunities(data)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const registerForOpportunity = async (opportunityId: string) => {
    try {
      const response = await fetch('/api/opportunities/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId }),
      })

      if (response.ok) {
        // Refresh opportunities
        fetchOpportunities()
      }
    } catch (error) {
      console.error('Error registering for opportunity:', error)
    }
  }

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
          Volunteer Opportunities
        </h1>
        <p className="text-gray-600">
          Browse and sign up for available volunteer opportunities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{opportunity.title}</CardTitle>
              <p className="text-sm text-gray-600">{opportunity.location}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{opportunity.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(opportunity.date)}</span>
                </div>
                {opportunity.start_time && opportunity.end_time && (
                  <div className="flex justify-between">
                    <span className="font-medium">Time:</span>
                    <span>
                      {formatTime(opportunity.start_time)} - {formatTime(opportunity.end_time)}
                    </span>
                  </div>
                )}
                {typeof opportunity.max_participants === 'number' && opportunity.max_participants > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Max Volunteers:</span>
                    <span>{opportunity.max_participants}</span>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => registerForOpportunity(opportunity.id)}
                className="w-full"
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No opportunities available at the moment.</p>
          <p className="text-gray-400">Check back later for new volunteer opportunities!</p>
        </div>
      )}
    </div>
  )
}
