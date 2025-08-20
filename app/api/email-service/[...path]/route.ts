import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    const url = new URL(request.url)
    const queryString = url.search
    const origin = `${url.protocol}//${url.host}`
    const base = process.env.EMAIL_SERVICE_URL || `${origin}/api/email`
    const response = await fetch(`${base}/${path}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const raw = await response.text()
    try {
      const data = JSON.parse(raw)
      return NextResponse.json(data, { status: response.status })
    } catch {
      return new NextResponse(raw, { status: response.status })
    }
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
    const url = new URL(request.url)
    const origin = `${url.protocol}//${url.host}`
    const base = process.env.EMAIL_SERVICE_URL || `${origin}/api/email`
    
    const response = await fetch(`${base}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const raw = await response.text()
    try {
      const data = JSON.parse(raw)
      return NextResponse.json(data, { status: response.status })
    } catch {
      return new NextResponse(raw, { status: response.status })
    }
  } catch (error) {
    console.error('Email service proxy error:', error)
    return NextResponse.json(
      { error: 'Email service unavailable' },
      { status: 503 }
    )
  }
}
