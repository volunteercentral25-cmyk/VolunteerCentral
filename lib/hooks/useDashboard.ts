import { useState, useEffect, useCallback } from 'react'
import { DashboardData, DashboardError, DashboardState } from '@/lib/types/dashboard'

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null
  })

  const fetchDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: DashboardData = await response.json()
      setState({
        data,
        loading: false,
        error: null
      })
    } catch (error) {
      const dashboardError: DashboardError = {
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
        code: 'FETCH_ERROR',
        details: error instanceof Error ? error.stack : undefined
      }
      
      setState({
        data: null,
        loading: false,
        error: dashboardError
      })
    }
  }, [])

  const refetch = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    ...state,
    refetch
  }
}
