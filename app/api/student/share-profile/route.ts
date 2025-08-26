import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if student
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 })
    }

    const body = await request.json()
    const { expiresInDays } = body // Optional: number of days until expiration

    // Generate a unique share token
    const shareToken = randomBytes(32).toString('hex')
    
    // Calculate expiration date (optional)
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

    console.log('Creating shareable profile for:', profile.full_name)

    // Create shareable profile
    const { data: shareableProfile, error: createError } = await supabase
      .from('shareable_profiles')
      .insert({
        profile_id: profile.id,
        share_token: shareToken,
        is_active: true,
        expires_at: expiresAt,
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating shareable profile:', createError)
      throw createError
    }

    console.log('Successfully created shareable profile:', shareableProfile.id)

    // Return the share URL
    const shareUrl = `${request.nextUrl.origin}/profile/${shareToken}`

    return NextResponse.json({ 
      success: true, 
      shareToken: shareToken,
      shareUrl: shareUrl,
      expiresAt: expiresAt,
      shareableProfile: shareableProfile
    })
  } catch (error) {
    console.error('Share profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if student
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 })
    }

    // Get existing shareable profiles for this user
    const { data: shareableProfiles, error: listError } = await supabase
      .from('shareable_profiles')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (listError) {
      console.error('Error getting shareable profiles:', listError)
      throw listError
    }

    // Add share URLs to each profile
    const profilesWithUrls = shareableProfiles.map(sp => ({
      ...sp,
      shareUrl: `${request.nextUrl.origin}/profile/${sp.share_token}`
    }))

    return NextResponse.json({ 
      success: true, 
      shareableProfiles: profilesWithUrls
    })
  } catch (error) {
    console.error('Get share profiles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
