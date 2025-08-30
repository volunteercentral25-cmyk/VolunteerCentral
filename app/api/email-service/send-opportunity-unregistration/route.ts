import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { registrationId } = await request.json()

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    // Get registration details
    const { data: registration, error: registrationError } = await supabase
      .from('opportunity_registrations')
      .select(`
        *,
        volunteer_opportunities (
          title,
          date,
          start_time,
          end_time,
          location
        ),
        profiles!inner (
          full_name,
          email
        )
      `)
      .eq('id', registrationId)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Format the opportunity date and time
    const opportunityDate = new Date(registration.volunteer_opportunities.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const opportunityTime = registration.volunteer_opportunities.start_time && registration.volunteer_opportunities.end_time
      ? `${registration.volunteer_opportunities.start_time} - ${registration.volunteer_opportunities.end_time}`
      : 'TBD'

    // Prepare email data
    const emailData = {
      student_name: registration.profiles.full_name,
      opportunity_title: registration.volunteer_opportunities.title,
      opportunity_date: opportunityDate,
      opportunity_time: opportunityTime,
      opportunity_location: registration.volunteer_opportunities.location || 'TBD',
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/dashboard`,
      logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
    }

    // Send email using the email service
    const emailResponse = await fetch(`${process.env.EMAIL_SERVICE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`
      },
      body: JSON.stringify({
        to: registration.profiles.email,
        template: 'opportunity_unregistration',
        subject: `Unregistration Confirmation: ${registration.volunteer_opportunities.title}`,
        data: emailData
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    // Log the email
    await supabase
      .from('email_logs')
      .insert({
        recipient: registration.profiles.email,
        template: 'opportunity_unregistration',
        subject: `Unregistration Confirmation: ${registration.volunteer_opportunities.title}`,
        data: emailData,
        status: 'sent'
      })

    // Log the unregistration
    await supabase
      .from('opportunity_unregistration_emails')
      .insert({
        opportunity_id: registration.opportunity_id,
        student_id: registration.student_id,
        email_template: 'opportunity_unregistration',
        email_data: emailData
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Unregistration confirmation email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending opportunity unregistration email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
