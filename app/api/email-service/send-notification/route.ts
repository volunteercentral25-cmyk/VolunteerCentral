import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Send notification email service called')
    
    const body = await request.json()
    const { hours_id, student_email, status, verifier_email, notes } = body
    
    console.log('Email notification request:', { hours_id, student_email, status, verifier_email })

    if (!hours_id || !student_email || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Get hours data
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('id', hours_id)
      .single()

    if (hoursError || !hoursData) {
      console.error('Error getting hours:', hoursError)
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Prepare email content based on status
    let subject: string
    let htmlContent: string

    if (status === 'approved') {
      subject = "Your Volunteer Hours Have Been Approved!"
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✓ Hours Approved!</h2>
          <p>Great news! Your volunteer hours have been approved.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Approved Details:</h3>
            <p><strong>Activity:</strong> ${hoursData.description || 'Volunteer Activity'}</p>
            <p><strong>Hours:</strong> ${hoursData.hours}</p>
            <p><strong>Date:</strong> ${hoursData.date}</p>
            <p><strong>Approved by:</strong> ${verifier_email || 'Unknown'}</p>
            <p><strong>Approved on:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Thank you for your volunteer service!</p>
        </div>
      `
    } else {
      subject = "Volunteer Hours Update"
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Hours Status Update</h2>
          <p>Your volunteer hours have been reviewed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Details:</h3>
            <p><strong>Activity:</strong> ${hoursData.description || 'Volunteer Activity'}</p>
            <p><strong>Hours:</strong> ${hoursData.hours}</p>
            <p><strong>Date:</strong> ${hoursData.date}</p>
            <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
            <p><strong>Reviewed by:</strong> ${verifier_email || 'Unknown'}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <p>If you have any questions, please contact the organization directly.</p>
        </div>
      `
    }

    // For now, just log the email content since we don't have a direct email service
    console.log('Email would be sent to:', student_email)
    console.log('Subject:', subject)
    console.log('Content:', htmlContent)

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, we'll just return success and log the email content

    return NextResponse.json({
      success: true,
      message: `Notification email prepared for ${student_email}`,
      student_email: student_email,
      status: status,
      subject: subject
    })

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
