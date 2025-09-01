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

    // Get only NTHS and Beta Club
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, description')
      .in('name', ['NTHS', 'Beta Club'])
      .eq('is_active', true)

    if (clubsError) {
      console.error('Error getting clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to load clubs' }, { status: 500 })
    }

    // Get admin's currently supervised clubs
    const { data: supervisedClubs, error: supervisionError } = await supabase
      .from('admin_club_supervision')
      .select('club_id')
      .eq('admin_id', user.id)

    if (supervisionError) {
      console.error('Error getting supervised clubs:', supervisionError)
    }

    const supervisedClubIds = supervisedClubs?.map(sc => sc.club_id) || []

    return NextResponse.json({
      clubs: clubs || [],
      supervisedClubIds: supervisedClubIds
    })
  } catch (error) {
    console.error('Club selection API error:', error)
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

    const { clubIds } = await request.json()

    if (!Array.isArray(clubIds)) {
      return NextResponse.json({ error: 'Invalid club IDs' }, { status: 400 })
    }

    // Validate that the club IDs correspond to NTHS or Beta Club
    const { data: validClubs, error: validationError } = await supabase
      .from('clubs')
      .select('id, name')
      .in('id', clubIds)
      .in('name', ['NTHS', 'Beta Club'])

    if (validationError) {
      console.error('Error validating clubs:', validationError)
      return NextResponse.json({ error: 'Failed to validate clubs' }, { status: 500 })
    }

    if (validClubs.length !== clubIds.length) {
      return NextResponse.json({ error: 'Invalid club selection' }, { status: 400 })
    }

    // Delete existing supervision records
    const { error: deleteError } = await supabase
      .from('admin_club_supervision')
      .delete()
      .eq('admin_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing supervision:', deleteError)
      return NextResponse.json({ error: 'Failed to update supervision' }, { status: 500 })
    }

    // Insert new supervision records
    if (clubIds.length > 0) {
      const supervisionRecords = clubIds.map(clubId => ({
        admin_id: user.id,
        club_id: clubId
      }))

      const { error: insertError } = await supabase
        .from('admin_club_supervision')
        .insert(supervisionRecords)

      if (insertError) {
        console.error('Error inserting supervision records:', insertError)
        return NextResponse.json({ error: 'Failed to save supervision' }, { status: 500 })
      }
    }

    // Mark club setup as completed
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        clubs_setup_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileUpdateError) {
      console.error('Error updating profile clubs_setup_completed:', profileUpdateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Club supervision updated successfully',
      supervisedClubs: validClubs
    })
  } catch (error) {
    console.error('Club selection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
