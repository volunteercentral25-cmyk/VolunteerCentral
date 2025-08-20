import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get all volunteer opportunities with registration counts
    const { data: opportunitiesData, error: opportunitiesError } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        opportunity_registrations (
          id,
          student_id,
          status
        )
      `)
      .gte('date', new Date().toISOString().split('T')[0]) // Only future opportunities
      .order('date', { ascending: true })

    if (opportunitiesError) {
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    // Process opportunities data
    const opportunities = opportunitiesData?.map(opportunity => {
      const registrations = opportunity.opportunity_registrations || []
      const volunteersRegistered = registrations.length
      const isRegistered = registrations.some((reg: any) => reg.student_id === profile.id)
      
      // Calculate duration in hours
      const startTime = opportunity.start_time ? new Date(`2000-01-01T${opportunity.start_time}`) : null
      const endTime = opportunity.end_time ? new Date(`2000-01-01T${opportunity.end_time}`) : null
      const duration = startTime && endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : 4

      // Determine if featured (mock logic - could be based on admin selection)
      const featured = Math.random() > 0.7 // 30% chance of being featured

      // Determine category based on title/description (mock logic)
      let category = 'general'
      const title = opportunity.title.toLowerCase()
      const description = opportunity.description?.toLowerCase() || ''
      
      if (title.includes('garden') || title.includes('cleanup') || description.includes('environment')) {
        category = 'environment'
      } else if (title.includes('food') || title.includes('bank') || description.includes('hunger')) {
        category = 'hunger'
      } else if (title.includes('library') || title.includes('reading') || description.includes('education')) {
        category = 'education'
      } else if (title.includes('senior') || description.includes('elderly')) {
        category = 'elderly'
      } else if (title.includes('animal') || title.includes('shelter') || description.includes('pet')) {
        category = 'animals'
      }

      // Determine difficulty (mock logic)
      let difficulty = 'medium'
      if (duration <= 2) difficulty = 'easy'
      if (duration >= 6) difficulty = 'hard'

      return {
        id: opportunity.id,
        title: opportunity.title,
        organization: 'Community Organization', // Mock - could be added to DB
        description: opportunity.description,
        location: opportunity.location,
        date: opportunity.date,
        time: opportunity.start_time && opportunity.end_time ? `${opportunity.start_time} - ${opportunity.end_time}` : '9:00 AM - 1:00 PM',
        duration: Math.round(duration),
        volunteersNeeded: opportunity.max_volunteers || 10,
        volunteersRegistered,
        category,
        difficulty,
        featured,
        isRegistered,
        isFull: volunteersRegistered >= (opportunity.max_volunteers || 10)
      }
    }) || []

    return NextResponse.json({ opportunities })
  } catch (error) {
    console.error('Opportunities API error:', error)
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { opportunityId } = body

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 })
    }

    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('opportunity_registrations')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .eq('student_id', profile.id)
      .single()

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this opportunity' }, { status: 400 })
    }

    // Register for the opportunity
    const { data: registration, error: insertError } = await supabase
      .from('opportunity_registrations')
      .insert({
        opportunity_id: opportunityId,
        student_id: profile.id,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to register for opportunity' }, { status: 500 })
    }

    // Send confirmation email (best-effort)
    try {
      // Fetch opportunity details
      const { data: opportunity } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single()

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const emailEndpoint = baseUrl ? `${baseUrl}/api/email/opportunity-confirmation` : '/api/email/opportunity-confirmation'
      await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: profile.email,
          student_name: profile.full_name || 'Student',
          title: opportunity?.title || 'Volunteer Opportunity',
          organization: 'Community Organization',
          location: opportunity?.location || 'TBD',
          date: opportunity?.date || '',
          time: opportunity?.start_time && opportunity?.end_time ? `${opportunity.start_time} - ${opportunity.end_time}` : '',
          duration: 4
        })
      })
    } catch (e) {
      console.error('Failed to send opportunity confirmation email:', e)
    }

    return NextResponse.json({ 
      success: true, 
      registration 
    })
  } catch (error) {
    console.error('Opportunities POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { opportunityId } = body

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 })
    }

    // Delete the registration
    const { error: deleteError } = await supabase
      .from('opportunity_registrations')
      .delete()
      .eq('opportunity_id', opportunityId)
      .eq('student_id', profile.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to leave opportunity' }, { status: 500 })
    }

    // Send cancellation email (best-effort)
    try {
      // Fetch opportunity details
      const { data: opportunity } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single()

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const emailEndpoint = baseUrl ? `${baseUrl}/api/email/opportunity-cancellation` : '/api/email/opportunity-cancellation'
      await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: profile.email,
          student_name: profile.full_name || 'Student',
          title: opportunity?.title || 'Volunteer Opportunity',
          organization: 'Community Organization',
          location: opportunity?.location || 'TBD',
          date: opportunity?.date || '',
          time: opportunity?.start_time && opportunity?.end_time ? `${opportunity.start_time} - ${opportunity.end_time}` : '',
          duration: 4
        })
      })
    } catch (e) {
      console.error('Failed to send opportunity cancellation email:', e)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully left opportunity'
    })
  } catch (error) {
    console.error('Opportunities DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
