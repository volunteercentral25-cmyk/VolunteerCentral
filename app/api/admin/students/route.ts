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
      .from('profiles')
      .select(`
        *,
        volunteer_hours(id, hours, status),
        opportunity_registrations(id, status)
      `)
      .eq('role', 'student')

    // Add search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`)
    }

    // Note: Removed status filter since all students should be active
    // If you need status filtering, you can add it based on other criteria

    // Get total count for pagination
    const { count } = await query

    // Get paginated results
    const { data: students, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Calculate additional stats for each student
    const studentsWithStats = students?.map(student => {
      const hours = student.volunteer_hours || []
      const registrations = student.opportunity_registrations || []
      
      return {
        ...student,
        totalHours: hours.reduce((sum: any, h: any) => sum + (h.hours || 0), 0),
        approvedHours: hours.filter((h: any) => h.status === 'approved').reduce((sum: any, h: any) => sum + (h.hours || 0), 0),
        pendingHours: hours.filter((h: any) => h.status === 'pending').length,
        totalRegistrations: registrations.length,
        activeRegistrations: registrations.filter((r: any) => r.status === 'pending').length,
        status: 'active' // All students are considered active
      }
    }) || []

    return NextResponse.json({
      students: studentsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin students API error:', error)
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
    const { studentId, updates } = body

    if (!studentId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update student profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', studentId)
      .eq('role', 'student')
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, student: data })
  } catch (error) {
    console.error('Admin update student API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
