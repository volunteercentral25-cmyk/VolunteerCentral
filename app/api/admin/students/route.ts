import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const club = searchParams.get('club') || ''

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

    // Get admin's supervised clubs
    const { data: supervisedClubs, error: clubsError } = await supabase
      .from('admin_club_supervision')
      .select('club_id')
      .eq('admin_id', user.id)

    if (clubsError) {
      console.error('Error getting supervised clubs:', clubsError)
    }

    // If admin hasn't selected clubs yet, return empty data
    if (!supervisedClubs || supervisedClubs.length === 0) {
      return NextResponse.json({
        students: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Get club IDs for filtering
    const clubIds = supervisedClubs.map(sc => sc.club_id)
    
    // Get the names of supervised clubs to filter students properly
    const { data: clubNames, error: clubNamesError } = await supabase
      .from('clubs')
      .select('id, name')
      .in('id', clubIds)
    
    if (clubNamesError) {
      console.error('Error getting club names:', clubNamesError)
    }
    
    const supervisedClubNames = clubNames?.map(c => c.name) || []
    console.log('Supervised club names:', supervisedClubNames)

    // Build the correct filter based on supervised clubs
    let studentFilter = ''
    if (supervisedClubNames.includes('Beta Club')) {
      studentFilter += 'beta_club.eq.true'
    }
    if (supervisedClubNames.includes('NTHS')) {
      if (studentFilter) studentFilter += ','
      studentFilter += 'nths.eq.true'
    }
    
    // If no clubs selected, use empty filter
    if (!studentFilter) {
      studentFilter = 'id.eq.00000000-0000-0000-0000-000000000000' // Impossible ID
    }

    console.log('Student filter:', studentFilter)

    // Get URL parameters for pagination and search
    // const { searchParams } = new URL(request.url)
    // const page = parseInt(searchParams.get('page') || '1')
    // const limit = parseInt(searchParams.get('limit') || '20')
    // const search = searchParams.get('search') || ''
    // const status = searchParams.get('status') || ''
    // const club = searchParams.get('club') || ''

    console.log('Parameters:', { page, limit, search, status, club })

    // Get students in supervised clubs with stats
    let studentsQuery = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        student_id,
        phone,
        bio,
        role,
        created_at,
        updated_at,
        beta_club,
        nths
      `)
      .eq('role', 'student')
      .or(studentFilter)

    // Apply search filter
    if (search) {
      studentsQuery = studentsQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`)
    }

    // Apply club filter
    if (club) {
      if (club === 'Beta Club') {
        studentsQuery = studentsQuery.eq('beta_club', true)
      } else if (club === 'NTHS') {
        studentsQuery = studentsQuery.eq('nths', true)
      }
    }

    const { data: students, error: studentsError } = await studentsQuery

    if (studentsError) {
      console.error('Error getting students:', studentsError)
      return NextResponse.json({ error: 'Failed to get students' }, { status: 500 })
    }

    // Get volunteer hours for these students
    const studentIds = students?.map(s => s.id) || []
    const { data: volunteerHours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('student_id, hours, status')
      .in('student_id', studentIds)

    if (hoursError) {
      console.error('Error getting volunteer hours:', hoursError)
    }

    // Calculate stats for each student
    const studentsWithStats = (students || []).map((student: any) => {
      const studentHours = volunteerHours?.filter(h => h.student_id === student.id) || []
      const totalHours = studentHours.reduce((sum, h) => sum + (h.hours || 0), 0)
      const approvedHours = studentHours.filter(h => h.status === 'approved').reduce((sum, h) => sum + (h.hours || 0), 0)
      const pendingHours = studentHours.filter(h => h.status === 'pending').reduce((sum, h) => sum + (h.hours || 0), 0)

      // Determine club name based on boolean values
      let clubName = 'None'
      if (student.beta_club && student.nths) {
        clubName = 'Beta Club, NTHS'
      } else if (student.beta_club) {
        clubName = 'Beta Club'
      } else if (student.nths) {
        clubName = 'NTHS'
      }

      return {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        student_id: student.student_id,
        phone: student.phone,
        bio: student.bio,
        role: student.role,
        created_at: student.created_at,
        updated_at: student.updated_at,
        club: clubName,
        totalHours,
        approvedHours,
        pendingHours,
        totalRegistrations: 0, // Will be calculated separately if needed
        activeRegistrations: 0,
        status: 'active'
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStudents = studentsWithStats.slice(startIndex, endIndex)
    const totalCount = studentsWithStats.length
    
    console.log('Students data:', paginatedStudents)
    console.log('Total count:', totalCount)

    const response = {
      students: paginatedStudents,
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
