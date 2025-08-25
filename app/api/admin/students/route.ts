import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin students API called')
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
    const club = searchParams.get('club') || ''

    console.log('Parameters:', { page, limit, search, status, club })

    // Use RPC functions to bypass RLS
    console.log('Calling RPC functions...')
    const [studentsResult, countResult] = await Promise.all([
      // Get students with stats
      supabase.rpc('get_admin_students_with_stats', {
        search_term: search,
        status_filter: status,
        club_filter: club,
        page_num: page,
        page_size: limit
      }),
      // Get total count
      supabase.rpc('get_admin_students_count', {
        search_term: search,
        club_filter: club
      })
    ])
    
    console.log('RPC calls completed')

    console.log('Students result:', studentsResult)
    console.log('Count result:', countResult)

    if (studentsResult.error) {
      console.error('Error getting students:', studentsResult.error)
      throw studentsResult.error
    }

    if (countResult.error) {
      console.error('Error getting count:', countResult.error)
      throw countResult.error
    }

    const students = studentsResult.data || []
    const totalCount = countResult.data || 0

    console.log('Raw students data:', students)
    console.log('Total count:', totalCount)
    console.log('Total count type:', typeof totalCount)
    console.log('Students array length:', students.length)

    // Transform the data to match the expected interface
    const studentsWithStats = students.map((student: any) => ({
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      student_id: student.student_id,
      phone: student.phone,
      bio: student.bio,
      role: student.role,
      created_at: student.created_at,
      updated_at: student.updated_at,
      totalHours: student.total_hours || 0,
      approvedHours: student.approved_hours || 0,
      pendingHours: student.pending_hours_count || 0,
      totalRegistrations: student.total_registrations || 0,
      activeRegistrations: student.active_registrations || 0,
      status: student.status || 'active'
    }))

    console.log('Transformed students data:', studentsWithStats)

    const response = {
      students: studentsWithStats,
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
