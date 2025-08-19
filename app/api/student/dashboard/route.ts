import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Get user profile with error handling
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // If profile not found, create it
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Student',
            role: 'student'
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json({ 
            error: 'Failed to create profile',
            code: 'PROFILE_CREATE_ERROR'
          }, { status: 500 })
        }
        profile = newProfile
      } else {
        return NextResponse.json({ 
          error: 'Failed to fetch profile',
          code: 'PROFILE_FETCH_ERROR'
        }, { status: 500 })
      }
    }

    // Fetch all data in parallel for better performance
    const [hoursResult, registrationsResult] = await Promise.allSettled([
      supabase
        .from('volunteer_hours')
        .select('*')
        .eq('student_id', profile.id),
      supabase
        .from('opportunity_registrations')
        .select('*')
        .eq('student_id', profile.id)
    ])

    // Extract data with fallbacks
    const hours = hoursResult.status === 'fulfilled' && hoursResult.value.data 
      ? hoursResult.value.data 
      : []
    const registrations = registrationsResult.status === 'fulfilled' && registrationsResult.value.data 
      ? registrationsResult.value.data 
      : []
    
    // Calculate statistics
    const totalHours = hours.reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const approvedHours = hours.filter(hour => hour.status === 'approved')
      .reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const pendingHours = hours.filter(hour => hour.status === 'pending')
      .reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const opportunities = registrations.length

    // Get recent activity (last 5 hours entries)
    const recentActivity = hours
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(hour => ({
        id: hour.id,
        activity: hour.description || 'Volunteer Activity',
        hours: hour.hours,
        date: hour.date,
        status: hour.status
      }))

    // Calculate goal progress (assuming 100 hours goal)
    const goalProgress = Math.min(Math.round((totalHours / 100) * 100), 100)

    // Generate achievements based on hours
    const achievements = []
    if (totalHours >= 10) achievements.push({ name: 'First Steps', description: 'Complete your first 10 hours', earned: true })
    if (totalHours >= 25) achievements.push({ name: 'Dedicated Helper', description: 'Complete 25 hours of service', earned: true })
    if (totalHours >= 50) achievements.push({ name: 'Community Champion', description: 'Complete 50 hours of service', earned: true })
    if (totalHours < 10) achievements.push({ name: 'First Steps', description: 'Complete your first 10 hours', earned: false, remaining: 10 - totalHours })
    if (totalHours < 25 && totalHours >= 10) achievements.push({ name: 'Dedicated Helper', description: 'Complete 25 hours of service', earned: false, remaining: 25 - totalHours })

    const dashboardData = {
      profile,
      stats: {
        totalHours,
        approvedHours,
        pendingHours,
        opportunities,
        goalProgress
      },
      recentActivity,
      achievements
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
