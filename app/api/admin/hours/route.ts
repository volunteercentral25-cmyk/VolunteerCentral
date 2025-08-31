import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const club = searchParams.get('club') || ''
    const status = searchParams.get('status') || ''

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

    console.log('Parameters:', { page, limit, search, status })

    // Get hours for students in supervised clubs
    // First, get the student IDs that are in supervised clubs
    const { data: studentIds, error: studentIdsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .or(studentFilter)

    if (studentIdsError) {
      console.error('Error getting student IDs:', studentIdsError)
      return NextResponse.json({ error: 'Failed to get student IDs' }, { status: 500 })
    }

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({
        students: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      })
    }

    const studentIdArray = studentIds.map(s => s.id)

    // Now get hours for these students
    let hoursQuery = supabase
      .from('volunteer_hours')
      .select(`
        id,
        hours,
        date,
        description,
        status,
        verification_email,
        verified_by,
        verification_date,
        verification_notes,
        created_at,
        student_id
      `)
      .in('student_id', studentIdArray)

    // Apply status filter
    if (status) {
      hoursQuery = hoursQuery.eq('status', status)
    }

    // Apply search filter
    if (search) {
      hoursQuery = hoursQuery.ilike('description', `%${search}%`)
    }

    const { data: hours, error: hoursError } = await hoursQuery

    if (hoursError) {
      console.error('Error getting hours:', hoursError)
      return NextResponse.json({ error: 'Failed to get hours' }, { status: 500 })
    }

    console.log('Hours result:', hours)

    // Get student profiles separately
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, student_id')
      .in('id', studentIdArray)

    if (profilesError) {
      console.error('Error getting student profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to get student profiles' }, { status: 500 })
    }

    // Create a map of student profiles
    const studentProfileMap = new Map()
    studentProfiles?.forEach(profile => {
      studentProfileMap.set(profile.id, profile)
    })

    // Transform the data to match the expected interface
    const transformedHours = (hours || []).map((hour: any) => {
      const studentProfile = studentProfileMap.get(hour.student_id)
      return {
        id: hour.id,
        hours: hour.hours,
        activity: hour.description || 'No description provided',
        date: hour.date || hour.created_at,
        description: hour.description,
        status: hour.status,
        verification_email: hour.verification_email,
        verified_by: hour.verified_by,
        verification_date: hour.verification_date,
        verification_notes: hour.verification_notes,
        created_at: hour.created_at,
        student_id: hour.student_id,
        profiles: {
          full_name: studentProfile?.full_name || 'Unknown',
          email: studentProfile?.email || 'Unknown',
          student_id: studentProfile?.student_id || 'Unknown'
        }
      }
    })

    // Group hours by student
    const studentsMap = new Map()
    
    transformedHours.forEach((hour) => {
      const studentId = hour.student_id
      const studentName = hour.profiles.full_name
      const studentEmail = hour.profiles.email
      const studentIdText = hour.profiles.student_id
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          full_name: studentName,
          email: studentEmail,
          student_id: studentIdText,
          hours: [],
          total_hours: 0,
          pending_hours: 0,
          approved_hours: 0,
          denied_hours: 0
        })
      }
      
      const student = studentsMap.get(studentId)
      student.hours.push(hour)
      student.total_hours += hour.hours
      
      if (hour.status === 'pending') {
        student.pending_hours += hour.hours
      } else if (hour.status === 'approved') {
        student.approved_hours += hour.hours
      } else if (hour.status === 'denied') {
        student.denied_hours += hour.hours
      }
    })

    // Convert map to array and sort by student name
    const students = Array.from(studentsMap.values()).sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    )

    // Apply pagination to students
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStudents = students.slice(startIndex, endIndex)
    const filteredTotalCount = students.length

    console.log('Grouped students data:', paginatedStudents)
    console.log('Filtered total count:', filteredTotalCount)

    const response = {
      students: paginatedStudents,
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

            // Send email notification when hours are approved or denied
        if (status === 'approved' || status === 'denied') {
          try {
            // Get the student email from the hours record
            const { data: hoursWithStudent, error: studentError } = await supabase
              .from('volunteer_hours')
              .select(`
                *,
                profiles!inner (
                  email,
                  full_name
                )
              `)
              .eq('id', hoursId)
              .single()

            if (studentError || !hoursWithStudent) {
              console.error('❌ Failed to get student info for email:', studentError)
              throw new Error('Could not get student information')
            }

            console.log('🔔 ADMIN API: Triggering email notification for status:', status)
            console.log('📧 Student email:', hoursWithStudent.profiles.email)
            console.log('📍 EMAIL URL:', `${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-hours-notification`)
            
            const emailPayload = {
              hours_id: hoursId,
              student_email: hoursWithStudent.profiles.email,
              status: status,
              admin_id: user.id,
              notes: notes
            }
            console.log('📦 Flask Email payload:', emailPayload)
            
            // Try Flask email service first (same as verification system)
            let emailSent = false
            try {
              const flaskResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-hours-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload),
              })

              console.log('📬 Flask email service response status:', flaskResponse.status)
              
              if (flaskResponse.ok) {
                const result = await flaskResponse.json()
                console.log('✅ Flask hours notification email sent successfully:', result)
                emailSent = true
              } else {
                const errorText = await flaskResponse.text()
                console.error('❌ Flask email service failed:', errorText)
              }
            } catch (flaskError) {
              console.error('💥 Flask email service error:', flaskError)
            }

            // Fallback to Next.js email service if Flask failed
            if (!emailSent) {
              console.log('🔄 Falling back to Next.js email service...')
              try {
                const nextjsPayload = {
                  hoursId: hoursId,
                  action: status === 'approved' ? 'approve' : 'deny',
                  reason: notes,
                  bypassAuth: false  // Admin call, so keep auth check
                }
                
                const nextjsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email-service/send-hours-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(nextjsPayload),
                })

                console.log('📬 Next.js email service response status:', nextjsResponse.status)
                
                if (nextjsResponse.ok) {
                  const result = await nextjsResponse.json()
                  console.log('✅ Next.js hours notification email sent successfully:', result)
                  emailSent = true
                } else {
                  const errorText = await nextjsResponse.text()
                  console.error('❌ Next.js email service also failed:', errorText)
                }
              } catch (nextjsError) {
                console.error('💥 Next.js email service error:', nextjsError)
              }
            }

            if (!emailSent) {
              console.error('💥 All email services failed!')
            }
          } catch (emailError) {
            console.error('💥 Error sending hours notification email:', emailError)
            // Don't fail the update if email fails
          }
        }

    return NextResponse.json({ success: true, hour: data })
  } catch (error) {
    console.error('Admin update hour API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
