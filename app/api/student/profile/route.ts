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
        created_at: profile.created_at,
        beta_club: profile.beta_club || false,
        nths: profile.nths || false,
        clubs_completed: profile.clubs_completed || false
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { full_name, student_id, email } = await request.json()

    // Validate required fields
    if (!full_name || !student_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate student ID format
    if (!/^\d{10}$/.test(student_id)) {
      return NextResponse.json({ error: 'Student ID must be exactly 10 digits' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .neq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Email check error:', checkError)
      return NextResponse.json({ error: 'Failed to check email availability' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Email address is already in use' }, { status: 400 })
    }

    // Check if student ID is already taken by another user
    const { data: existingStudent, error: studentCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_id', student_id)
      .neq('id', user.id)
      .single()

    if (studentCheckError && studentCheckError.code !== 'PGRST116') {
      console.error('Student ID check error:', studentCheckError)
      return NextResponse.json({ error: 'Failed to check student ID availability' }, { status: 500 })
    }

    if (existingStudent) {
      return NextResponse.json({ error: 'Student ID is already registered' }, { status: 400 })
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        student_id: student_id.trim(),
        email: email.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Update auth email if it changed
    if (email !== user.email) {
      const { error: emailUpdateError } = await supabase.auth.updateUser({
        email: email.trim()
      })

      if (emailUpdateError) {
        console.error('Email update error:', emailUpdateError)
        // Don't fail the request, just log the error
        // The profile was updated successfully
      }
    }

    return NextResponse.json({
      id: updatedProfile.id,
      email: updatedProfile.email,
      student_id: updatedProfile.student_id,
      full_name: updatedProfile.full_name,
      role: updatedProfile.role,
      created_at: updatedProfile.created_at
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
