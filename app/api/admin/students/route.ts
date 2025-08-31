import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== STUDENTS API DEBUG START ===')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const club = searchParams.get('club') || ''

    console.log('Request parameters:', { page, limit, search, club })

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

    // Get admin's supervised clubs - handle missing table gracefully
    let supervisedClubs = null
    let clubsError = null
    try {
      const { data: clubsData, error: clubsErr } = await supabase
        .from('admin_club_supervision')
        .select('club_id')
        .eq('admin_id', user.id)
      
      supervisedClubs = clubsData
      clubsError = clubsErr
    } catch (error) {
      console.error('Error accessing admin_club_supervision table:', error)
      clubsError = error
    }

    if (clubsError) {
      console.error('Error getting supervised clubs:', clubsError)
    }

    // If admin hasn't selected clubs yet or table doesn't exist, return empty data
    if (!supervisedClubs || supervisedClubs.length === 0) {
      console.log('No supervised clubs found, returning empty data')
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
    console.log('Club IDs:', clubIds)
    
    // Get the names of supervised clubs to filter students properly - handle missing table gracefully
    let clubNames = null
    let clubNamesError = null
    try {
      const { data: namesData, error: namesErr } = await supabase
        .from('clubs')
        .select('id, name')
        .in('id', clubIds)
      
      clubNames = namesData
      clubNamesError = namesErr
    } catch (error) {
      console.error('Error accessing clubs table:', error)
      clubNamesError = error
    }
    
    if (clubNamesError) {
      console.error('Error getting club names:', clubNamesError)
    }
    
    const supervisedClubNames = clubNames?.map(c => c.name) || []
    console.log('Supervised club names:', supervisedClubNames)

    // Safety check - if no club names found, return empty data
    if (supervisedClubNames.length === 0) {
      console.log('No club names found, returning empty data')
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

    console.log('Parameters:', { page, limit, search, club })

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

    // Apply club filter based on supervised clubs
    if (supervisedClubNames.includes('Beta Club') && supervisedClubNames.includes('NTHS')) {
      studentsQuery = studentsQuery.or('beta_club.eq.true,nths.eq.true')
    } else if (supervisedClubNames.includes('Beta Club')) {
      studentsQuery = studentsQuery.eq('beta_club', true)
    } else if (supervisedClubNames.includes('NTHS')) {
      studentsQuery = studentsQuery.eq('nths', true)
    } else {
      // If no clubs selected, return empty result
      studentsQuery = studentsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }

    console.log('Executing students query...')
    // Execute the base query first
    const { data: students, error: studentsError } = await studentsQuery

    if (studentsError) {
      console.error('Error getting students:', studentsError)
      return NextResponse.json({ error: 'Failed to get students' }, { status: 500 })
    }

    console.log('Students found:', students?.length || 0)

    // Apply search filter in memory if needed
    let filteredStudents = students || []
    if (search) {
      filteredStudents = filteredStudents.filter((student: any) => 
        student.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply additional club filter if specified
    if (club) {
      if (club === 'Beta Club') {
        filteredStudents = filteredStudents.filter((student: any) => student.beta_club === true)
      } else if (club === 'NTHS') {
        filteredStudents = filteredStudents.filter((student: any) => student.nths === true)
      }
    }

    console.log('Filtered students:', filteredStudents.length)

    // Get volunteer hours for these students
    const studentIds = filteredStudents.map(s => s.id) || []
    console.log('Student IDs for hours query:', studentIds.length)
    
    const { data: volunteerHours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('student_id, hours, status')
      .in('student_id', studentIds)

    if (hoursError) {
      console.error('Error getting volunteer hours:', hoursError)
    }

    console.log('Volunteer hours found:', volunteerHours?.length || 0)

    // Calculate stats for each student
    const studentsWithStats = filteredStudents.map((student: any) => {
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
    
    console.log('Students data:', paginatedStudents.length)
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
    console.log('=== STUDENTS API DEBUG END ===')
    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin students API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
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
