import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Export data API called')
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
        volunteerHours: [],
        opportunities: [],
        registrations: [],
        summary: {
          totalStudents: 0,
          totalHours: 0,
          approvedHours: 0,
          pendingHours: 0,
          deniedHours: 0,
          totalOpportunities: 0,
          totalRegistrations: 0
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

    // Get all students in supervised clubs with their details
    console.log('Fetching students...')
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        student_id,
        phone,
        bio,
        created_at,
        updated_at,
        beta_club,
        nths
      `)
      .eq('role', 'student')
      .or(studentFilter)
      .order('full_name')

    if (studentsError) {
      console.error('Error getting students:', studentsError)
      return NextResponse.json({ error: 'Failed to get students' }, { status: 500 })
    }

    console.log('Students found:', students?.length || 0)

    // Get all volunteer hours for these students
    console.log('Fetching volunteer hours...')
    let volunteerHours: any[] = []
    if (students && students.length > 0) {
      const { data: hours, error: hoursError } = await supabase
        .from('volunteer_hours')
        .select(`
          id,
          hours,
          date,
          description,
          status,
          verification_email,
          created_at,
          verification_date,
          verified_by,
          verification_notes,
          student_id
        `)
        .in('student_id', students.map(s => s.id))
        .order('created_at', { ascending: false })

      if (hoursError) {
        console.error('Error getting volunteer hours:', hoursError)
        return NextResponse.json({ error: 'Failed to get volunteer hours' }, { status: 500 })
      }
      volunteerHours = hours || []
    }

    console.log('Volunteer hours found:', volunteerHours.length)

    // Get student profiles for volunteer hours separately
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, student_id, phone, beta_club, nths')
      .in('id', students.map(s => s.id))

    if (profilesError) {
      console.error('Error getting student profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to get student profiles' }, { status: 500 })
    }

    // Create a map of student profiles
    const studentProfileMap = new Map()
    studentProfiles?.forEach(profile => {
      studentProfileMap.set(profile.id, profile)
    })

    // Get all opportunities for supervised clubs
    console.log('Fetching opportunities...')
    let opportunities: any[] = []
    if (clubIds && clubIds.length > 0) {
      const { data: opps, error: opportunitiesError } = await supabase
        .from('volunteer_opportunities')
        .select(`
          id,
          title,
          description,
          date,
          location,
          created_at,
          club_id
        `)
        .in('club_id', clubIds)
        .order('date', { ascending: false })

      if (opportunitiesError) {
        console.error('Error getting opportunities:', opportunitiesError)
        return NextResponse.json({ error: 'Failed to get opportunities' }, { status: 500 })
      }
      opportunities = opps || []
    }

    console.log('Opportunities found:', opportunities.length)

    // Get club names for opportunities separately
    let clubs: any[] = []
    if (clubIds && clubIds.length > 0) {
      const { data: clubData, error: clubsDataError } = await supabase
        .from('clubs')
        .select('id, name')
        .in('id', clubIds)

      if (clubsDataError) {
        console.error('Error getting clubs:', clubsDataError)
        return NextResponse.json({ error: 'Failed to get clubs' }, { status: 500 })
      }
      clubs = clubData || []
    }

    // Create a map of clubs
    const clubMap = new Map()
    clubs?.forEach(club => {
      clubMap.set(club.id, club)
    })

    // Get opportunity registrations
    console.log('Fetching registrations...')
    let registrations: any[] = []
    if (opportunities && opportunities.length > 0) {
      const { data: regs, error: registrationsError } = await supabase
        .from('opportunity_registrations')
        .select(`
          id,
          status,
          created_at,
          student_id,
          opportunity_id
        `)
        .in('opportunity_id', opportunities.map(o => o.id))
        .order('created_at', { ascending: false })

      if (registrationsError) {
        console.error('Error getting registrations:', registrationsError)
        return NextResponse.json({ error: 'Failed to get registrations' }, { status: 500 })
      }
      registrations = regs || []
    }

    console.log('Registrations found:', registrations.length)

    // Calculate summary statistics
    console.log('Calculating summary statistics...')
    const totalStudents = students.length
    const totalHours = volunteerHours.reduce((sum, hour) => sum + (hour.hours || 0), 0)
    const approvedHours = volunteerHours
      .filter(hour => hour.status === 'approved')
      .reduce((sum, hour) => sum + (hour.hours || 0), 0)
    const pendingHours = volunteerHours
      .filter(hour => hour.status === 'pending')
      .reduce((sum, hour) => sum + (hour.hours || 0), 0)
    const deniedHours = volunteerHours
      .filter(hour => hour.status === 'denied')
      .reduce((sum, hour) => sum + (hour.hours || 0), 0)

    console.log('Summary stats:', { totalStudents, totalHours, approvedHours, pendingHours, deniedHours })

    // Prepare CSV data
    console.log('Preparing CSV data...')
    const csvData = {
      summary: {
        totalStudents,
        totalHours,
        approvedHours,
        pendingHours,
        deniedHours,
        totalOpportunities: opportunities.length,
        totalRegistrations: registrations.length
      },
      students: students.map(student => {
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
          name: student.full_name,
          email: student.email,
          studentId: student.student_id,
          phone: student.phone || '',
          bio: student.bio || '',
          club: clubName,
          joinedDate: new Date(student.created_at).toLocaleDateString(),
          lastUpdated: new Date(student.updated_at).toLocaleDateString()
        }
      }),
      volunteerHours: volunteerHours.map(hour => {
        const studentProfile = studentProfileMap.get(hour.student_id)
        
        // Determine club name based on boolean values
        let clubName = 'None'
        if (studentProfile?.beta_club && studentProfile?.nths) {
          clubName = 'Beta Club, NTHS'
        } else if (studentProfile?.beta_club) {
          clubName = 'Beta Club'
        } else if (studentProfile?.nths) {
          clubName = 'NTHS'
        }
        
        return {
          studentName: studentProfile?.full_name || 'Unknown',
          studentEmail: studentProfile?.email || 'Unknown',
          studentId: studentProfile?.student_id || 'Unknown',
          studentPhone: studentProfile?.phone || '',
          club: clubName,
          hours: hour.hours,
          date: hour.date,
          description: hour.description,
          status: hour.status,
          verificationEmail: hour.verification_email || '',
          submittedDate: new Date(hour.created_at).toLocaleDateString(),
          verifiedDate: hour.verification_date ? new Date(hour.verification_date).toLocaleDateString() : '',
          verifiedBy: hour.verified_by || '',
          notes: hour.verification_notes || ''
        }
      }),
      opportunities: opportunities.map(opp => ({
        title: opp.title,
        description: opp.description,
        date: opp.date,
        location: opp.location,
        club: clubMap.get(opp.club_id)?.name || 'Unknown',
        createdDate: new Date(opp.created_at).toLocaleDateString()
      })),
      registrations: registrations.map(reg => ({
        studentName: studentProfileMap.get(reg.student_id)?.full_name || 'Unknown',
        studentEmail: studentProfileMap.get(reg.student_id)?.email || 'Unknown',
        studentId: studentProfileMap.get(reg.student_id)?.student_id || 'Unknown',
        opportunity: opportunities.find(o => o.id === reg.opportunity_id)?.title || 'Unknown',
        opportunityDate: opportunities.find(o => o.id === reg.opportunity_id)?.date || 'Unknown',
        club: clubMap.get(opportunities.find(o => o.id === reg.opportunity_id)?.club_id)?.name || 'Unknown',
        status: reg.status,
        registeredDate: new Date(reg.created_at).toLocaleDateString()
      }))
    }

    console.log('CSV data prepared successfully')
    return NextResponse.json(csvData)
  } catch (error) {
    console.error('Export data API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
