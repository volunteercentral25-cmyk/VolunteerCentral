import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin hours API called')
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('User not admin:', profile?.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Admin access confirmed')

    // Get URL parameters for pagination and search
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('Parameters:', { page, limit, search, status })

    // Use RPC functions to bypass RLS
    const [hoursResult, countResult] = await Promise.all([
      // Get hours with details
      supabase.rpc('get_admin_hours_with_details', {
        search_term: search,
        status_filter: status,
        page_num: page,
        page_size: limit
      }),
      // Get total count
      supabase.rpc('get_admin_hours_count', {
        search_term: search,
        status_filter: status
      })
    ])

    console.log('Hours result:', hoursResult)
    console.log('Count result:', countResult)

    if (hoursResult.error) {
      console.error('Error getting hours:', hoursResult.error)
      throw hoursResult.error
    }

    if (countResult.error) {
      console.error('Error getting count:', countResult.error)
      throw countResult.error
    }

    const hours = hoursResult.data || []
    const totalCount = countResult.data || 0

    console.log('Raw hours data:', hours)
    console.log('Total count:', totalCount)

    // Transform the data to match the expected interface
    const transformedHours = hours.map((hour: any) => ({
      id: hour.id,
      hours: hour.hours,
      activity: hour.description || 'No description provided',
      date: hour.created_at,
      description: hour.description,
      status: hour.status,
      location: 'N/A', // Add location field for frontend compatibility
      verification_email: hour.verification_email,
      verified_by: hour.verified_by,
      verification_date: hour.verification_date,
      verification_notes: hour.verification_notes,
      created_at: hour.created_at,
      profiles: {
        full_name: hour.full_name,
        email: hour.email,
        student_id: hour.student_id_text
      }
    }))

    console.log('Transformed hours data:', transformedHours)

    const response = {
      hours: transformedHours,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }

    console.log('Final response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin hours API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    console.log('Update request body:', body)
    
    const { hoursId, status, notes } = body

    if (!hoursId || !status) {
      console.error('Missing required fields:', { hoursId, status })
      return NextResponse.json({ error: 'Missing required fields: hoursId and status' }, { status: 400 })
    }

    console.log('Updating hours with:', { hoursId, status, notes })

    // Update hour status
    const { data, error } = await supabase
      .from('volunteer_hours')
      .update({
        status: status,
        verified_by: profile.email, // Use admin's email instead of user ID
        verification_date: new Date().toISOString(),
        verification_notes: notes || null
      })
      .eq('id', hoursId)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    console.log('Successfully updated hours:', data)
    return NextResponse.json({ success: true, hour: data })
  } catch (error) {
    console.error('Admin update hour API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
