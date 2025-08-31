import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test export data API called')
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('User not admin:', profile?.role, 'Error:', profileError)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Admin access confirmed')

    // Get admin's supervised clubs
    const { data: supervisedClubs, error: clubsError } = await supabase
      .from('admin_club_supervision')
      .select('club_id')
      .eq('admin_id', user.id)

    if (clubsError) {
      console.error('Error getting supervised clubs:', clubsError)
      return NextResponse.json({ error: 'Failed to get supervised clubs' }, { status: 500 })
    }

    console.log('Supervised clubs found:', supervisedClubs?.length || 0)

    // Return a simple test response
    return NextResponse.json({
      success: true,
      message: 'Export data API is working',
      user: user.id,
      role: profile.role,
      supervisedClubs: supervisedClubs?.length || 0
    })
  } catch (error) {
    console.error('Test export data API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
