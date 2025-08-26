import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Simple test query
    const { data, error } = await supabase
      .from('shareable_profiles')
      .select('count')
      .limit(1)

    return NextResponse.json({ 
      message: 'Supabase test',
      data: data,
      error: error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Supabase test failed',
      error: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
