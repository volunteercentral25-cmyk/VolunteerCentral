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

    // Send email using the Flask email service
    const emailServiceUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log('🔧 Using email service URL:', emailServiceUrl)
    const emailResponse = await fetch(`${emailServiceUrl}/api/email/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hours_id: hours_id,
        verifier_email: verification_email,
        student_name: student_name,
        hours: hours,
        date: date,
        approve_token: approve_token,
        deny_token: deny_token
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Flask email service failed:', errorText)
      throw new Error('Failed to send verification email')
    }

    const result = await emailResponse.json()
    console.log('✅ Verification email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: `Verification email prepared for ${verification_email}`,
      verification_email: verification_email,
      hours_id: hours_id
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
