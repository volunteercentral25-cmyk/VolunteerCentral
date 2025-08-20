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

    // Fetch real statistics
    const [
      studentsResult,
      opportunitiesResult,
      pendingHoursResult,
      totalHoursResult,
      recentHoursResult,
      recentOpportunitiesResult
    ] = await Promise.all([
      // Total students
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student'),
      
      // Total opportunities
      supabase
        .from('volunteer_opportunities')
        .select('id', { count: 'exact' }),
      
      // Pending hours
      supabase
        .from('volunteer_hours')
        .select('id', { count: 'exact' })
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
        totalStudents: studentsResult.count || 0,
        totalOpportunities: opportunitiesResult.count || 0,
        pendingHours: pendingHoursResult.count || 0,
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
