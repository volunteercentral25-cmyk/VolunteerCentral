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

    // Get admin's supervised clubs
    const { data: supervisedClubs, error: clubsError } = await supabase
      .from('admin_club_supervision')
      .select('club_id')
      .eq('admin_id', user.id)

    if (clubsError) {
      console.error('Error getting supervised clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to get supervised clubs' }, { status: 500 })
    }

    // If admin hasn't selected clubs, return empty data
    if (!supervisedClubs || supervisedClubs.length === 0) {
      return NextResponse.json({
        opportunities: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      })
    }

    const clubIds = supervisedClubs.map(sc => sc.club_id)

    // Get URL parameters for pagination and search
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const club = searchParams.get('club') || ''

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        opportunity_registrations(
          id, 
          status, 
          student_id
        )
      `, { count: 'exact' })
      .in('club_id', clubIds)

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

    // Add club filter - simplified approach
    if (club) {
      if (club === 'beta_club') {
        query = query.or('club_restriction.eq.beta_club,club_restriction.eq.anyone')
      } else if (club === 'nths') {
        query = query.or('club_restriction.eq.nths,club_restriction.eq.anyone')
      } else if (club === 'both') {
        query = query.or('club_restriction.eq.both,club_restriction.eq.anyone')
      }
    }

    // Get paginated results and count
    const { data: opportunities, error, count } = await query
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Calculate additional stats for each opportunity
    const opportunitiesWithStats = opportunities?.map(opportunity => {
      const registrations = opportunity.opportunity_registrations || []
      const activeRegistrations = registrations.filter((r: any) => r.status !== 'denied')
      
      return {
        ...opportunity,
        totalRegistrations: activeRegistrations.length,
        pendingRegistrations: registrations.filter((r: any) => r.status === 'pending').length,
        confirmedRegistrations: registrations.filter((r: any) => r.status === 'approved').length,
        isFull: activeRegistrations.length >= (opportunity.max_volunteers || 10),
        isPast: new Date(opportunity.date) < new Date(),
        club_restriction: opportunity.club_restriction || 'anyone'
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
    const { title, description, location, date, start_time, end_time, max_volunteers, requirements, club_restriction } = body

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
        max_volunteers: max_volunteers || 10,
        requirements: requirements || null,
        club_restriction: club_restriction || 'anyone',
        created_by: user.id
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
