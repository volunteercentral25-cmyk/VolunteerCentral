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
      .select(`
        club_id,
        clubs!inner (
          id,
          name,
          description
        )
      `)
      .eq('admin_id', user.id)

    if (clubsError) {
      console.error('Error getting supervised clubs:', clubsError)
    }

    console.log('Current user ID:', user.id)
    console.log('Current user email:', user.email)
    console.log('Supervised clubs:', supervisedClubs)

    // If admin hasn't selected clubs yet, return basic data with club selection flag
    if (!supervisedClubs || supervisedClubs.length === 0) {
      console.log('No supervised clubs found - returning club selection flag')
      return NextResponse.json({
        needsClubSelection: true,
        profile,
        stats: {
          totalStudents: 0,
          totalOpportunities: 0,
          pendingHours: 0,
          totalHours: 0
        },
        recentHours: [],
        recentOpportunities: [],
        recentRegistrations: [],
        supervisedClubs: []
      })
    }

    // Get club IDs for filtering
    const clubIds = supervisedClubs.map(sc => sc.club_id)
    
    // Get the names of supervised clubs to filter students properly
    const supervisedClubNames = supervisedClubs.map(sc => sc.clubs[0]?.name).filter(Boolean)
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
    console.log('Club IDs for opportunities:', clubIds)

    // Get student count for supervised clubs
    const { data: studentCount, error: studentCountError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'student')
      .or(studentFilter)
    
    if (studentCountError) {
      console.error('Error getting student count:', studentCountError)
    }

    console.log('Student count result:', studentCount)
    console.log('Student count query details:', {
      role: 'student',
      filter: studentFilter,
      count: studentCount?.length || 0
    })

    // Get student IDs for supervised clubs first
    const { data: studentIds, error: studentIdsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .or(studentFilter)

    if (studentIdsError) {
      console.error('Error getting student IDs:', studentIdsError)
    }

    const studentIdArray = studentIds?.map(s => s.id) || []

    console.log('Student IDs for filtering:', studentIdArray)
    console.log('Number of students found:', studentIdArray.length)

    // Fetch other statistics filtered by supervised clubs
    const [
      opportunitiesResult,
      pendingHoursResult,
      totalHoursResult,
      recentHoursResult,
      recentOpportunitiesResult
    ] = await Promise.all([
      // Total opportunities for supervised clubs
      supabase
        .from('volunteer_opportunities')
        .select('id')
        .in('club_id', clubIds),
      
      // Pending hours for students in supervised clubs
      supabase
        .from('volunteer_hours')
        .select('id')
        .eq('status', 'pending')
        .in('student_id', studentIdArray),
      
      // Total approved hours for students in supervised clubs
      supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('status', 'approved')
        .in('student_id', studentIdArray),
      
      // Recent hours (last 7 days) for supervised clubs
      supabase
        .from('volunteer_hours')
        .select(`
          id,
          hours,
          status,
          created_at,
          profiles!inner(full_name, email)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .in('student_id', studentIdArray)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Recent opportunities for supervised clubs
      supabase
        .from('volunteer_opportunities')
        .select('*')
        .in('club_id', clubIds)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5)
    ])

    // Calculate counts manually
    const totalStudents = studentCount || 0
    const totalOpportunities = opportunitiesResult.data?.length || 0
    const pendingHours = pendingHoursResult.data?.length || 0
    
    console.log('Calculated stats:', {
      totalStudents,
      totalOpportunities,
      pendingHours,
      studentIdArrayLength: studentIdArray.length
    })
    
    // Calculate total hours
    const totalHours = totalHoursResult.data?.reduce((sum, hour) => sum + (hour.hours || 0), 0) || 0

    // Get opportunity registrations for supervised clubs
    const { data: registrations } = await supabase
      .from('opportunity_registrations')
      .select(`
        id,
        status,
        volunteer_opportunities!inner(title, club_id),
        profiles!inner(full_name)
      `)
      .in('volunteer_opportunities.club_id', clubIds)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      needsClubSelection: false,
      stats: {
        totalStudents: totalStudents,
        totalOpportunities: totalOpportunities,
        pendingHours: pendingHours,
        totalHours: totalHours
      },
      recentHours: recentHoursResult.data || [],
      recentOpportunities: recentOpportunitiesResult.data || [],
      recentRegistrations: registrations || [],
      supervisedClubs: supervisedClubs || [],
      profile
    })
  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
