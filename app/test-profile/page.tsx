'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testProfileAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/student/profile')
      console.log('Profile API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        setData(result)
        console.log('Profile API result:', result)
        console.log('Profile API clubs data:', result.clubs)
        console.log('Profile API clubs length:', result.clubs?.length)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch profile data')
        console.error('Profile API error:', errorData)
      }
    } catch (err) {
      setError('Network error')
      console.error('Profile API error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Profile API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testProfileAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Profile API'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          {data && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">Profile Data:</h3>
                <pre className="text-sm text-blue-700 mt-2 overflow-auto max-h-96">
                  {JSON.stringify(data.profile, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">Clubs Data:</h3>
                <pre className="text-sm text-green-700 mt-2 overflow-auto max-h-96">
                  {JSON.stringify(data.clubs, null, 2)}
                </pre>
                <p className="text-green-700 mt-2">
                  Clubs Length: {data.clubs?.length || 0}
                </p>
                <p className="text-green-700">
                  Club Names: {data.clubs?.map((c: any) => c.name).join(', ') || 'None'}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-800">Stats Data:</h3>
                <pre className="text-sm text-purple-700 mt-2 overflow-auto">
                  {JSON.stringify(data.stats, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
