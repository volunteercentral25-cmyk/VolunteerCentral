import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the site URL from environment or use the request origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Send the password reset email using Supabase Auth
    // Supabase will handle checking if the email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (error) {
      console.error('Password reset email error:', error)
      
      // Check if the error is because the email doesn't exist
      if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
