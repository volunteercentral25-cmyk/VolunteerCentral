import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { beta_club, nths } = await request.json()

    // Validate input
    if (typeof beta_club !== 'boolean' || typeof nths !== 'boolean') {
      return NextResponse.json({ error: 'Invalid club data' }, { status: 400 })
    }

    // Get the club IDs for Beta Club and NTHS
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('id, name')
      .in('name', ['Beta Club', 'NTHS'])
      .eq('is_active', true)

    if (clubError) {
      console.error('Error fetching clubs:', clubError)
      return NextResponse.json({ error: 'Failed to fetch club information' }, { status: 500 })
    }

    console.log('Available clubs:', clubData)

    // Create a map of club names to IDs
    const clubMap = new Map(clubData?.map(club => [club.name, club.id]) || [])

    console.log('Club map:', Object.fromEntries(clubMap))

    // Remove existing club memberships
    const { error: deleteError } = await supabase
      .from('student_clubs')
      .delete()
      .eq('student_id', user.id)

    if (deleteError) {
      console.error('Error removing existing club memberships:', deleteError)
      // Continue with the request even if this fails
    } else {
      console.log('Successfully removed existing club memberships')
    }

    // Add new club memberships
    const clubMemberships = []
    if (beta_club && clubMap.has('Beta Club')) {
      clubMemberships.push({
        student_id: user.id,
        club_id: clubMap.get('Beta Club')
      })
      console.log('Adding Beta Club membership')
    }
    if (nths && clubMap.has('NTHS')) {
      clubMemberships.push({
        student_id: user.id,
        club_id: clubMap.get('NTHS')
      })
      console.log('Adding NTHS membership')
    }

    console.log('Club memberships to insert:', clubMemberships)

    if (clubMemberships.length > 0) {
      const { error: insertError } = await supabase
        .from('student_clubs')
        .insert(clubMemberships)

      if (insertError) {
        console.error('Error creating club memberships:', insertError)
        return NextResponse.json({ error: 'Failed to create club memberships' }, { status: 500 })
      }
      
      console.log('Successfully inserted club memberships')
    } else {
      console.log('No club memberships to insert')
    }

    // Update profile with club information and mark setup as completed
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        beta_club: beta_club,
        nths: nths,
        clubs_completed: true,
        clubs_setup_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Club update error:', updateError)
      return NextResponse.json({ error: 'Failed to update club information' }, { status: 500 })
    }

    console.log('Successfully updated profile with club information:', {
      beta_club: updatedProfile.beta_club,
      nths: updatedProfile.nths,
      clubs_completed: updatedProfile.clubs_completed,
      clubs_setup_completed: updatedProfile.clubs_setup_completed
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        beta_club: updatedProfile.beta_club,
        nths: updatedProfile.nths,
        clubs_completed: updatedProfile.clubs_completed,
        clubs_setup_completed: updatedProfile.clubs_setup_completed
      }
    })

  } catch (error) {
    console.error('Club API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if student
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, clubs_setup_completed')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 })
    }

    // Fetch only Beta Club and NTHS
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, description')
      .in('name', ['Beta Club', 'NTHS'])
      .eq('is_active', true)
      .order('name')

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
    }

    return NextResponse.json({
      clubs: clubs || [],
      clubs_setup_completed: profile.clubs_setup_completed || false
    })
  } catch (error) {
    console.error('Clubs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
