import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Test API: User ID:', user.id)

    // Get current club memberships
    const { data: clubMemberships, error: clubError } = await supabase
      .from('student_clubs')
      .select(`
        club_id,
        clubs(id, name, description)
      `)
      .eq('student_id', user.id)

    console.log('Test API: Raw club memberships:', clubMemberships)
    console.log('Test API: Club error:', clubError)

    // Build clubs array for frontend
    const clubsArray = clubMemberships?.map((cm: any) => ({
      id: cm.clubs[0]?.id,
      name: cm.clubs[0]?.name,
      description: cm.clubs[0]?.description
    })).filter((club: any) => club.id && club.name) || []

    console.log('Test API: Processed clubs array:', clubsArray)

    return NextResponse.json({
      user_id: user.id,
      clubMemberships,
      clubsArray,
      clubsLength: clubsArray.length
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
