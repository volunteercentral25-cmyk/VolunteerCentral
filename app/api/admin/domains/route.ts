import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin domains API called')
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Get user profile and check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('User not admin:', profile?.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Admin access confirmed')

    // Get URL parameters for pagination and search
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('Parameters:', { page, limit, search, status })

    // Build query
    let query = supabase
      .from('trusted_email_domains')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`domain.ilike.%${search}%,reason.ilike.%${search}%`)
    }

    // Apply status filter
    if (status === 'trusted') {
      query = query.eq('is_trusted', true)
    } else if (status === 'untrusted') {
      query = query.eq('is_trusted', false)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: domains, error: domainsError, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (domainsError) {
      console.error('Error getting domains:', domainsError)
      throw domainsError
    }

    console.log('Retrieved domains:', domains?.length || 0)

    const response = {
      domains: domains || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }

    console.log('Final response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin domains API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    console.log('Add domain request body:', body)
    
    const { domain, is_trusted, reason } = body

    if (!domain || typeof is_trusted !== 'boolean') {
      console.error('Missing required fields:', { domain, is_trusted })
      return NextResponse.json({ error: 'Missing required fields: domain and is_trusted' }, { status: 400 })
    }

    // Clean and validate domain
    const cleanDomain = domain.toLowerCase().trim()
    if (!cleanDomain) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
    }

    console.log('Adding domain:', { cleanDomain, is_trusted, reason })

    // Insert new domain
    const { data, error } = await supabase
      .from('trusted_email_domains')
      .insert({
        domain: cleanDomain,
        is_trusted: is_trusted,
        reason: reason || null,
        added_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ error: 'Domain already exists' }, { status: 409 })
      }
      throw error
    }

    console.log('Successfully added domain:', data)
    return NextResponse.json({ success: true, domain: data })
  } catch (error) {
    console.error('Add domain API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
