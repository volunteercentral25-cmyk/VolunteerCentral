import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get volunteer hours by ID
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer_opportunities (
          title,
          location
        )
      `)
      .eq('id', params.id)
      .single()

    if (hoursError) {
      return NextResponse.json({ error: 'Hours not found' }, { status: 404 })
    }

    // Check if the user owns these hours or is an admin
    if (hoursData.student_id !== profile.id && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const hoursDetails = {
      id: hoursData.id,
      student_id: hoursData.student_id,
      hours: hoursData.hours,
      date: hoursData.date,
      description: hoursData.description,
      status: hoursData.status,
      verification_email: hoursData.verification_email,
      verified_by: hoursData.verified_by,
      verification_date: hoursData.verification_date,
      verification_notes: hoursData.verification_notes,
      created_at: hoursData.created_at,
      updated_at: hoursData.updated_at,
      location: hoursData.volunteer_opportunities?.location || 'N/A'
    }

    return NextResponse.json(hoursDetails)
  } catch (error) {
    console.error('Hours GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
