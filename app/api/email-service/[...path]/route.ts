import { NextRequest, NextResponse } from 'next/server'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:5000/api/email'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    const url = new URL(request.url)
    const queryString = url.search
    
    // For Flask routes, we need to handle them differently
    if (path.startsWith('email/')) {
      const flaskPath = path.replace('email/', '')
      const response = await fetch(`${EMAIL_SERVICE_URL}/${flaskPath}${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }
    
    // For other routes, use the original logic
    const response = await fetch(`${EMAIL_SERVICE_URL}/${path}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Email service proxy error:', error)
    return NextResponse.json(
      { error: 'Email service unavailable' },
      { status: 503 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    const body = await request.json()
    
    // For Flask routes, we need to handle them differently
    if (path.startsWith('email/')) {
      const flaskPath = path.replace('email/', '')
      const response = await fetch(`${EMAIL_SERVICE_URL}/${flaskPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }
    
    // For other routes, use the original logic
    const response = await fetch(`${EMAIL_SERVICE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Email service proxy error:', error)
    return NextResponse.json(
      { error: 'Email service unavailable' },
      { status: 503 }
    )
  }
}
