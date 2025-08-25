import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth API called')
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('Profile not found')
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('Profile found:', profile.role)

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: profile.role
      }
    })
  } catch (error) {
    console.error('Test auth API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
