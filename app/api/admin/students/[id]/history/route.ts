import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('History API called for student ID:', id)
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated for history')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated for history:', user.id)

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('User not admin for history:', profile?.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Admin access confirmed for history')

    // Use RPC function to get volunteer history
    const { data: history, error } = await supabase.rpc('get_student_volunteer_history', {
      student_uuid: id
    })

    console.log('History RPC result:', { history, error })

    if (error) {
      console.error('Error getting volunteer history:', error)
      throw error
    }

    const response = {
      history: history || []
    }

    console.log('History API response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin student history API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
