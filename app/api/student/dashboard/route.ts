import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // Get user profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      // Try to create profile if it doesn't exist
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
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      console.log('Profile created:', newProfile)
      profile = newProfile
    } else {
      console.log('Profile found:', profile)
    }

    // Get volunteer hours statistics
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('student_id', profile.id)

    if (hoursError) {
      return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })
    }

    // Get opportunity registrations
    const { data: registrationsData, error: registrationsError } = await supabase
      .from('opportunity_registrations')
      .select('*')
      .eq('student_id', profile.id)

    if (registrationsError) {
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
    }

    // Calculate statistics
    const totalHours = hoursData?.reduce((sum, hour) => sum + Number(hour.hours), 0) || 0
    const approvedHours = hoursData?.filter(hour => hour.status === 'approved')
      .reduce((sum, hour) => sum + Number(hour.hours), 0) || 0
    const pendingHours = hoursData?.filter(hour => hour.status === 'pending')
      .reduce((sum, hour) => sum + Number(hour.hours), 0) || 0
    const opportunities = registrationsData?.length || 0

    // Get recent activity (last 5 hours entries)
    const recentActivity = hoursData?.slice(0, 5).map(hour => ({
      id: hour.id,
      activity: hour.description || 'Volunteer Activity',
      hours: hour.hours,
      date: hour.date,
      status: hour.status
    })) || []

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

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
