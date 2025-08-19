import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isOrganizationalEmail } from '@/lib/utils/emailValidation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get volunteer hours with opportunity details
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer_opportunities (
          title,
          location
        )
      `)
      .eq('student_id', profile.id)
      .order('date', { ascending: false })

    if (hoursError) {
      return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })
    }

    // Calculate summary statistics
    const totalHours = hoursData?.reduce((sum, hour) => sum + Number(hour.hours), 0) || 0
    const approvedCount = hoursData?.filter(hour => hour.status === 'approved').length || 0
    const pendingCount = hoursData?.filter(hour => hour.status === 'pending').length || 0

    const hoursList = hoursData?.map(hour => ({
      id: hour.id,
      activity: hour.description || hour.volunteer_opportunities?.title || 'Volunteer Activity',
      hours: hour.hours,
      date: hour.date,
      description: hour.description,
      status: hour.status,
      location: hour.volunteer_opportunities?.location || 'N/A',
      verification_email: hour.verification_email || null,
      verified_by: hour.verified_by || null
    })) || []

    return NextResponse.json({
      hours: hoursList,
      summary: {
        totalHours,
        approvedCount,
        pendingCount
      }
    })
  } catch (error) {
    console.error('Hours API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { activity, hours, date, description, verification_email } = body

    // Validate required fields
    if (!activity || !hours || !date || !description || !verification_email) {
      return NextResponse.json({ 
        error: 'Missing required fields. All fields including verification email are required.' 
      }, { status: 400 })
    }

    // Validate email format and domain
    if (!isOrganizationalEmail(verification_email)) {
      return NextResponse.json({ 
        error: 'Please provide a valid organizational email address for verification. Personal email providers (Gmail, Yahoo, etc.) are not accepted.' 
      }, { status: 400 })
    }

    // Validate hours format
    const hoursNumber = Number(hours)
    if (isNaN(hoursNumber) || hoursNumber <= 0) {
      return NextResponse.json({ 
        error: 'Please provide a valid number of hours greater than 0' 
      }, { status: 400 })
    }

    // Validate date format
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Please provide a valid date' 
      }, { status: 400 })
    }

    // Check if date is not in the future
    if (dateObj > new Date()) {
      return NextResponse.json({ 
        error: 'Hours cannot be logged for future dates' 
      }, { status: 400 })
    }

    // Insert new volunteer hours with verification email
    const { data: newHour, error: insertError } = await supabase
      .from('volunteer_hours')
      .insert({
        student_id: profile.id,
        hours: hoursNumber,
        date: date,
        description: description,
        verification_email: verification_email,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Hours insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to log hours. Please try again.' 
      }, { status: 500 })
    }

                    // Send verification email to the supervisor/organization
                try {
                  const emailResponse = await fetch(`${process.env.EMAIL_SERVICE_URL || 'http://localhost:5000'}/send-verification-email`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      hours_id: newHour.id,
                      verifier_email: verification_email,
                      student_id: profile.id
                    }),
                  })

                  if (emailResponse.ok) {
                    const emailData = await emailResponse.json()
                    console.log('Verification email sent:', emailData)
                  } else {
                    console.error('Failed to send verification email:', await emailResponse.text())
                  }
                } catch (emailError) {
                  console.error('Error sending verification email:', emailError)
                }

                return NextResponse.json({ 
                  success: true, 
                  hour: newHour,
                  message: 'Hours logged successfully. Verification email has been sent to the supervisor/organization.'
                })
  } catch (error) {
    console.error('Hours POST API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 })
  }
}
