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
          location,
          requirements
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

    // Calculate days until opportunity
    const opportunityDate = new Date(registration.volunteer_opportunities.date)
    const today = new Date()
    const daysUntilOpportunity = Math.ceil((opportunityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Format the opportunity date and time
    const formattedDate = opportunityDate.toLocaleDateString('en-US', {
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
      opportunity_date: formattedDate,
      opportunity_time: opportunityTime,
      opportunity_location: registration.volunteer_opportunities.location || 'TBD',
      opportunity_requirements: registration.volunteer_opportunities.requirements || 'None specified',
      days_until_opportunity: daysUntilOpportunity,
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/dashboard`,
      unregister_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/opportunities`,
      logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
    }

    // Send email using the Flask email service
    const emailServiceUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log('🔧 Using email service URL:', emailServiceUrl)
    const emailResponse = await fetch(`${emailServiceUrl}/api/email/opportunity-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_email: registration.profiles.email,
        student_name: registration.profiles.full_name,
        opportunity_title: registration.volunteer_opportunities.title,
        opportunity_date: formattedDate,
        opportunity_time: opportunityTime,
        opportunity_location: registration.volunteer_opportunities.location || 'TBD',
        opportunity_requirements: registration.volunteer_opportunities.requirements || 'None specified',
        days_until_opportunity: daysUntilOpportunity,
        dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/dashboard`,
        unregister_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/opportunities`
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Flask email service failed:', errorText)
      throw new Error('Failed to send email')
    }

    // Log the email
    await supabase
      .from('email_logs')
      .insert({
        recipient: registration.profiles.email,
        template: 'opportunity_reminder',
        subject: `Reminder: ${registration.volunteer_opportunities.title} is coming up`,
        data: emailData,
        status: 'sent'
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Opportunity reminder email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending opportunity reminder email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
