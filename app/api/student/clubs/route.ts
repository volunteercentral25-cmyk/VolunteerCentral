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

    // Update profile with club information
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        beta_club: beta_club,
        nths: nths,
        clubs_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Club update error:', updateError)
      return NextResponse.json({ error: 'Failed to update club information' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        beta_club: updatedProfile.beta_club,
        nths: updatedProfile.nths,
        clubs_completed: updatedProfile.clubs_completed
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
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 })
    }

    // Fetch all active clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name')

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
    }

    return NextResponse.json(clubs || [])
  } catch (error) {
    console.error('Clubs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
