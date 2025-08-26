import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Hours update notification email service called')
    
    const body = await request.json()
    const { hours_id, verifier_email, status, notes, admin_email } = body
    
    console.log('Email notification request:', { hours_id, verifier_email, status, admin_email })
    
    if (!hours_id || !verifier_email || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Forward the request to the Flask email service
    const emailServiceUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-notification`
      : 'http://localhost:5000/send-notification'

    console.log('Forwarding to email service:', emailServiceUrl)

    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hours_id,
        verifier_email,
        status,
        notes,
        admin_email
      }),
    })

    console.log('Email service response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email service error:', errorText)
      throw new Error(`Email service failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Email service success:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Hours update notification error:', error)
    return NextResponse.json({ 
      error: 'Failed to send email notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
