import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('Public profile API called for ID:', resolvedParams.id)
    const supabase = createClient()
    
    const profileId = resolvedParams.id

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    console.log('Getting public profile for:', profileId)

    // Get basic profile information (public data only)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        student_id,
        bio,
        beta_club,
        nths,
        created_at
      `)
      .eq('id', profileId)
      .eq('role', 'student') // Only allow student profiles to be public
      .single()

    if (profileError || !profile) {
      console.error('Error getting profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('Profile found:', profile.full_name)

    // Get volunteer hours summary (approved only)
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('hours, date, description, status')
      .eq('student_id', profileId)
      .eq('status', 'approved')
      .order('date', { ascending: false })

    if (hoursError) {
      console.error('Error getting hours:', hoursError)
    }

    const hours = hoursData || []
    
    // Calculate statistics
    const totalHours = hours.reduce((sum, hour) => sum + parseFloat(hour.hours.toString()), 0)
    const totalActivities = hours.length
    
    // Get recent activities (last 5)
    const recentActivities = hours.slice(0, 5).map(hour => ({
      description: hour.description,
      hours: parseFloat(hour.hours.toString()),
      date: hour.date
    }))

    // Get opportunities the student has registered for (public info only)
    const { data: registrations, error: registrationsError } = await supabase
      .from('opportunity_registrations')
      .select(`
        volunteer_opportunities (
          title,
          organization,
          date,
          location
        )
      `)
      .eq('student_id', profileId)
      .eq('status', 'registered')

    if (registrationsError) {
      console.error('Error getting registrations:', registrationsError)
    }

    const upcomingOpportunities = (registrations || [])
      .map(reg => reg.volunteer_opportunities)
      .filter(opp => {
        if (!opp || typeof opp !== 'object') return false
        const opportunity = opp as any
        return opportunity.date && new Date(opportunity.date) >= new Date()
      })
      .slice(0, 3) // Show only next 3 upcoming

    const publicProfile = {
      id: profile.id,
      fullName: profile.full_name,
      studentId: profile.student_id,
      bio: profile.bio,
      clubs: {
        betaClub: profile.beta_club,
        nths: profile.nths
      },
      memberSince: profile.created_at,
      volunteerStats: {
        totalHours: totalHours,
        totalActivities: totalActivities,
        recentActivities: recentActivities
      },
      upcomingOpportunities: upcomingOpportunities
    }

    console.log('Public profile response:', publicProfile)
    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error('Public profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
