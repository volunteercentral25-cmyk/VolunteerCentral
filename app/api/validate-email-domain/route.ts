import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isDisposableEmail, isDisposableEmailSync } from '@/lib/utils/disposableEmailDomains'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ 
        error: 'Invalid email address',
        isValid: false 
      }, { status: 400 })
    }

    const domain = email.split('@')[1].toLowerCase()
    console.log('Validating email domain:', domain)

    const supabase = createClient()

    // Check database first for explicit trust/untrust settings
    const { data: domainData, error: domainError } = await supabase
      .rpc('get_domain_trust_info', { domain_name: domain })

    if (domainError) {
      console.error('Error checking domain trust:', domainError)
    }

    let isExplicitlyTrusted = null
    let isExplicitlyUntrusted = null
    let databaseReason = null

    if (domainData && domainData.length > 0) {
      const info = domainData[0]
      if (info.exists_in_db) {
        if (info.is_trusted) {
          isExplicitlyTrusted = true
        } else {
          isExplicitlyUntrusted = true
        }
        databaseReason = info.reason
      }
    }

    // Check if it's a disposable email (async check)
    let isDisposable = false
    try {
      isDisposable = await isDisposableEmail(email)
    } catch (error) {
      console.error('Error checking disposable email:', error)
      // Fallback to sync check
      isDisposable = isDisposableEmailSync(email)
    }

    // Determine final status
    let isValid = true
    let status = 'trusted'
    let reason = 'Domain is trusted'

    if (isExplicitlyUntrusted) {
      isValid = false
      status = 'untrusted'
      reason = databaseReason || 'Domain is explicitly marked as untrusted'
    } else if (isExplicitlyTrusted) {
      isValid = true
      status = 'trusted'
      reason = databaseReason || 'Domain is explicitly marked as trusted'
    } else if (isDisposable) {
      isValid = false
      status = 'disposable'
      reason = 'Domain appears to be a disposable/temporary email service'
    } else {
      // Default to trusted for unknown domains
      isValid = true
      status = 'trusted'
      reason = 'Domain is not known to be untrusted'
    }

    const response = {
      email,
      domain,
      isValid,
      status,
      reason,
      checks: {
        explicitlyTrusted: isExplicitlyTrusted,
        explicitlyUntrusted: isExplicitlyUntrusted,
        isDisposable,
        existsInDatabase: domainData && domainData.length > 0 && domainData[0].exists_in_db
      }
    }

    console.log('Domain validation result:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Email domain validation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      isValid: false 
    }, { status: 500 })
  }
}
