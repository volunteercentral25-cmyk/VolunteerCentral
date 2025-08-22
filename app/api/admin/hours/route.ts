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

    // Get URL parameters for pagination and search
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('volunteer_hours')
      .select(`
        *,
        profiles!inner(full_name, email, student_id)
      `)

    // Add search filter
    if (search) {
      query = query.or(`description.ilike.%${search}%,profiles.full_name.ilike.%${search}%,profiles.email.ilike.%${search}%`)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count } = await query

    // Get paginated results
    const { data: hours, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Transform the data to match the expected interface
    const transformedHours = hours?.map(hour => ({
      ...hour,
      activity: hour.description || 'No description provided', // Map description to activity for frontend compatibility
      location: hour.location || 'N/A' // Add location field if it doesn't exist
    })) || []

    return NextResponse.json({
      hours: transformedHours,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
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
    const { hoursId, status, notes } = body

    if (!hoursId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update hours status
    const { data, error } = await supabase
      .from('volunteer_hours')
      .update({
        status,
        verified_by: profile.email,
        verification_date: new Date().toISOString(),
        verification_notes: notes || null
      })
      .eq('id', hoursId)
      .select(`
        *,
        profiles!inner(full_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, hours: data })
  } catch (error) {
    console.error('Admin update hours API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
