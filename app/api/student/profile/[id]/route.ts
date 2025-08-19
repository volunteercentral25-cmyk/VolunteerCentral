import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get requested profile
    const { data: requestedProfile, error: requestedProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (requestedProfileError) {
      return NextResponse.json({ error: 'Requested profile not found' }, { status: 404 })
    }

    // Check if the user can access this profile (own profile or admin)
    if (requestedProfile.id !== currentProfile.id && currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const profileData = {
      id: requestedProfile.id,
      full_name: requestedProfile.full_name,
      email: requestedProfile.email,
      student_id: requestedProfile.student_id,
      role: requestedProfile.role,
      created_at: requestedProfile.created_at,
      updated_at: requestedProfile.updated_at
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Profile GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
