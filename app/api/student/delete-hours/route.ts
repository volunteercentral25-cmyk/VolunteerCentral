import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hoursId = searchParams.get('hoursId')

    if (!hoursId) {
      return NextResponse.json({ error: 'Hours ID is required' }, { status: 400 })
    }

    // Get the volunteer hours record to verify ownership
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('id', hoursId)
      .eq('student_id', user.id)
      .single()

    if (hoursError || !hoursData) {
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Check if hours are already verified (prevent deletion of verified hours)
    if (hoursData.status === 'approved' || hoursData.status === 'denied') {
      return NextResponse.json({ 
        error: 'Cannot delete verified hours. Please contact an administrator if you need to make changes.' 
      }, { status: 400 })
    }

    // Delete the volunteer hours record
    const { error: deleteError } = await supabase
      .from('volunteer_hours')
      .delete()
      .eq('id', hoursId)
      .eq('student_id', user.id)

    if (deleteError) {
      console.error('Error deleting hours:', deleteError)
      return NextResponse.json({ error: 'Failed to delete hours record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer hours deleted successfully',
      hours_id: hoursId,
      deleted_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete hours error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
