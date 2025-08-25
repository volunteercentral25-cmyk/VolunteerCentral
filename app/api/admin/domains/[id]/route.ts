import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Update domain request body:', body)
    
    const { is_trusted, reason } = body
    const domainId = params.id

    if (typeof is_trusted !== 'boolean') {
      console.error('Missing required fields:', { is_trusted })
      return NextResponse.json({ error: 'Missing required field: is_trusted' }, { status: 400 })
    }

    console.log('Updating domain:', { domainId, is_trusted, reason })

    // Update domain
    const { data, error } = await supabase
      .from('trusted_email_domains')
      .update({
        is_trusted: is_trusted,
        reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    console.log('Successfully updated domain:', data)
    return NextResponse.json({ success: true, domain: data })
  } catch (error) {
    console.error('Update domain API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const domainId = params.id
    console.log('Deleting domain:', domainId)

    // Delete domain
    const { data, error } = await supabase
      .from('trusted_email_domains')
      .delete()
      .eq('id', domainId)
      .select()
      .single()

    if (error) {
      console.error('Database delete error:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    console.log('Successfully deleted domain:', data)
    return NextResponse.json({ success: true, domain: data })
  } catch (error) {
    console.error('Delete domain API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
