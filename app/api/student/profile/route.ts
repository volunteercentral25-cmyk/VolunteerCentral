import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ClubMembership {
  club_id: string
  clubs: {
    id: string
    name: string
    description: string
  }[]
}

interface Club {
  id: string
}

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

    // Get current club memberships
    const { data: clubMemberships, error: clubError } = await supabase
      .from('student_clubs')
      .select(`
        club_id,
        clubs!inner(id, name, description)
      `)
      .eq('student_id', user.id)

    if (clubError) {
      console.error('Club memberships fetch error:', clubError)
      // Continue without club memberships
    }

    // Log club memberships for debugging
    console.log('Club memberships for user:', user.id, clubMemberships)

    // Extract club names for backward compatibility
    const currentClubs = clubMemberships?.map((cm: ClubMembership) => cm.clubs[0]?.name).filter(Boolean) || []
    const betaClub = currentClubs.includes('Beta Club')
    const nths = currentClubs.includes('NTHS')

    // Log extracted club data for debugging
    console.log('Extracted clubs:', { currentClubs, betaClub, nths })

    // Calculate achievements based on hours and track achievement dates
    const achievements = []
    const now = new Date().toISOString()
    
    // Check if achievements are newly earned and update database
    if (totalHours >= 5 && !profile.first_steps_achieved_at) {
      // Newly achieved - update database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          first_steps_achieved_at: now,
          updated_at: now
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating first steps achievement date:', updateError)
      }
    }
    
    if (totalHours >= 10 && !profile.dedicated_helper_achieved_at) {
      // Newly achieved - update database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          dedicated_helper_achieved_at: now,
          updated_at: now
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating dedicated helper achievement date:', updateError)
      }
    }
    
    if (totalHours >= 20 && !profile.community_champion_achieved_at) {
      // Newly achieved - update database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          community_champion_achieved_at: now,
          updated_at: now
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating community champion achievement date:', updateError)
      }
    }

    // Build achievements array with actual achievement dates
    if (totalHours >= 5) {
      achievements.push({
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first 5 hours of community service',
        earned: true,
        earnedAt: profile.first_steps_achieved_at || now
      })
    }

    if (totalHours >= 10) {
      achievements.push({
        id: 'dedicated_helper',
        title: 'Dedicated Helper',
        description: 'Complete 10 hours of community service',
        earned: true,
        earnedAt: profile.dedicated_helper_achieved_at || now
      })
    }

    if (totalHours >= 20) {
      achievements.push({
        id: 'community_champion',
        title: 'Community Champion',
        description: 'Complete 20 hours of community service',
        earned: true,
        earnedAt: profile.community_champion_achieved_at || now
      })
    }

    // Add in-progress achievements
    if (totalHours < 5) {
      achievements.push({
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first 5 hours of community service',
        earned: false,
        progress: totalHours,
        target: 5
      })
    }

    if (totalHours < 10) {
      achievements.push({
        id: 'dedicated_helper',
        title: 'Dedicated Helper',
        description: 'Complete 10 hours of community service',
        earned: false,
        progress: totalHours,
        target: 10
      })
    }

    if (totalHours < 20) {
      achievements.push({
        id: 'community_champion',
        title: 'Community Champion',
        description: 'Complete 20 hours of community service',
        earned: false,
        progress: totalHours,
        target: 20
      })
    }

    // Calculate goal progress (20 hours goal)
    const goalHours = 20
    const goalProgress = Math.min(Math.round((totalHours / goalHours) * 100), 100)

    // Build clubs array for frontend
    const clubsArray = clubMemberships?.map((cm: ClubMembership) => ({
      id: cm.clubs[0]?.id,
      name: cm.clubs[0]?.name,
      description: cm.clubs[0]?.description
    })).filter(club => club.id && club.name) || []

    // Log clubs array for debugging
    console.log('Clubs array for frontend:', clubsArray)

    const profileData = {
      profile: {
        id: profile.id,
        email: profile.email,
        student_id: profile.student_id,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        beta_club: betaClub,
        nths: nths,
        clubs_completed: currentClubs.length > 0,
        first_steps_achieved_at: profile.first_steps_achieved_at,
        dedicated_helper_achieved_at: profile.dedicated_helper_achieved_at,
        community_champion_achieved_at: profile.community_champion_achieved_at
      },
      stats: {
        totalHours: totalHours,
        pendingHours: pendingHoursTotal,
        opportunities: totalOpportunities,
        achievements: achievements.filter(a => a.earned).length,
        goalProgress: goalProgress,
        goalHours: goalHours
      },
      achievements: achievements,
      clubs: clubsArray
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
    const { full_name, student_id, email, clubs } = await request.json()

    // Validate required fields
    if (!full_name || !student_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate clubs array if provided
    if (clubs && !Array.isArray(clubs)) {
      return NextResponse.json({ error: 'Clubs must be an array' }, { status: 400 })
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

    // Handle club membership updates if clubs are provided
    if (clubs) {
      try {
        // First, remove all existing club memberships
        const { error: deleteError } = await supabase
          .from('student_clubs')
          .delete()
          .eq('student_id', user.id)

        if (deleteError) {
          console.error('Error removing existing club memberships:', deleteError)
          // Continue with the request even if this fails
        }

        // Add new club memberships
        if (clubs.length > 0) {
          // Get club IDs for the selected club names
          const { data: clubData, error: clubError } = await supabase
            .from('clubs')
            .select('id')
            .in('name', clubs)
            .eq('is_active', true)

          if (clubError) {
            console.error('Error fetching club IDs:', clubError)
          } else if (clubData && clubData.length > 0) {
            // Create new club memberships
            const clubMemberships = clubData.map((club: Club) => ({
              student_id: user.id,
              club_id: club.id
            }))

            const { error: insertError } = await supabase
              .from('student_clubs')
              .insert(clubMemberships)

            if (insertError) {
              console.error('Error creating club memberships:', insertError)
            }
          }
        }

        // Update the legacy boolean flags for backward compatibility
        const betaClub = clubs.includes('Beta Club')
        const nths = clubs.includes('NTHS')
        
        const { error: legacyUpdateError } = await supabase
          .from('profiles')
          .update({
            beta_club: betaClub,
            nths: nths,
            clubs_completed: clubs.length > 0,
            clubs_setup_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (legacyUpdateError) {
          console.error('Error updating legacy club flags:', legacyUpdateError)
        }
      } catch (clubError) {
        console.error('Error handling club memberships:', clubError)
        // Continue with the request even if club handling fails
      }
    }

    return NextResponse.json({
      id: updatedProfile.id,
      email: updatedProfile.email,
      student_id: updatedProfile.student_id,
      full_name: updatedProfile.full_name,
      role: updatedProfile.role,
      created_at: updatedProfile.created_at,
      beta_club: clubs ? clubs.includes('Beta Club') : updatedProfile.beta_club,
      nths: clubs ? clubs.includes('NTHS') : updatedProfile.nths,
      clubs_completed: clubs ? clubs.length > 0 : updatedProfile.clubs_completed
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
