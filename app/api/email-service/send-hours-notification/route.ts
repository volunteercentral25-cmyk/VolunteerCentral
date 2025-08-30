import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Email notification service called!')
    const supabase = createClient()
    
    const { hoursId, action, reason, bypassAuth } = await request.json()
    console.log('📝 Request data:', { hoursId, action, reason, bypassAuth })

    // If this is called from verify-hours endpoint, bypass auth check
    if (!bypassAuth) {
      // Get the current user (admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ Auth error:', userError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      console.log('✅ User authenticated:', user.id)

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.error('❌ Not admin user, role:', profile?.role)
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      console.log('✅ Admin user confirmed')
    } else {
      console.log('🔓 Bypassing auth check for email verification system')
    }

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
      console.error('❌ Hours record not found:', hoursError)
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    console.log('✅ Hours record found:', {
      id: hours.id,
      student: hours.profiles.full_name,
      email: hours.profiles.email,
      activity: hours.volunteer_opportunities?.title || hours.description
    })

    // Get admin profile (only if we have an authenticated user)
    let adminProfile = null
    if (!bypassAuth) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!userError && user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        adminProfile = data
      }
    }

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

    console.log('📧 Preparing to send email to:', hours.profiles.email)
    console.log('📬 Email subject:', subject)

    // Send email directly using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.FLASK_MAIL_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.FLASK_MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.FLASK_MAIL_USERNAME || 'CLTVolunteerCentral@gmail.com',
        pass: process.env.FLASK_MAIL_PASSWORD || 'jnkb gfpz qxjz nflx'
      }
    })

    console.log('🔧 Email transporter configured with:', {
      host: process.env.FLASK_MAIL_SERVER || 'smtp.gmail.com',
      port: process.env.FLASK_MAIL_PORT || '587',
      user: process.env.FLASK_MAIL_USERNAME || 'CLTVolunteerCentral@gmail.com'
    })

    // Create email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .hours-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${action === 'approve' ? 'Hours Approved!' : 'Hours Update'}</h1>
            <p>Volunteer Central</p>
          </div>
          
          <div class="content">
            <h2>Hello ${emailData.student_name}!</h2>
            
            ${action === 'approve' ? `
              <p>Great news! Your volunteer hours have been approved.</p>
              
              <div class="hours-details">
                <h3>Approved Details:</h3>
                <p><strong>Activity:</strong> ${emailData.opportunity_title}</p>
                <p><strong>Hours:</strong> ${emailData.hours_logged}</p>
                <p><strong>Date:</strong> ${emailData.volunteer_date}</p>
                <p><strong>Description:</strong> ${emailData.description}</p>
                <p><strong>Approved by:</strong> ${emailData.approved_by}</p>
                <p><strong>Approved on:</strong> ${emailData.approved_date}</p>
                <p><strong>Total Hours:</strong> ${emailData.total_hours}</p>
              </div>
              
              <p>Thank you for your volunteer service!</p>
            ` : `
              <p>Your volunteer hours have been reviewed.</p>
              
              <div class="hours-details">
                <h3>Details:</h3>
                <p><strong>Activity:</strong> ${emailData.opportunity_title}</p>
                <p><strong>Hours:</strong> ${emailData.hours_logged}</p>
                <p><strong>Date:</strong> ${emailData.volunteer_date}</p>
                <p><strong>Status:</strong> Denied</p>
                <p><strong>Denied by:</strong> ${emailData.denied_by}</p>
                <p><strong>Denied on:</strong> ${emailData.denied_date}</p>
                ${emailData.denial_reason ? `<p><strong>Reason:</strong> ${emailData.denial_reason}</p>` : ''}
              </div>
              
              <p>If you have any questions, please contact the organization directly.</p>
            `}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${emailData.dashboard_url}" class="button">View Dashboard</a>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Volunteer Central.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email
    console.log('🚀 Sending email...')
    try {
      const mailResult = await transporter.sendMail({
        from: `"Volunteer Central" <${process.env.FLASK_MAIL_USERNAME || 'CLTVolunteerCentral@gmail.com'}>`,
        to: hours.profiles.email,
        subject: subject,
        html: htmlContent
      })
      console.log('✅ Email sent successfully!', mailResult.messageId)
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError)
      throw emailError
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

    // Update the hours record with admin override information (only if called from admin interface)
    if (!bypassAuth) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!userError && user) {
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
      }
    }

    console.log('🎉 All operations completed successfully!')
    return NextResponse.json({ 
      success: true, 
      message: `Hours ${action} notification sent successfully`,
      recipient: hours.profiles.email,
      subject: subject
    })

  } catch (error) {
    console.error('💥 FATAL ERROR in email notification service:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
