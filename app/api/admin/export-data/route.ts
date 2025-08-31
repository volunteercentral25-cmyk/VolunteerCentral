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

    console.log('Supervised club names:', supervisedClubNames)

    // Get all students in supervised clubs with their details
    console.log('Fetching students...')
    let studentQuery
    if (supervisedClubNames.includes('Beta Club') && supervisedClubNames.includes('NTHS')) {
      studentQuery = supabase
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
        .or('beta_club.eq.true,nths.eq.true')
        .order('full_name')
    } else if (supervisedClubNames.includes('Beta Club')) {
      studentQuery = supabase
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
        .eq('beta_club', true)
        .order('full_name')
    } else if (supervisedClubNames.includes('NTHS')) {
      studentQuery = supabase
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
        .eq('nths', true)
        .order('full_name')
    } else {
      // If no clubs selected, return empty result
      studentQuery = supabase
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
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .order('full_name')
    }
    
    const { data: students, error: studentsError } = await studentQuery

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

    // Get all opportunities for supervised clubs (including those open to all)
    console.log('Fetching opportunities...')
    let opportunities: any[] = []
    if (clubIds && clubIds.length > 0) {
      // First get opportunities for supervised clubs
      const { data: clubOpps, error: clubOppsError } = await supabase
        .from('volunteer_opportunities')
        .select(`
          id,
          title,
          description,
          date,
          location,
          created_at,
          club_id,
          club_restriction
        `)
        .in('club_id', clubIds)
        .order('date', { ascending: false })

      if (clubOppsError) {
        console.error('Error getting club opportunities:', clubOppsError)
        return NextResponse.json({ error: 'Failed to get opportunities' }, { status: 500 })
      }

      // Then get opportunities open to all
      const { data: openOpps, error: openOppsError } = await supabase
        .from('volunteer_opportunities')
        .select(`
          id,
          title,
          description,
          date,
          location,
          created_at,
          club_id,
          club_restriction
        `)
        .eq('club_restriction', 'anyone')
        .order('date', { ascending: false })

      if (openOppsError) {
        console.error('Error getting open opportunities:', openOppsError)
        return NextResponse.json({ error: 'Failed to get opportunities' }, { status: 500 })
      }

      // Combine and deduplicate
      const allOpps = [...(clubOpps || []), ...(openOpps || [])]
      const uniqueOpps = allOpps.filter((opp, index, self) => 
        index === self.findIndex(o => o.id === opp.id)
      )
      opportunities = uniqueOpps
      
      console.log('Opportunities breakdown:', {
        clubOpportunities: clubOpps?.length || 0,
        openOpportunities: openOpps?.length || 0,
        totalUnique: uniqueOpps.length
      })
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

    // Get opportunity registrations (including those for opportunities open to all)
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

    // Prepare CSV data with better formatting
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
          name: student.full_name || 'Unknown',
          email: student.email || 'No email',
          studentId: student.student_id || 'No ID',
          phone: student.phone || 'No phone',
          bio: student.bio || 'No bio',
          club: clubName,
          joinedDate: student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Unknown',
          lastUpdated: student.updated_at ? new Date(student.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Unknown'
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
          studentName: studentProfile?.full_name || 'Unknown Student',
          studentEmail: studentProfile?.email || 'No email',
          studentId: studentProfile?.student_id || 'No ID',
          studentPhone: studentProfile?.phone || 'No phone',
          club: clubName,
          hours: hour.hours || 0,
          date: hour.date ? new Date(hour.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Unknown',
          description: hour.description || 'No description',
          status: hour.status || 'Unknown',
          verificationEmail: hour.verification_email || 'Not provided',
          submittedDate: hour.created_at ? new Date(hour.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Unknown',
          verifiedDate: hour.verification_date ? new Date(hour.verification_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Not verified',
          verifiedBy: hour.verified_by || 'Not verified',
          notes: hour.verification_notes || 'No notes'
        }
      }),
      opportunities: opportunities.map(opp => ({
        title: opp.title || 'Untitled Opportunity',
        description: opp.description || 'No description',
        date: opp.date ? new Date(opp.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : 'No date',
        location: opp.location || 'No location',
        club: opp.club_restriction === 'anyone' ? 'Open to All Students' : (clubMap.get(opp.club_id)?.name || 'Unknown Club'),
        createdDate: opp.created_at ? new Date(opp.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : 'Unknown'
      })),
      registrations: registrations.map(reg => {
        const opportunity = opportunities.find(o => o.id === reg.opportunity_id)
        const studentProfile = studentProfileMap.get(reg.student_id)
        
        return {
          studentName: studentProfile?.full_name || 'Unknown Student',
          studentEmail: studentProfile?.email || 'No email',
          studentId: studentProfile?.student_id || 'No ID',
          opportunity: opportunity?.title || 'Unknown Opportunity',
          opportunityDate: opportunity?.date ? new Date(opportunity.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'No date',
          club: opportunity?.club_restriction === 'anyone' ? 'Open to All Students' : (clubMap.get(opportunity?.club_id)?.name || 'Unknown Club'),
          status: reg.status || 'Unknown',
          registeredDate: reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Unknown'
        }
      })
    }

    console.log('CSV data prepared successfully')
    console.log('Final data summary:', {
      studentsCount: csvData.students.length,
      hoursCount: csvData.volunteerHours.length,
      opportunitiesCount: csvData.opportunities.length,
      registrationsCount: csvData.registrations.length
    })
    return NextResponse.json(csvData)
  } catch (error) {
    console.error('Export data API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
