'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestClubsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/test-clubs')
      if (response.ok) {
        const result = await response.json()
        setData(result)
        console.log('Test API result:', result)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Network error')
      console.error('Test API error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Club Memberships Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Club Memberships'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          {data && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">API Response:</h3>
                <pre className="text-sm text-blue-700 mt-2 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">Summary:</h3>
                <p className="text-green-700">User ID: {data.user_id}</p>
                <p className="text-green-700">Clubs Length: {data.clubsLength}</p>
                <p className="text-green-700">Club Names: {data.clubsArray.map((c: any) => c.name).join(', ') || 'None'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
