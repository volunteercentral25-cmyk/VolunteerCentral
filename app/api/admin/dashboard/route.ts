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

    // Use the test function to get student count reliably
    const { data: studentCount, error: studentCountError } = await supabase.rpc('test_admin_student_count')
    
    if (studentCountError) {
      console.error('Error getting student count:', studentCountError)
    }

    console.log('Student count result:', studentCount)
    console.log('Student count data type:', typeof studentCount)
    console.log('Student count is array:', Array.isArray(studentCount))

    // Fetch other statistics
    const [
      opportunitiesResult,
      pendingHoursResult,
      totalHoursResult,
      recentHoursResult,
      recentOpportunitiesResult
    ] = await Promise.all([
      // Total opportunities
      supabase
        .from('volunteer_opportunities')
        .select('id'),
      
      // Pending hours
      supabase
        .from('volunteer_hours')
        .select('id')
        .eq('status', 'pending'),
      
      // Total approved hours
      supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('status', 'approved'),
      
      // Recent hours (last 7 days)
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
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Recent opportunities
      supabase
        .from('volunteer_opportunities')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5)
    ])

    // Calculate counts manually
    const totalStudents = studentCount?.[0]?.total_students || 0
    const totalOpportunities = opportunitiesResult.data?.length || 0
    const pendingHours = pendingHoursResult.data?.length || 0
    
    console.log('Calculated stats:', {
      totalStudents,
      totalOpportunities,
      pendingHours
    })
    
    // Calculate total hours
    const totalHours = totalHoursResult.data?.reduce((sum, hour) => sum + (hour.hours || 0), 0) || 0

    // Get opportunity registrations
    const { data: registrations } = await supabase
      .from('opportunity_registrations')
      .select(`
        id,
        status,
        volunteer_opportunities!inner(title),
        profiles!inner(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        totalStudents: totalStudents,
        totalOpportunities: totalOpportunities,
        pendingHours: pendingHours,
        totalHours: totalHours
      },
      recentHours: recentHoursResult.data || [],
      recentOpportunities: recentOpportunitiesResult.data || [],
      recentRegistrations: registrations || [],
      profile
    })
  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
