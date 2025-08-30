import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SECRET_KEY = process.env.SECRET_KEY || 'c057f320112909a9eedff367f37a554c65ab7363cccb2f6366d5c1606446938d'

function verifyToken(token: string, hoursId: string, action: string, email: string): boolean {
  try {
    // Parse the token format: timestamp:signature
    const [timestampStr, signature] = token.split(':', 2)
    if (!timestampStr || !signature) {
      console.error('Invalid token format')
      return false
    }

    const timestamp = parseInt(timestampStr)
    const now = Math.floor(Date.now() / 1000)
    
    // Check if token is expired (7 days = 604800 seconds)
    if (now - timestamp > 604800) {
      console.error('Token expired')
      return false
    }
    
    // Verify signature
    const message = `${hoursId}:${action}:${email}:${timestampStr}`
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(message)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action')
    const hoursId = searchParams.get('hours_id')
    const verifierEmail = searchParams.get('email')
    const notes = searchParams.get('notes') || ''

    console.log('Hours verification request:', { token, action, hoursId, verifierEmail })

    if (!token || !action || !hoursId || !verifierEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verify token
    if (!verifyToken(token, hoursId, action, verifierEmail)) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Get hours data
    const { data: hoursData, error: hoursError } = await supabase
      .from('volunteer_hours')
      .select('*')
      .eq('id', hoursId)
      .single()

    if (hoursError || !hoursData) {
      console.error('Error getting hours:', hoursError)
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Get student profile
    const { data: studentProfile, error: studentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', hoursData.student_id)
      .single()

    if (studentError || !studentProfile) {
      console.error('Error getting student profile:', studentError)
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Update hours status
    const status = action === 'approve' ? 'approved' : 'denied'
    const { error: updateError } = await supabase
      .from('volunteer_hours')
      .update({
        status: status,
        verified_by: verifierEmail,
        verification_notes: notes,
        verification_date: new Date().toISOString()
      })
      .eq('id', hoursId)

    if (updateError) {
      console.error('Error updating hours:', updateError)
      console.error('Update data:', { status, verified_by: verifierEmail, verification_notes: notes, verification_date: new Date().toISOString() })
      return NextResponse.json({ error: 'Failed to update hours status', details: updateError.message }, { status: 500 })
    }

    console.log('Hours verification successful:', { hoursId, status, verifierEmail })

    // Send email notification to student
    try {
      const emailServiceUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      console.log('🔔 VERIFY-HOURS: Sending email notification to student:', studentProfile.full_name)
      console.log('📧 Email will be sent to:', studentProfile.email)
      console.log('📍 EMAIL URL:', `${emailServiceUrl}/api/email-service/send-hours-notification`)
      
      // Use the Next.js email service directly (it's working and has proper templates)
      const emailPayload = {
        hoursId: hoursId,
        action: action,
        reason: notes,
        bypassAuth: true  // Bypass auth check for email verification system
      }
      console.log('📦 Email payload:', emailPayload)

      const emailResponse = await fetch(`${emailServiceUrl}/api/email-service/send-hours-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })

      console.log('📬 Email service response status:', emailResponse.status)
      
      if (emailResponse.ok) {
        const result = await emailResponse.json()
        console.log('✅ VERIFY-HOURS: Hours notification email sent successfully:', result)
      } else {
        const errorText = await emailResponse.text()
        console.error('❌ VERIFY-HOURS: Email service failed:', errorText)
        console.error('❌ Response headers:', Object.fromEntries(emailResponse.headers.entries()))
      }
    } catch (emailError) {
      console.error('💥 VERIFY-HOURS: Error sending hours notification email:', emailError)
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Hours ${action} successfully`,
      hours_id: hoursId,
      status: status,
      verifier_email: verifierEmail,
      student_name: studentProfile.full_name,
      activity: hoursData.description,
      hours: hoursData.hours,
      date: hoursData.date
    })

  } catch (error) {
    console.error('Hours verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
