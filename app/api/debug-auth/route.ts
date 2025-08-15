import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    console.log('Debug: Starting auth check...')
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Debug: Auth result:', { user: user?.id, error: userError })
    
    if (userError) {
      console.error('Debug: User auth error:', userError)
      return NextResponse.json({ 
        error: 'Auth error', 
        details: userError 
      }, { status: 401 })
    }

    if (!user) {
      console.log('Debug: No user found')
      return NextResponse.json({ 
        error: 'No user found' 
      }, { status: 401 })
    }

    console.log('Debug: User found:', user.id, user.email)

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Debug: Profile result:', { profile: profile?.id, error: profileError })

    if (profileError) {
      console.error('Debug: Profile error:', profileError)
      return NextResponse.json({ 
        error: 'Profile error', 
        details: profileError,
        user: { id: user.id, email: user.email }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: { id: user.id, email: user.email },
      profile: { id: profile.id, email: profile.email, role: profile.role }
    })
  } catch (error) {
    console.error('Debug: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error 
    }, { status: 500 })
  }
}
