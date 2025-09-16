import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Test the Flask email service
    const flaskResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send-profile-share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_name: data.student_name || 'Test Student',
        student_email: data.student_email || 'test@example.com',
        share_url: data.share_url || 'https://volunteercentral25-cmyk.vercel.app/profile/test?token=test123',
        recipient_email: data.recipient_email || 'recipient@example.com',
        custom_message: data.custom_message || 'This is a test message from the iOS app!'
      })
    })
    
    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text()
      console.error('Flask service error:', errorText)
      return NextResponse.json({ 
        error: 'Flask email service error', 
        details: errorText,
        status: flaskResponse.status 
      }, { status: 500 })
    }
    
    const result = await flaskResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Profile share email test completed',
      flask_response: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Test profile share error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Profile share test endpoint',
    usage: 'POST with student_name, student_email, share_url, recipient_email, custom_message',
    timestamp: new Date().toISOString()
  })
}
