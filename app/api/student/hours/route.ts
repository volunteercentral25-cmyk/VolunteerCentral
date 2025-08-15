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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get volunteer hours with opportunity details
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer_opportunities (
          title,
          location
        )
      `)
      .eq('student_id', profile.id)
      .order('date', { ascending: false })

    if (hoursError) {
      return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })
    }

    // Calculate summary statistics
    const totalHours = hoursData?.reduce((sum, hour) => sum + Number(hour.hours), 0) || 0
    const approvedCount = hoursData?.filter(hour => hour.status === 'approved').length || 0
    const pendingCount = hoursData?.filter(hour => hour.status === 'pending').length || 0

    const hoursList = hoursData?.map(hour => ({
      id: hour.id,
      activity: hour.description || hour.volunteer_opportunities?.title || 'Volunteer Activity',
      hours: hour.hours,
      date: hour.date,
      description: hour.description,
      status: hour.status,
      location: hour.volunteer_opportunities?.location || 'N/A'
    })) || []

    return NextResponse.json({
      hours: hoursList,
      summary: {
        totalHours,
        approvedCount,
        pendingCount
      }
    })
  } catch (error) {
    console.error('Hours API error:', error)
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { activity, hours, date, description } = body

    // Validate required fields
    if (!activity || !hours || !date || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert new volunteer hours
    const { data: newHour, error: insertError } = await supabase
      .from('volunteer_hours')
      .insert({
        student_id: profile.id,
        hours: Number(hours),
        date: date,
        description: description,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to log hours' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      hour: newHour 
    })
  } catch (error) {
    console.error('Hours POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
