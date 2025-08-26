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

    // Use RPC functions to bypass RLS (these functions don't accept parameters)
    console.log('Calling RPC functions...')
    const [studentsResult, countResult] = await Promise.all([
      // Get students with stats
      supabase.rpc('get_admin_students_with_stats'),
      // Get total count
      supabase.rpc('get_admin_students_count')
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

    let students = studentsResult.data || []
    let totalCount = countResult.data || 0

    // Apply client-side filtering
    if (search) {
      const searchLower = search.toLowerCase()
      students = students.filter((student: any) => 
        student.full_name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.student_id?.toLowerCase().includes(searchLower)
      )
    }

    if (club) {
      const clubLower = club.toLowerCase()
      students = students.filter((student: any) => 
        student.beta_club?.toLowerCase().includes(clubLower) ||
        student.nths?.toLowerCase().includes(clubLower)
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStudents = students.slice(startIndex, endIndex)
    const filteredTotalCount = students.length

    console.log('Filtered students data:', paginatedStudents)
    console.log('Filtered total count:', filteredTotalCount)

    // Transform the data to match the expected interface
    const studentsWithStats = paginatedStudents.map((student: any) => ({
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
      approvedHours: student.total_hours || 0, // All hours in the RPC are approved
      pendingHours: 0, // We'll need to calculate this separately if needed
      totalRegistrations: student.total_opportunities || 0,
      activeRegistrations: student.total_opportunities || 0,
      status: student.status || 'active'
    }))

    console.log('Transformed students data:', studentsWithStats)

    const response = {
      students: studentsWithStats,
      pagination: {
        page,
        limit,
        total: filteredTotalCount,
        totalPages: Math.ceil(filteredTotalCount / limit)
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
