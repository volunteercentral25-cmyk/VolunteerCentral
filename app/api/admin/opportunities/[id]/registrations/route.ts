import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get registrations for this opportunity with student details using RPC function
    const { data: registrations, error } = await supabase
      .rpc('get_admin_registrations_with_profiles')

    if (error) {
      throw error
    }

    // Filter registrations by opportunity ID
    const filteredRegistrations = registrations?.filter((reg: any) => reg.opportunity_id === id) || []

    return NextResponse.json({ registrations: filteredRegistrations })
  } catch (error) {
    console.error('Admin opportunity registrations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { registrationId, action } = body

    if (!registrationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      console.log('Admin - Approving registration:', registrationId)
      
      // Update registration status to approved using RPC function to bypass RLS
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_admin_registration_status', { 
          registration_uuid: registrationId, 
          new_status: 'approved' 
        })

      if (updateError) {
        console.error('Error updating registration status:', updateError)
        throw updateError
      }

      if (!updateResult) {
        console.error('Registration not found for approval')
        throw new Error('Registration not found')
      }

      console.log('Admin - Registration status updated to approved')

      // Get registration details to calculate hours
      const { data: registration, error: regError } = await supabase
        .from('opportunity_registrations')
        .select(`
          *,
          volunteer_opportunities!inner(
            start_time,
            end_time,
            date,
            title
          )
        `)
        .eq('id', registrationId)
        .single()

      if (regError) {
        console.error('Error fetching registration details:', regError)
        throw regError
      }

      if (registration) {
        console.log('Admin - Registration details:', registration)
        
        // Calculate hours based on start and end time
        const startTime = new Date(`2000-01-01T${registration.volunteer_opportunities.start_time}`)
        const endTime = new Date(`2000-01-01T${registration.volunteer_opportunities.end_time}`)
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

        console.log('Admin - Calculated hours:', hours)

        // Add volunteer hours automatically
        const { error: hoursError } = await supabase
          .from('volunteer_hours')
          .insert({
            student_id: registration.student_id,
            hours: hours,
            description: `Volunteer hours from approved opportunity: ${registration.volunteer_opportunities.title}`,
            status: 'approved',
            verification_email: profile.email,
            verified_by: profile.id,
            verification_date: new Date().toISOString()
          })

        if (hoursError) {
          console.error('Error adding volunteer hours:', hoursError)
          throw hoursError
        }

        console.log('Admin - Volunteer hours added successfully')
      }

    } else if (action === 'decline') {
      console.log('Admin - Declining registration:', registrationId)
      
      // Update registration status to denied using RPC function to bypass RLS
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_admin_registration_status', { 
          registration_uuid: registrationId, 
          new_status: 'denied' 
        })

      if (updateError) {
        console.error('Error updating registration status to denied:', updateError)
        throw updateError
      }

      if (!updateResult) {
        console.error('Registration not found for decline')
        throw new Error('Registration not found')
      }

      console.log('Admin - Registration status updated to denied')

    } else if (action === 'kick') {
      console.log('Admin - Kicking registration:', registrationId)
      
      // Delete the registration (kick student) using RPC function to bypass RLS
      const { data: deleteResult, error: deleteError } = await supabase
        .rpc('delete_admin_registration', { registration_uuid: registrationId })

      if (deleteError) {
        console.error('Error deleting registration:', deleteError)
        throw deleteError
      }

      if (!deleteResult) {
        console.error('Registration not found for deletion')
        throw new Error('Registration not found')
      }

      console.log('Admin - Registration deleted successfully')
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin opportunity registration update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
