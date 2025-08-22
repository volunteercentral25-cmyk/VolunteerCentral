import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get total approved hours
    const { data: approvedHours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('hours')
      .eq('student_id', user.id)
      .eq('status', 'approved')

    if (hoursError) {
      console.error('Hours fetch error:', hoursError)
      return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })
    }

    const totalHours = approvedHours?.reduce((sum, record) => sum + Number(record.hours), 0) || 0

    // Get pending hours
    const { data: pendingHours, error: pendingError } = await supabase
      .from('volunteer_hours')
      .select('hours')
      .eq('student_id', user.id)
      .eq('status', 'pending')

    if (pendingError) {
      console.error('Pending hours fetch error:', pendingError)
      return NextResponse.json({ error: 'Failed to fetch pending hours' }, { status: 500 })
    }

    const pendingHoursTotal = pendingHours?.reduce((sum, record) => sum + Number(record.hours), 0) || 0

    // Get total opportunities registered
    const { data: registrations, error: regError } = await supabase
      .from('opportunity_registrations')
      .select('id')
      .eq('student_id', user.id)

    if (regError) {
      console.error('Registrations fetch error:', regError)
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
    }

    const totalOpportunities = registrations?.length || 0

    // Calculate achievements based on hours
    const achievements = []
    if (totalHours >= 10) {
      achievements.push({
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first 10 hours of community service',
        earned: true,
        earnedAt: new Date().toISOString()
      })
    }
    
    if (totalHours >= 20) {
      achievements.push({
        id: 'goal_reached',
        title: 'Goal Achiever',
        description: 'Reach your 20-hour community service goal',
        earned: true,
        earnedAt: new Date().toISOString()
      })
    }

    if (totalHours >= 50) {
      achievements.push({
        id: 'community_champion',
        title: 'Community Champion',
        description: 'Complete 50 hours of community service',
        earned: true,
        earnedAt: new Date().toISOString()
      })
    }

    // Add in-progress achievements
    if (totalHours < 10) {
      achievements.push({
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first 10 hours of community service',
        earned: false,
        progress: totalHours,
        target: 10
      })
    }

    if (totalHours < 20) {
      achievements.push({
        id: 'goal_reached',
        title: 'Goal Achiever',
        description: 'Reach your 20-hour community service goal',
        earned: false,
        progress: totalHours,
        target: 20
      })
    }

    if (totalHours < 50) {
      achievements.push({
        id: 'community_champion',
        title: 'Community Champion',
        description: 'Complete 50 hours of community service',
        earned: false,
        progress: totalHours,
        target: 50
      })
    }

    // Calculate goal progress (20 hours goal)
    const goalHours = 20
    const goalProgress = Math.min(Math.round((totalHours / goalHours) * 100), 100)

    const profileData = {
      profile: {
        id: profile.id,
        email: profile.email,
        student_id: profile.student_id,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      },
      stats: {
        totalHours: totalHours,
        pendingHours: pendingHoursTotal,
        opportunities: totalOpportunities,
        achievements: achievements.filter(a => a.earned).length,
        goalProgress: goalProgress,
        goalHours: goalHours
      },
      achievements: achievements
    }

    return NextResponse.json(profileData)

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
