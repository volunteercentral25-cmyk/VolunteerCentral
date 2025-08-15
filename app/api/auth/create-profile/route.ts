import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, studentId, role = 'student' } = body

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    // Check if student ID is already taken
    if (studentId) {
      const { data: existingStudentId, error: studentIdError } = await supabase
        .from('profiles')
        .select('id')
        .eq('student_id', studentId)
        .single()

      if (existingStudentId) {
        return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 })
      }
    }

    // Create profile
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName || user.user_metadata?.full_name,
        student_id: studentId || user.user_metadata?.student_id,
        role: role || user.user_metadata?.role || 'student'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Profile creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    })
  } catch (error) {
    console.error('Create profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
