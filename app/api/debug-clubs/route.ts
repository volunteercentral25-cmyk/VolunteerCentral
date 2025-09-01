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

    console.log('Debug API: User ID:', user.id)
    console.log('Debug API: User email:', user.email)

    // Test the exact queries that the profile API uses
    const { data: studentClubIds, error: clubIdsError } = await supabase
      .from('student_clubs')
      .select('club_id')
      .eq('student_id', user.id)

    console.log('Debug API: Club IDs query result:', studentClubIds)
    console.log('Debug API: Club IDs error:', clubIdsError)

    let clubsArray: any[] = []
    if (studentClubIds && studentClubIds.length > 0) {
      const clubIds = studentClubIds.map(sc => sc.club_id)
      console.log('Debug API: Club IDs to fetch:', clubIds)
      
      const { data: clubData, error: clubDataError } = await supabase
        .from('clubs')
        .select('id, name, description')
        .in('id', clubIds)
        .eq('is_active', true)

      console.log('Debug API: Club data query result:', clubData)
      console.log('Debug API: Club data error:', clubDataError)

      if (clubDataError) {
        console.error('Club data fetch error:', clubDataError)
      } else {
        clubsArray = clubData || []
      }
    }

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      studentClubIds,
      clubsArray,
      clubsLength: clubsArray.length,
      clubNames: clubsArray.map(c => c.name)
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
