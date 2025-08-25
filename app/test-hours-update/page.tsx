'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TestHoursUpdate() {
  const [hoursData, setHoursData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadHours()
  }, [])

  const loadHours = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/hours?page=1&limit=5')
      if (!response.ok) {
        throw new Error('Failed to load hours')
      }
      const data = await response.json()
      setHoursData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testUpdate = async (hourId: string, status: string) => {
    try {
      setUpdating(true)
      console.log('Testing update for hour:', hourId, 'with status:', status)
      
      const response = await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hoursId: hourId,
          status: status,
          notes: 'Test update from admin panel'
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to update hours')
      }

      const result = await response.json()
      console.log('Success response:', result)
      
      // Reload hours to see the change
      await loadHours()
      alert(`Successfully updated hour ${hourId} to ${status}`)
    } catch (err) {
      console.error('Error updating hours:', err)
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading hours...</div>
  }

  if (error) {
    return <div className="p-8">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hours Update Test</h1>
      
      <div className="mb-4">
        <Button onClick={loadHours} disabled={updating}>
          Refresh Hours
        </Button>
      </div>
      
      <div className="grid gap-4">
        {hoursData?.hours?.map((hour: any) => (
          <Card key={hour.id} className="p-4">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{hour.activity}</h3>
                  <p className="text-sm text-gray-600">{hour.profiles.full_name}</p>
                  <p className="text-sm text-gray-600">Status: {hour.status}</p>
                  <p className="text-sm text-gray-600">Hours: {hour.hours}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => testUpdate(hour.id, 'approved')}
                    disabled={updating || hour.status === 'approved'}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => testUpdate(hour.id, 'denied')}
                    disabled={updating || hour.status === 'denied'}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => testUpdate(hour.id, 'pending')}
                    disabled={updating || hour.status === 'pending'}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Set Pending
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {updating && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p>Updating hours...</p>
        </div>
      )}
    </div>
  )
}
