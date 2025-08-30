import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const clubFilter = searchParams.get('club')
    const includeAllStudents = searchParams.get('all') === 'true'

    // Build the query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        student_id,
        role,
        beta_club,
        nths,
        clubs_completed,
        created_at,
        updated_at,
        student_clubs (
          clubs (
            name
          )
        )
      `)
      .eq('role', 'student')

    // Apply club filter if specified
    if (clubFilter && !includeAllStudents) {
      query = query.eq('student_clubs.clubs.name', clubFilter)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Format data for Excel
    const excelData = students?.map(student => ({
      'Student ID': student.student_id || 'N/A',
      'Full Name': student.full_name || 'N/A',
      'Email': student.email || 'N/A',
      'Phone': student.phone || 'N/A',
      'Beta Club': student.beta_club ? 'Yes' : 'No',
      'NTHS': student.nths ? 'Yes' : 'No',
      'Clubs Completed': student.clubs_completed ? 'Yes' : 'No',
      'Clubs': Array.isArray(student.student_clubs) 
        ? student.student_clubs.map((sc: any) => sc.clubs?.name).filter(Boolean).join(', ')
        : 'None',
      'Registration Date': student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A',
      'Last Updated': student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'N/A'
    })) || []

    // Generate CSV content
    const headers = Object.keys(excelData[0] || {})
    const csvContent = [
      headers.join(','),
      ...excelData.map((row: any) => 
        headers.map(header => {
          const value = row[header] || ''
          // Escape commas and quotes in CSV
          return `"${value.toString().replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    // Create response with CSV headers
    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', `attachment; filename="students_export_${new Date().toISOString().split('T')[0]}.csv"`)
    
    return response

  } catch (error) {
    console.error('Error exporting students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
