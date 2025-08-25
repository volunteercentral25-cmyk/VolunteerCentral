'use client'

import { useEffect, useState } from 'react'

export default function TestStudentCount() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [studentsData, setStudentsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPIs = async () => {
      try {
        setLoading(true)
        
        // Test dashboard API
        const dashboardResponse = await fetch('/api/admin/dashboard')
        const dashboardResult = await dashboardResponse.json()
        setDashboardData(dashboardResult)
        
        // Test students API
        const studentsResponse = await fetch('/api/admin/students?page=1&limit=20')
        const studentsResult = await studentsResponse.json()
        setStudentsData(studentsResult)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testAPIs()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Count Test</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Dashboard API</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Students API</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(studentsData, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold">Summary:</h3>
        <p>Dashboard Total Students: {dashboardData?.stats?.totalStudents || 'N/A'}</p>
        <p>Students API Total: {studentsData?.pagination?.total || 'N/A'}</p>
        <p>Students Count: {studentsData?.students?.length || 'N/A'}</p>
      </div>
    </div>
  )
}
