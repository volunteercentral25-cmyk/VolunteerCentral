import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const shareToken = searchParams.get('token')
    const profileId = resolvedParams.id
    
    console.log('Public profile API called for ID:', profileId, 'with token:', shareToken)
    
    // Create anonymous Supabase client for public access
    const supabase = createClient()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 })
    }

    console.log('Getting public profile for ID:', profileId, 'with token:', shareToken)

    // First, find the shareable profile by token and profile ID to validate
    const { data: shareableProfile, error: shareableError } = await supabase
      .from('shareable_profiles')
      .select('profile_id, is_active, expires_at')
      .eq('share_token', shareToken)
      .eq('profile_id', profileId)
      .single()

    console.log('Shareable profile query result:', { shareableProfile, shareableError })

    if (shareableError || !shareableProfile) {
      console.error('Error getting shareable profile:', shareableError)
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
    }

    // Check if the shareable profile is active and not expired
    if (!shareableProfile.is_active) {
      return NextResponse.json({ error: 'This share link has been deactivated' }, { status: 410 })
    }

    if (shareableProfile.expires_at && new Date(shareableProfile.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share link has expired' }, { status: 410 })
    }

    console.log('Found valid shareable profile for ID:', profileId)

    // Now fetch the actual profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      console.error('Error getting profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch club memberships for this profile
    const { data: clubMemberships, error: clubError } = await supabase
      .from('student_clubs')
      .select(`
        club_id,
        clubs!inner(id, name, description)
      `)
      .eq('student_id', profileId)

    if (clubError) {
      console.error('Error getting club memberships:', clubError)
    }

    // Extract club information for backward compatibility
    const currentClubs = clubMemberships?.map((cm: any) => cm.clubs[0]?.name).filter(Boolean) || []
    const betaClub = currentClubs.includes('Beta Club')
    const nths = currentClubs.includes('NTHS')

    // Fetch only approved volunteer hours for this profile
    const { data: volunteerHours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('student_id', profileId)
      .eq('status', 'approved')
      .order('date', { ascending: false })

    if (hoursError) {
      console.error('Error getting volunteer hours:', hoursError)
    }

    // Fetch opportunity registrations for this profile
    const { data: registrations, error: regError } = await supabase
      .from('opportunity_registrations')
      .select(`
        *,
        volunteer_opportunities!inner(title, description, location, date)
      `)
      .eq('student_id', profileId)
      .order('registered_at', { ascending: false })

    if (regError) {
      console.error('Error getting registrations:', regError)
    }

    // Transform the data for the frontend
    const transformedProfile = {
      id: profile.id,
      full_name: profile.full_name,
      student_id: profile.student_id,
      bio: profile.bio || '',
      beta_club: betaClub,
      nths: nths,
      created_at: profile.created_at,
      clubs: clubMemberships?.map((cm: any) => ({
        id: cm.clubs[0]?.id,
        name: cm.clubs[0]?.name,
        description: cm.clubs[0]?.description
      })).filter((club: any) => club.id && club.name) || []
    }

    return NextResponse.json({ 
      success: true,
      profile: transformedProfile,
      volunteer_hours: volunteerHours || [],
      registrations: registrations || [],
      shareable_profile: shareableProfile,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Public profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
