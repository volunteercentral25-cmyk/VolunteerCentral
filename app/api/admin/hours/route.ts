import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin hours API called')
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated')
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
      console.log('User not admin:', profile?.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Admin access confirmed')

    // Get URL parameters for pagination and search
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('Parameters:', { page, limit, search, status })

    // Use RPC functions to bypass RLS (these functions don't accept parameters)
    const [hoursResult, countResult] = await Promise.all([
      // Get hours with details
      supabase.rpc('get_admin_hours_with_details'),
      // Get total count
      supabase.rpc('get_admin_hours_count')
    ])

    console.log('Hours result:', hoursResult)
    console.log('Count result:', countResult)

    if (hoursResult.error) {
      console.error('Error getting hours:', hoursResult.error)
      throw hoursResult.error
    }

    if (countResult.error) {
      console.error('Error getting count:', countResult.error)
      throw countResult.error
    }

    let hours = hoursResult.data || []
    let totalCount = countResult.data || 0

    // Apply client-side filtering
    if (search) {
      const searchLower = search.toLowerCase()
      hours = hours.filter((hour: any) => 
        hour.student_name?.toLowerCase().includes(searchLower) ||
        hour.student_email?.toLowerCase().includes(searchLower) ||
        hour.description?.toLowerCase().includes(searchLower) ||
        hour.opportunity_title?.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      hours = hours.filter((hour: any) => hour.status === status)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedHours = hours.slice(startIndex, endIndex)
    const filteredTotalCount = hours.length

    console.log('Filtered hours data:', paginatedHours)
    console.log('Filtered total count:', filteredTotalCount)

    // Transform the data to match the expected interface
    const transformedHours = paginatedHours.map((hour: any) => ({
      id: hour.id,
      hours: hour.hours,
      activity: hour.description || 'No description provided',
      date: hour.created_at,
      description: hour.description,
      status: hour.status,
      location: 'N/A', // Add location field for frontend compatibility
      verification_email: hour.verification_email,
      verified_by: hour.verified_by,
      verification_date: hour.verification_date,
      verification_notes: hour.verification_notes,
      created_at: hour.created_at,
      profiles: {
        full_name: hour.full_name,
        email: hour.email,
        student_id: hour.student_id_text
      }
    }))

    console.log('Transformed hours data:', transformedHours)

    const response = {
      hours: transformedHours,
      pagination: {
        page,
        limit,
        total: filteredTotalCount,
        totalPages: Math.ceil(filteredTotalCount / limit)
      }
    }

    console.log('Final response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin hours API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    console.log('Update request body:', body)
    
    const { hoursId, status, notes } = body

    if (!hoursId || !status) {
      console.error('Missing required fields:', { hoursId, status })
      return NextResponse.json({ error: 'Missing required fields: hoursId and status' }, { status: 400 })
    }

    console.log('Updating hours with:', { hoursId, status, notes })

    // Update hour status
    const { data, error } = await supabase
      .from('volunteer_hours')
      .update({
        status: status,
        verified_by: profile.email, // Use admin's email instead of user ID
        verification_date: new Date().toISOString(),
        verification_notes: notes || null
      })
      .eq('id', hoursId)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    console.log('Successfully updated hours:', data)

    // Send email notification when hours are approved or denied
    if (status === 'approved' || status === 'denied') {
      try {
        // Get the student email from the hours record
        const { data: hoursWithStudent, error: studentError } = await supabase
          .from('volunteer_hours')
          .select(`
            *,
            profiles!inner (
              email,
              full_name
            )
          `)
          .eq('id', hoursId)
          .single()

        if (studentError || !hoursWithStudent) {
          console.error('❌ Failed to get student info for email:', studentError)
          throw new Error('Could not get student information')
        }

        console.log('🔔 ADMIN API: Triggering email notification for status:', status)
        console.log('📧 Student email:', hoursWithStudent.profiles.email)
        console.log('📍 EMAIL URL:', `${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-hours-notification`)
        
        const emailPayload = {
          hours_id: hoursId,
          student_email: hoursWithStudent.profiles.email,
          status: status,
          admin_id: user.id,
          notes: notes
        }
        console.log('📦 Flask Email payload:', emailPayload)
        
        // Try Flask email service first (same as verification system)
        let emailSent = false
        try {
          const flaskResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-hours-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          })

          console.log('📬 Flask email service response status:', flaskResponse.status)
          
          if (flaskResponse.ok) {
            const result = await flaskResponse.json()
            console.log('✅ Flask hours notification email sent successfully:', result)
            emailSent = true
          } else {
            const errorText = await flaskResponse.text()
            console.error('❌ Flask email service failed:', errorText)
          }
        } catch (flaskError) {
          console.error('💥 Flask email service error:', flaskError)
        }

        // Fallback to Next.js email service if Flask failed
        if (!emailSent) {
          console.log('🔄 Falling back to Next.js email service...')
          try {
            const nextjsPayload = {
              hoursId: hoursId,
              action: status === 'approved' ? 'approve' : 'deny',
              reason: notes,
              bypassAuth: false  // Admin call, so keep auth check
            }
            
            const nextjsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email-service/send-hours-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(nextjsPayload),
            })

            console.log('📬 Next.js email service response status:', nextjsResponse.status)
            
            if (nextjsResponse.ok) {
              const result = await nextjsResponse.json()
              console.log('✅ Next.js hours notification email sent successfully:', result)
              emailSent = true
            } else {
              const errorText = await nextjsResponse.text()
              console.error('❌ Next.js email service also failed:', errorText)
            }
          } catch (nextjsError) {
            console.error('💥 Next.js email service error:', nextjsError)
          }
        }

        if (!emailSent) {
          console.error('💥 All email services failed!')
        }
      } catch (emailError) {
        console.error('💥 Error sending hours notification email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ success: true, hour: data })
  } catch (error) {
    console.error('Admin update hour API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
