import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hoursId, verificationEmail } = await request.json()

    if (!hoursId || !verificationEmail) {
      return NextResponse.json({ error: 'Hours ID and verification email are required' }, { status: 400 })
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
      .eq('student_id', user.id)
      .single()

    if (hoursError || !hours) {
      return NextResponse.json({ error: 'Hours record not found' }, { status: 404 })
    }

    // Check if hours are still pending
    if (hours.status !== 'pending') {
      return NextResponse.json({ error: 'Hours are no longer pending verification' }, { status: 400 })
    }

    // Generate new verification tokens (expire old ones)
    const approveToken = crypto.randomBytes(32).toString('hex')
    const denyToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Delete old tokens for this hours record
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('hours_id', hoursId)

    // Insert new tokens
    await supabase
      .from('verification_tokens')
      .insert([
        {
          token_hash: crypto.createHash('sha256').update(approveToken).digest('hex'),
          hours_id: hoursId,
          action: 'approve',
          verifier_email: verificationEmail,
          expires_at: expiresAt
        },
        {
          token_hash: crypto.createHash('sha256').update(denyToken).digest('hex'),
          hours_id: hoursId,
          action: 'deny',
          verifier_email: verificationEmail,
          expires_at: expiresAt
        }
      ])

    // Update last verification email sent timestamp
    await supabase
      .from('volunteer_hours')
      .update({
        last_verification_email_sent: new Date().toISOString()
      })
      .eq('id', hoursId)

    // Format the volunteer date
    const volunteerDate = new Date(hours.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Prepare email data
    const emailData = {
      student_name: hours.profiles.full_name,
      opportunity_title: hours.volunteer_opportunities?.title || 'Volunteer Service',
      volunteer_date: volunteerDate,
      hours_logged: hours.hours,
      description: hours.description || 'No description provided',
      approve_url: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-hours?token=${approveToken}&action=approve`,
      deny_url: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-hours?token=${denyToken}&action=deny`,
      expires_date: expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
    }

    // Send email using the Flask Mail service
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'https://volunteercentral25-cmyk.vercel.app/api/email'
    const emailResponse = await fetch(`${emailServiceUrl}/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hours_id: hoursId,
        verifier_email: verificationEmail,
        student_id: hours.student_id
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    // Log the email
    await supabase
      .from('email_logs')
      .insert({
        recipient: verificationEmail,
        template: 'verification',
        subject: `Verify Volunteer Hours: ${hours.profiles.full_name}`,
        data: emailData,
        status: 'sent'
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email resent successfully',
      expiresAt: expiresAt
    })

  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
