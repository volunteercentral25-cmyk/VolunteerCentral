import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user (admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { hoursId, action, reason } = await request.json()

    if (!hoursId || !action) {
      return NextResponse.json({ error: 'Hours ID and action are required' }, { status: 400 })
    }

    // Get hours details
    const { data: hours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer_opportunities (
          title,
          location
        ),
        profiles!inner (
          full_name,
          email
        )
      `)
      .eq('id', hoursId)
      .single()

    if (hoursError || !hours) {
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Get admin profile
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Calculate total hours for the student
    const { data: totalHoursData } = await supabase
      .from('volunteer_hours')
      .select('hours')
      .eq('student_id', hours.student_id)
      .eq('status', 'approved')

    const totalHours = totalHoursData?.reduce((sum, hour) => sum + (hour.hours || 0), 0) || 0

    // Format the volunteer date
    const volunteerDate = new Date(hours.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Prepare email data based on action
    const emailData: any = {
      student_name: hours.profiles.full_name,
      opportunity_title: hours.volunteer_opportunities?.title || 'Volunteer Service',
      volunteer_date: volunteerDate,
      hours_logged: hours.hours,
      description: hours.description || 'No description provided',
      total_hours: totalHours,
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/hours/review`,
      logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
    }

    let template = ''
    let subject = ''

    if (action === 'approve') {
      template = 'hours_approved'
      subject = `Hours Approved: ${hours.volunteer_opportunities?.title || 'Volunteer Service'}`
      emailData.approved_by = adminProfile?.full_name || 'Administrator'
      emailData.approved_date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (action === 'deny') {
      template = 'hours_denied'
      subject = `Hours Denied: ${hours.volunteer_opportunities?.title || 'Volunteer Service'}`
      emailData.denied_by = adminProfile?.full_name || 'Administrator'
      emailData.denied_date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      emailData.denial_reason = reason || 'No reason provided'
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Send email using the local Flask Mail service
    const emailResponse = await fetch('/api/email/send-hours-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hours_id: hoursId,
        student_email: hours.profiles.email,
        status: action,
        admin_id: user.id,
        notes: action === 'deny' ? reason : undefined
      })
    })

    if (!emailResponse.ok) {
      console.error('Email service response:', await emailResponse.text())
      throw new Error('Failed to send email')
    }

    // Log the email
    await supabase
      .from('email_logs')
      .insert({
        recipient: hours.profiles.email,
        template: template,
        subject: subject,
        data: emailData,
        status: 'sent'
      })

    // Update the hours record with admin override information
    await supabase
      .from('volunteer_hours')
      .update({
        status: action === 'approve' ? 'approved' : 'denied',
        admin_override_by: user.id,
        admin_override_reason: action === 'deny' ? reason : null,
        admin_override_date: new Date().toISOString()
      })
      .eq('id', hoursId)

    // Log admin activity
    await supabase
      .from('admin_activity_logs')
      .insert({
        action_type: `hours_${action}`,
        description: `${action === 'approve' ? 'Approved' : 'Denied'} volunteer hours for ${hours.profiles.full_name}`,
        affected_user_id: hours.student_id,
        affected_entity_type: 'volunteer_hours',
        affected_entity_id: hoursId,
        admin_user_id: user.id,
        metadata: {
          hours: hours.hours,
          date: hours.date,
          reason: action === 'deny' ? reason : null
        }
      })

    return NextResponse.json({ 
      success: true, 
      message: `Hours ${action} notification sent successfully` 
    })

  } catch (error) {
    console.error('Error sending hours notification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
