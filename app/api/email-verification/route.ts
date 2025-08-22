import { NextRequest, NextResponse } from 'next/server'

const EMAIL_LIST_VERIFY_API_KEY = '1Rauf1CKVzhk4r5VmNOMvZnaWs73odjU'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Call EmailListVerify API with correct parameters
    const response = await fetch('https://api.emaillistverify.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        key: EMAIL_LIST_VERIFY_API_KEY,
        format: 'json'
      })
    })

    console.log('EmailListVerify API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EmailListVerify API Error Response:', errorText)
      throw new Error(`EmailListVerify API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('EmailListVerify API Result:', result)

    // Handle different response formats
    let status = result.status || result.code || 0
    let message = result.message || result.msg || 'Unknown response'

    // EmailListVerify returns different status codes
    // 200: Valid email
    // 400: Invalid email
    // 401: Disposable email
    // 402: Invalid domain
    // 403: Invalid format

    const isDisposable = status === 401
    const isValid = status === 200

    return NextResponse.json({
      isValid: isValid && !isDisposable,
      isDisposable: isDisposable,
      status: status,
      message: message || getStatusMessage(status)
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to verify email',
        details: errorMessage,
        isValid: false,
        isDisposable: false,
        status: 500,
        message: 'Email verification service unavailable'
      },
      { status: 500 }
    )
  }
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 200:
      return 'Valid email address'
    case 400:
      return 'Invalid email address'
    case 401:
      return 'Disposable email address not allowed'
    case 402:
      return 'Invalid domain'
    case 403:
      return 'Invalid email format'
    default:
      return 'Unknown error'
  }
}
