'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugClubsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDebugAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-clubs')
      console.log('Debug API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        setData(result)
        console.log('Debug API result:', result)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch debug data')
        console.error('Debug API error:', errorData)
      }
    } catch (err) {
      setError('Network error')
      console.error('Debug API error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Clubs API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDebugAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Debug API'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          {data && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">User Info:</h3>
                <p className="text-blue-700">User ID: {data.user_id}</p>
                <p className="text-blue-700">User Email: {data.user_email}</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">Club IDs Query:</h3>
                <pre className="text-sm text-green-700 mt-2 overflow-auto">
                  {JSON.stringify(data.studentClubIds, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-800">Clubs Data:</h3>
                <pre className="text-sm text-purple-700 mt-2 overflow-auto">
                  {JSON.stringify(data.clubsArray, null, 2)}
                </pre>
                <p className="text-purple-700 mt-2">
                  Clubs Length: {data.clubsLength}
                </p>
                <p className="text-purple-700">
                  Club Names: {data.clubNames.join(', ') || 'None'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
