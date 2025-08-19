// List of popular email providers to exclude
const POPULAR_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'tutanota.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  'fastmail.com',
  'hushmail.com',
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
  'mailnesia.com',
  'mintemail.com',
  'mytrashmail.com',
  'nwldx.com',
  'sharklasers.com',
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
  'wegwrfmailadresse.org',
  'wegwrfmailadresse.com',
  'wegwrfmailadresse.de',
  'wegwrfmailadresse.net',
  'wegwrfmailadresse.org'
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

  // Check if it's a popular email provider
  const isPopularProvider = POPULAR_EMAIL_PROVIDERS.includes(domain)

  if (isPopularProvider) {
    return {
      isValid: true,
      isCustomDomain: false,
      domain,
      error: 'Please use an organizational email address (not a personal email like Gmail, Yahoo, etc.)'
    }
  }

  return {
    isValid: true,
    isCustomDomain: true,
    domain
  }
}

/**
 * Checks if an email domain is from a recognized organization
 */
export function isOrganizationalEmail(email: string): boolean {
  const result = validateEmail(email)
  return result.isValid && result.isCustomDomain
}

/**
 * Gets a list of example organizational email domains
 */
export function getExampleOrganizationalDomains(): string[] {
  return [
    'company.com',
    'organization.org',
    'school.edu',
    'university.edu',
    'hospital.org',
    'nonprofit.org',
    'charity.org',
    'foundation.org',
    'institute.org',
    'association.org'
  ]
}

/**
 * Formats the domain for display
 */
export function formatDomain(domain: string): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1)
}
