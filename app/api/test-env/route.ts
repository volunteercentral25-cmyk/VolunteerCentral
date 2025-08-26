import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Environment test',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
    timestamp: new Date().toISOString()
  })
}
