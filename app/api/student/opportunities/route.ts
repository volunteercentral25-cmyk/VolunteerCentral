import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const club = searchParams.get('club') || ''
    
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

    // Build query for opportunities
    let query = supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        opportunity_registrations (
          id,
          student_id,
          status
        )
      `)
      .order('date', { ascending: true })

    // Add club filter - simplified approach
    if (club) {
      if (club === 'beta_club') {
        query = query.or('club_restriction.eq.beta_club,club_restriction.eq.anyone')
      } else if (club === 'nths') {
        query = query.or('club_restriction.eq.nths,club_restriction.eq.anyone')
      } else if (club === 'both') {
        query = query.or('club_restriction.eq.both,club_restriction.eq.anyone')
      }
    }

    const { data: opportunitiesData, error: opportunitiesError } = await query

    if (opportunitiesError) {
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    // Process opportunities data and filter based on club restrictions
    const opportunities = opportunitiesData?.map(opportunity => {
      const registrations = opportunity.opportunity_registrations || []
      const activeRegistrations = registrations.filter((reg: any) => reg.status !== 'denied')
      const volunteersRegistered = activeRegistrations.length
      const isRegistered = registrations.some((reg: any) => reg.student_id === profile.id && reg.status !== 'denied')
      
      // Calculate duration in hours
      const startTime = opportunity.start_time ? new Date(`2000-01-01T${opportunity.start_time}`) : null
      const endTime = opportunity.end_time ? new Date(`2000-01-01T${opportunity.end_time}`) : null
      const duration = startTime && endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : 4

      // Determine if featured (ensure we have some featured opportunities)
      const featured = Math.random() > 0.5 // 50% chance of being featured

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
        isFull: volunteersRegistered >= (opportunity.max_volunteers || 10),
        requirements: opportunity.requirements,
        club_restriction: opportunity.club_restriction || 'anyone'
      }
    }) || []

    // Filter opportunities based on club restrictions
    const filteredOpportunities = opportunities.filter(opportunity => {
      const { club_restriction } = opportunity
      
      // If no club restriction, show to everyone
      if (club_restriction === 'anyone') {
        return true
      }
      
      // Check if student meets the club restriction
      if (club_restriction === 'beta_club') {
        return profile.beta_club === true
      }
      
      if (club_restriction === 'nths') {
        return profile.nths === true
      }
      
      if (club_restriction === 'both') {
        return profile.beta_club === true && profile.nths === true
      }
      
      return true
    })

    return NextResponse.json({ 
      opportunities: filteredOpportunities,
      userClubs: {
        beta_club: profile.beta_club || false,
        nths: profile.nths || false
      }
    })
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

    // Get the opportunity details to check club restrictions
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()

    if (opportunityError || !opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Check if student meets the club restriction requirements
    const { club_restriction } = opportunity
    
    if (club_restriction !== 'anyone') {
      let hasAccess = false
      
      if (club_restriction === 'beta_club') {
        hasAccess = profile.beta_club === true
      } else if (club_restriction === 'nths') {
        hasAccess = profile.nths === true
      } else if (club_restriction === 'both') {
        hasAccess = profile.beta_club === true && profile.nths === true
      }
      
      if (!hasAccess) {
        return NextResponse.json({ 
          error: `This opportunity is restricted to ${club_restriction === 'beta_club' ? 'Beta Club' : club_restriction === 'nths' ? 'NTHS' : 'both Beta Club and NTHS'} members only. You do not have the required club membership.` 
        }, { status: 403 })
      }
    }

    // Check if already registered (excluding declined registrations)
    const { data: existingRegistration, error: checkError } = await supabase
      .from('opportunity_registrations')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .eq('student_id', profile.id)
      .neq('status', 'denied')
      .maybeSingle()

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
