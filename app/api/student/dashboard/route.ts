import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user with better error handling
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: userError.message 
      }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found in session')
      return NextResponse.json({ 
        error: 'No authenticated user found' 
      }, { status: 401 })
    }

    console.log('User authenticated:', user.email, 'User ID:', user.id)

    // Get user profile with better error handling
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // Check if it's a "not found" error vs other errors
      if (profileError.code === 'PGRST116') {
        // Profile not found - try to create it
        console.log('Profile not found, attempting to create...')
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
          console.error('Profile creation error:', createError)
          return NextResponse.json({ 
            error: 'Failed to create profile',
            details: createError.message
          }, { status: 500 })
        }

        console.log('Profile created successfully:', newProfile)
        profile = newProfile
      } else {
        // Other error - return the error
        console.error('Unexpected profile error:', profileError)
        return NextResponse.json({ 
          error: 'Failed to fetch profile',
          details: profileError.message
        }, { status: 500 })
      }
    } else {
      console.log('Profile found successfully:', profile)
    }

    // Get volunteer hours statistics from volunteer_hours table
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('student_id', profile.id)

    if (hoursError) {
      console.error('Hours fetch error:', hoursError)
      // Don't fail the entire request for hours error, just use empty array
      console.log('Using empty hours data due to error')
    }

    // Get opportunity registrations
    const { data: registrationsData, error: registrationsError } = await supabase
      .from('opportunity_registrations')
      .select('*')
      .eq('student_id', profile.id)

    if (registrationsError) {
      console.error('Registrations fetch error:', registrationsError)
      // Don't fail the entire request for registrations error, just use empty array
      console.log('Using empty registrations data due to error')
    }

    // Calculate statistics with safe defaults
    const hours = hoursData || []
    const registrations = registrationsData || []
    
    const totalHours = hours.reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const approvedHours = hours.filter(hour => hour.status === 'approved')
      .reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const pendingHours = hours.filter(hour => hour.status === 'pending')
      .reduce((sum, hour) => sum + Number(hour.hours || 0), 0)
    const opportunities = registrations.length

    // Get recent activity (last 5 hours entries)
    const recentActivity = hours.slice(0, 5).map(hour => ({
      id: hour.id,
      activity: hour.description || 'Volunteer Activity',
      hours: hour.hours,
      date: hour.date,
      status: hour.status
    }))

    // Calculate goal progress (assuming 100 hours goal)
    const goalProgress = Math.min(Math.round((totalHours / 100) * 100), 100)

    // Mock achievements based on hours
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

    console.log('Dashboard data prepared successfully')
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
