import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Send verification email service called')
    
    const body = await request.json()
    const { hours_id, verification_email, student_name, hours, date, approve_token, deny_token } = body
    
    console.log('Verification email request:', { hours_id, verification_email, student_name })

    if (!hours_id || !verification_email || !approve_token || !deny_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prepare email content
    const subject = "Volunteer Hours Verification Request"
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Volunteer Hours Verification Request</h2>
        <p>Hello,</p>
        <p>You have received a request to verify volunteer hours for <strong>${student_name}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Volunteer Hours Details:</h3>
          <p><strong>Activity:</strong> ${student_name}</p>
          <p><strong>Hours:</strong> ${hours}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Student:</strong> ${student_name}</p>
        </div>
        
        <p>Please click one of the buttons below to verify these hours:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/email-service/verify-hours?token=${approve_token}&action=approve&hours_id=${hours_id}&email=${verification_email}" 
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px; display: inline-block;">
            ✓ Approve Hours
          </a>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/email-service/verify-hours?token=${deny_token}&action=deny&hours_id=${hours_id}&email=${verification_email}" 
             style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ✗ Deny Hours
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666;">
          This verification link will expire in 7 days. If you have any questions, please contact the student directly.
        </p>
      </div>
    `

    // For now, just log the email content since we don't have a direct email service
    console.log('Email would be sent to:', verification_email)
    console.log('Subject:', subject)
    console.log('Content:', htmlContent)

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, we'll just return success and log the email content

    return NextResponse.json({
      success: true,
      message: `Verification email prepared for ${verification_email}`,
      verification_email: verification_email,
      hours_id: hours_id,
      subject: subject
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
