import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test public API called')
    
    const supabase = createClient()
    console.log('Supabase client created')

    // Test with a very simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    console.log('Simple query result:', { data, error })

    return NextResponse.json({ 
      message: 'Test successful',
      data: data,
      error: error,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set'
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
