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

    // If admin hasn't selected clubs, return error
    if (!supervisedClubs || supervisedClubs.length === 0) {
      return NextResponse.json({ error: 'Please select clubs to supervise first' }, { status: 400 })
    }

    const clubIds = supervisedClubs.map(sc => sc.club_id)

    // Get all students in supervised clubs with their details
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
      .or('beta_club.eq.true,nths.eq.true')
      .order('full_name')

    if (studentsError) {
      console.error('Error getting students:', studentsError)
      return NextResponse.json({ error: 'Failed to get students' }, { status: 500 })
    }

    // Get all volunteer hours for these students
    const { data: volunteerHours, error: hoursError } = await supabase
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
        profiles!inner (
          full_name,
          email,
          student_id,
          phone,
          beta_club,
          nths
        )
      `)
      .in('student_id', students.map(s => s.id))
      .order('created_at', { ascending: false })

    if (hoursError) {
      console.error('Error getting volunteer hours:', hoursError)
      return NextResponse.json({ error: 'Failed to get volunteer hours' }, { status: 500 })
    }

    // Get all opportunities for supervised clubs
    const { data: opportunities, error: opportunitiesError } = await supabase
      .from('volunteer_opportunities')
      .select(`
        id,
        title,
        description,
        date,
        location,
        created_at,
        clubs!inner (
          name
        )
      `)
      .in('club_id', clubIds)
      .order('date', { ascending: false })

    if (opportunitiesError) {
      console.error('Error getting opportunities:', opportunitiesError)
      return NextResponse.json({ error: 'Failed to get opportunities' }, { status: 500 })
    }

    // Get opportunity registrations
    const { data: registrations, error: registrationsError } = await supabase
      .from('opportunity_registrations')
      .select(`
        id,
        status,
        created_at,
        volunteer_opportunities!inner (
          title,
          date,
          clubs!inner (
            name
          )
        ),
        profiles!inner (
          full_name,
          email,
          student_id
        )
      `)
      .in('volunteer_opportunities.club_id', clubIds)
      .order('created_at', { ascending: false })

    if (registrationsError) {
      console.error('Error getting registrations:', registrationsError)
      return NextResponse.json({ error: 'Failed to get registrations' }, { status: 500 })
    }

    // Calculate summary statistics
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

    // Prepare CSV data
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
        // Determine club name based on boolean values
        let clubName = 'None'
        if (hour.profiles[0]?.beta_club && hour.profiles[0]?.nths) {
          clubName = 'Beta Club, NTHS'
        } else if (hour.profiles[0]?.beta_club) {
          clubName = 'Beta Club'
        } else if (hour.profiles[0]?.nths) {
          clubName = 'NTHS'
        }
        
        return {
          studentName: hour.profiles[0]?.full_name || 'Unknown',
          studentEmail: hour.profiles[0]?.email || 'Unknown',
          studentId: hour.profiles[0]?.student_id || 'Unknown',
          studentPhone: hour.profiles[0]?.phone || '',
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
        club: opp.clubs[0]?.name || 'Unknown',
        createdDate: new Date(opp.created_at).toLocaleDateString()
      })),
      registrations: registrations.map(reg => ({
        studentName: reg.profiles[0]?.full_name || 'Unknown',
        studentEmail: reg.profiles[0]?.email || 'Unknown',
        studentId: reg.profiles[0]?.student_id || 'Unknown',
        opportunity: reg.volunteer_opportunities[0]?.title || 'Unknown',
        opportunityDate: reg.volunteer_opportunities[0]?.date || 'Unknown',
        club: reg.volunteer_opportunities[0]?.clubs[0]?.name || 'Unknown',
        status: reg.status,
        registeredDate: new Date(reg.created_at).toLocaleDateString()
      }))
    }

    return NextResponse.json(csvData)
  } catch (error) {
    console.error('Export data API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
