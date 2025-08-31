import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all available clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (clubsError) {
      console.error('Error getting clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to get clubs' }, { status: 500 })
    }

    // Get admin's current supervised clubs
    const { data: supervisedClubs, error: supervisedError } = await supabase
      .from('admin_club_supervision')
      .select('club_id')
      .eq('admin_id', user.id)

    if (supervisedError) {
      console.error('Error getting supervised clubs:', supervisedError)
    }

    const supervisedClubIds = supervisedClubs?.map(sc => sc.club_id) || []

    return NextResponse.json({
      clubs: clubs || [],
      supervisedClubIds: supervisedClubIds
    })
  } catch (error) {
    console.error('Admin club selection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { clubIds } = body

    if (!clubIds || !Array.isArray(clubIds)) {
      return NextResponse.json({ error: 'Invalid club IDs' }, { status: 400 })
    }

    // Validate that clubs exist
    const { data: existingClubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id')
      .in('id', clubIds)

    if (clubsError) {
      console.error('Error validating clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to validate clubs' }, { status: 500 })
    }

    if (existingClubs.length !== clubIds.length) {
      return NextResponse.json({ error: 'Some clubs do not exist' }, { status: 400 })
    }

    // Delete existing supervision records
    const { error: deleteError } = await supabase
      .from('admin_club_supervision')
      .delete()
      .eq('admin_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing supervision:', deleteError)
      return NextResponse.json({ error: 'Failed to update club supervision' }, { status: 500 })
    }

    // Insert new supervision records
    const supervisionRecords = clubIds.map(clubId => ({
      admin_id: user.id,
      club_id: clubId
    }))

    const { error: insertError } = await supabase
      .from('admin_club_supervision')
      .insert(supervisionRecords)

    if (insertError) {
      console.error('Error inserting supervision records:', insertError)
      return NextResponse.json({ error: 'Failed to save club supervision' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Club supervision updated successfully'
    })
  } catch (error) {
    console.error('Admin club selection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
