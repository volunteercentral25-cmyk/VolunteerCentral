import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH TEST START ===')
    
    // Check environment variables
    console.log('Environment variables:', {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'NOT SET'
    })
    
    const supabase = createClient()
    
    // Test basic connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session test:', { session: !!session, error: sessionError })
    
    // Test user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('User test:', { user: !!user, userId: user?.id, email: user?.email, error: userError })
    
    // Test simple database query
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(1)
    
    console.log('Database test:', { 
      dataCount: testData?.length || 0, 
      error: testError,
      firstRecord: testData?.[0] 
    })
    
    return NextResponse.json({
      success: true,
      session: !!session,
      user: !!user,
      userId: user?.id,
      userEmail: user?.email,
      databaseWorking: !testError,
      dataCount: testData?.length || 0
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    console.log('=== AUTH TEST END ===')
  }
}
