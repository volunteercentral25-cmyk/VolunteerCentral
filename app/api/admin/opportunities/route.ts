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
      .from('volunteer_opportunities')
      .select(`
        *,
        opportunity_registrations(id, status, profiles!inner(full_name))
      `)

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Add status filter (future/ongoing/past)
    if (status) {
      const today = new Date().toISOString().split('T')[0]
      if (status === 'future') {
        query = query.gte('date', today)
      } else if (status === 'past') {
        query = query.lt('date', today)
      }
    }

    // Get total count for pagination
    const { count } = await query

    // Get paginated results
    const { data: opportunities, error } = await query
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Calculate additional stats for each opportunity
    const opportunitiesWithStats = opportunities?.map(opportunity => {
      const registrations = opportunity.opportunity_registrations || []
      
      return {
        ...opportunity,
        totalRegistrations: registrations.length,
        pendingRegistrations: registrations.filter((r: any) => r.status === 'pending').length,
        confirmedRegistrations: registrations.filter((r: any) => r.status === 'approved').length,
        isFull: registrations.length >= (opportunity.max_volunteers || 10),
        isPast: new Date(opportunity.date) < new Date()
      }
    }) || []

    return NextResponse.json({
      opportunities: opportunitiesWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin opportunities API error:', error)
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
    const { title, description, location, date, start_time, end_time, max_volunteers } = body

    if (!title || !description || !location || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new opportunity
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert({
        title,
        description,
        location,
        date,
        start_time,
        end_time,
        max_volunteers: max_volunteers || 10
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, opportunity: data })
  } catch (error) {
    console.error('Admin create opportunity API error:', error)
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
    const { opportunityId, updates } = body

    if (!opportunityId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update opportunity
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .update(updates)
      .eq('id', opportunityId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, opportunity: data })
  } catch (error) {
    console.error('Admin update opportunity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const { opportunityId } = body

    if (!opportunityId) {
      return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 })
    }

    // Delete opportunity (this will cascade delete registrations)
    const { error } = await supabase
      .from('volunteer_opportunities')
      .delete()
      .eq('id', opportunityId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete opportunity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
