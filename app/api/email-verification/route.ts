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

    // Call EmailListVerify API
    const response = await fetch('https://api.emaillistverify.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        key: EMAIL_LIST_VERIFY_API_KEY
      })
    })

    if (!response.ok) {
      throw new Error(`EmailListVerify API error: ${response.status}`)
    }

    const result = await response.json()

    // EmailListVerify returns different status codes
    // 200: Valid email
    // 400: Invalid email
    // 401: Disposable email
    // 402: Invalid domain
    // 403: Invalid format

    const isDisposable = result.status === 401
    const isValid = result.status === 200

    return NextResponse.json({
      isValid: isValid && !isDisposable,
      isDisposable: isDisposable,
      status: result.status,
      message: result.message || getStatusMessage(result.status)
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
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
