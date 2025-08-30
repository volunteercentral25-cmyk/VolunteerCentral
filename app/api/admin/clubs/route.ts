import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all clubs
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching clubs:', error)
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
    }

    return NextResponse.json({ clubs: clubs || [] })

  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
