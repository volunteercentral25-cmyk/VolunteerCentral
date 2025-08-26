import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  return NextResponse.json({ 
    message: 'Dynamic route working',
    id: params.id,
    token: token,
    timestamp: new Date().toISOString()
  })
}
