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

    return NextResponse.json({ 
      message: 'Shareable profile validation successful',
      profileId: profileId,
      shareToken: shareToken,
      shareableProfile: shareableProfile,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Public profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
