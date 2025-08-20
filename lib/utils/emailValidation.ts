// List of disposable/temporary email providers to block
const DISPOSABLE_EMAIL_PROVIDERS = [
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.org',
  'mailinator.com',
  'throwaway.email',
  'disposablemail.com',
  'temp-mail.org',
  'getnada.com',
  'mailnesia.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dispostable.com',
  'fakeinbox.com',
  'fakeinbox.net',
  'fakemailgenerator.com',
  'maildrop.cc',
  'mailmetrash.com',
  'mintemail.com',
  'mytrashmail.com',
  'nwldx.com',
  'spamspot.com',
  'tempr.email',
  'trashmail.com',
  'trashmail.net',
  'wegwerfemail.de',
  'wegwerfemail.net',
  'wegwerfemail.org',
  'wegwerfemailadresse.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'wegwerfmailadresse.com',
  'wegwerpmailadres.nl',
  'wegwrfmail.de',
  'wegwrfmail.net',
  'wegwrfmail.org',
  'wegwrfmailadresse.com',
  'wegwrfmailadresse.de',
  'wegwrfmailadresse.net',
  'wegwrfmailadresse.org'
]

// List of popular personal email providers that are NOT accepted for verification
const POPULAR_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
]

export interface EmailValidationResult {
  isValid: boolean
  isCustomDomain: boolean
  domain: string
  error?: string
}

/**
 * Validates email format and checks if it's from a custom domain
 */
export function validateEmail(email: string): EmailValidationResult {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isCustomDomain: false,
      domain: '',
      error: 'Please enter a valid email address'
    }
  }

  // Extract domain
  const domain = email.split('@')[1].toLowerCase()

  // Block disposable/temporary domains
  if (DISPOSABLE_EMAIL_PROVIDERS.includes(domain)) {
    return {
      isValid: false,
      isCustomDomain: false,
      domain,
      error: 'Please use a valid email address (disposable/temporary emails are not allowed)'
    }
  }

  // If it's a popular personal provider, mark as not custom
  const isPersonal = POPULAR_EMAIL_PROVIDERS.includes(domain)

  return {
    isValid: true,
    isCustomDomain: !isPersonal,
    domain
  }
}

/**
 * Checks if an email is valid (allows popular providers)
 */
export function isOrganizationalEmail(email: string): boolean {
  const result = validateEmail(email)
  return result.isValid && result.isCustomDomain
}

/**
 * Gets a list of example email domains (including popular providers)
 */
export function getExampleOrganizationalDomains(): string[] {
  return [
    'company.com',
    'organization.org',
    'school.edu',
    'university.edu',
    'hospital.org',
    'nonprofit.org'
  ]
}

/**
 * Formats the domain for display
 */
export function formatDomain(domain: string): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1)
}
