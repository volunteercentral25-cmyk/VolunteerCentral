import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SECRET_KEY = process.env.SECRET_KEY || 'c057f320112909a9eedff367f37a554c65ab7363cccb2f6366d5c1606446938d'

function generateVerificationToken(hoursId: string, action: string, email: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const message = `${hoursId}:${action}:${email}:${timestamp}`
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('hex')
  return `${timestamp}:${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hoursId, verificationEmail } = body

    if (!hoursId || !verificationEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the volunteer hours record
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('id', hoursId)
      .eq('student_id', user.id)
      .single()

    if (hoursError || !hoursData) {
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Check if hours are already verified
    if (hoursData.status === 'approved' || hoursData.status === 'denied') {
      return NextResponse.json({ error: 'Hours have already been verified' }, { status: 400 })
    }

    // Check cooldown period (1 hour = 3600000 milliseconds)
    const now = new Date()
    const lastEmailSent = hoursData.last_verification_email_sent
    const cooldownPeriod = 3600000 // 1 hour in milliseconds

    if (lastEmailSent) {
      const timeSinceLastEmail = now.getTime() - new Date(lastEmailSent).getTime()
      if (timeSinceLastEmail < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastEmail) / 60000) // minutes
        return NextResponse.json({ 
          error: `Please wait ${remainingTime} minutes before sending another verification email`,
          remainingMinutes: remainingTime
        }, { status: 429 })
      }
    }

    // Generate new verification tokens
    const approveToken = generateVerificationToken(hoursId, 'approve', verificationEmail)
    const denyToken = generateVerificationToken(hoursId, 'deny', verificationEmail)

    // Update the verification email and last sent time
    const { error: updateError } = await supabase
      .from('volunteer_hours')
      .update({
        verification_email: verificationEmail,
        last_verification_email_sent: now.toISOString()
      })
      .eq('id', hoursId)

    if (updateError) {
      console.error('Error updating hours:', updateError)
      return NextResponse.json({ error: 'Failed to update hours record' }, { status: 500 })
    }

    // Send verification email
    try {
      const emailServiceUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/email-service/send-verification`
        : 'http://localhost:3002/api/email-service/send-verification'

      const emailResponse = await fetch(emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hours_id: hoursId,
          verification_email: verificationEmail,
          student_name: hoursData.description || 'Student',
          hours: hoursData.hours,
          date: hoursData.date,
          approve_token: approveToken,
          deny_token: denyToken
        }),
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('Verification email sent successfully:', emailResult)
      } else {
        const errorText = await emailResponse.text()
        console.error('Email service error:', errorText)
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      hours_id: hoursId,
      verification_email: verificationEmail,
      sent_at: now.toISOString()
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
