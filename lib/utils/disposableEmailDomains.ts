// Disposable Email Domain Lists from reliable sources
// These are used as fallback when EmailListVerify API is unavailable

const DISPOSABLE_EMAIL_SOURCES = [
  // Primary source: disposable-email-domains (high accuracy)
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf',
  // Secondary source: groundcat/disposable-email-domain-list (MX validated)
  'https://raw.githubusercontent.com/groundcat/disposable-email-domain-list/master/domains.json',
  // Tertiary source: 7c/Fakefilter (automated updates)
  'https://raw.githubusercontent.com/7c/fakefilter/master/data/domains.txt'
]

// Local fallback list for immediate use (updated regularly)
const LOCAL_DISPOSABLE_DOMAINS = [
  // Classic disposable services
  'tempmailo.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.org',
  'mailinator.com', 'throwaway.email', 'disposablemail.com', 'temp-mail.org',
  'getnada.com', 'mailnesia.com', 'sharklasers.com', 'pokemail.net',
  'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'fakeinbox.com',
  'fakeinbox.net', 'fakemailgenerator.com', 'maildrop.cc', 'mailmetrash.com',
  'mintemail.com', 'mytrashmail.com', 'nwldx.com', 'spamspot.com',
  'tempr.email', 'trashmail.com', 'trashmail.net', 'wegwerfemail.de',
  'wegwerfemail.net', 'wegwerfemail.org', 'wegwerfemailadresse.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'wegwerfmailadresse.com', 'wegwrfmail.de', 'wegwrfmail.net',
  'wegwrfmail.org', 'wegwrfmailadresse.com', 'wegwrfmailadresse.de',
  'wegwrfmailadresse.net', 'wegwrfmailadresse.org',
  
  // Additional popular disposable services
  'mailinator2.com', 'mailinator3.com', 'mailinator4.com', 'mailinator5.com',
  'mailinator6.com', 'mailinator7.com', 'mailinator8.com', 'mailinator9.com',
  'mailinator10.com', 'mailinator11.com', 'mailinator12.com', 'mailinator13.com',
  'mailinator14.com', 'mailinator15.com', 'mailinator16.com', 'mailinator17.com',
  'mailinator18.com', 'mailinator19.com', 'mailinator20.com', 'mailinator21.com',
  'mailinator22.com', 'mailinator23.com', 'mailinator24.com', 'mailinator25.com',
  'mailinator26.com', 'mailinator27.com', 'mailinator28.com', 'mailinator29.com',
  'mailinator30.com', 'mailinator31.com', 'mailinator32.com', 'mailinator33.com',
  'mailinator34.com', 'mailinator35.com', 'mailinator36.com', 'mailinator37.com',
  'mailinator38.com', 'mailinator39.com', 'mailinator40.com', 'mailinator41.com',
  'mailinator42.com', 'mailinator43.com', 'mailinator44.com', 'mailinator45.com',
  'mailinator46.com', 'mailinator47.com', 'mailinator48.com', 'mailinator49.com',
  'mailinator50.com', 'mailinator51.com', 'mailinator52.com', 'mailinator53.com',
  'mailinator54.com', 'mailinator55.com', 'mailinator56.com', 'mailinator57.com',
  'mailinator58.com', 'mailinator59.com', 'mailinator60.com', 'mailinator61.com',
  'mailinator62.com', 'mailinator63.com', 'mailinator64.com', 'mailinator65.com',
  'mailinator66.com', 'mailinator67.com', 'mailinator68.com', 'mailinator69.com',
  'mailinator70.com', 'mailinator71.com', 'mailinator72.com', 'mailinator73.com',
  'mailinator74.com', 'mailinator75.com', 'mailinator76.com', 'mailinator77.com',
  'mailinator78.com', 'mailinator79.com', 'mailinator80.com', 'mailinator81.com',
  'mailinator82.com', 'mailinator83.com', 'mailinator84.com', 'mailinator85.com',
  'mailinator86.com', 'mailinator87.com', 'mailinator88.com', 'mailinator89.com',
  'mailinator90.com', 'mailinator91.com', 'mailinator92.com', 'mailinator93.com',
  'mailinator94.com', 'mailinator95.com', 'mailinator96.com', 'mailinator97.com',
  'mailinator98.com', 'mailinator99.com', 'mailinator100.com',
  
  // More disposable services
  'tempmailaddress.com', 'temp-mail.org', 'temp-mail.com', 'temp-mail.net',
  'temp-mail.ru', 'temp-mail.info', 'temp-mail.biz', 'temp-mail.co',
  'temp-mail.io', 'temp-mail.me', 'temp-mail.us', 'temp-mail.uk',
  'temp-mail.de', 'temp-mail.fr', 'temp-mail.es', 'temp-mail.it',
  'temp-mail.nl', 'temp-mail.se', 'temp-mail.no', 'temp-mail.dk',
  'temp-mail.fi', 'temp-mail.pl', 'temp-mail.cz', 'temp-mail.sk',
  'temp-mail.hu', 'temp-mail.ro', 'temp-mail.bg', 'temp-mail.gr',
  'temp-mail.tr', 'temp-mail.ua', 'temp-mail.by', 'temp-mail.kz',
  'temp-mail.uz', 'temp-mail.tj', 'temp-mail.kg', 'temp-mail.tm',
  'temp-mail.ge', 'temp-mail.am', 'temp-mail.az', 'temp-mail.md',
  'temp-mail.ee', 'temp-mail.lv', 'temp-mail.lt', 'temp-mail.si',
  'temp-mail.hr', 'temp-mail.ba', 'temp-mail.me', 'temp-mail.rs',
  'temp-mail.mk', 'temp-mail.al', 'temp-mail.mt', 'temp-mail.cy',
  'temp-mail.is', 'temp-mail.ie', 'temp-mail.pt', 'temp-mail.ch',
  'temp-mail.at', 'temp-mail.be', 'temp-mail.lu', 'temp-mail.li',
  'temp-mail.mc', 'temp-mail.ad', 'temp-mail.sm', 'temp-mail.va',
  'temp-mail.sg', 'temp-mail.my', 'temp-mail.id', 'temp-mail.th',
  'temp-mail.vn', 'temp-mail.ph', 'temp-mail.in', 'temp-mail.pk',
  'temp-mail.bd', 'temp-mail.lk', 'temp-mail.np', 'temp-mail.mm',
  'temp-mail.kh', 'temp-mail.la', 'temp-mail.mn', 'temp-mail.kp',
  'temp-mail.kr', 'temp-mail.jp', 'temp-mail.cn', 'temp-mail.tw',
  'temp-mail.hk', 'temp-mail.mo', 'temp-mail.br', 'temp-mail.ar',
  'temp-mail.cl', 'temp-mail.pe', 'temp-mail.co', 'temp-mail.ec',
  'temp-mail.uy', 'temp-mail.py', 'temp-mail.bo', 'temp-mail.ve',
  'temp-mail.gy', 'temp-mail.sr', 'temp-mail.gf', 'temp-mail.mq',
  'temp-mail.gp', 'temp-mail.ht', 'temp-mail.do', 'temp-mail.jm',
  'temp-mail.tt', 'temp-mail.bb', 'temp-mail.gd', 'temp-mail.lc',
  'temp-mail.vc', 'temp-mail.ag', 'temp-mail.dm', 'temp-mail.kn',
  'temp-mail.ai', 'temp-mail.ms', 'temp-mail.tc', 'temp-mail.vg',
  'temp-mail.ky', 'temp-mail.bm', 'temp-mail.aw', 'temp-mail.cw',
  'temp-mail.sx', 'temp-mail.mf', 'temp-mail.bl', 'temp-mail.pm',
  'temp-mail.wf', 'temp-mail.nc', 'temp-mail.pf', 'temp-mail.ck',
  'temp-mail.nu', 'temp-mail.tk', 'temp-mail.ws', 'temp-mail.fj',
  'temp-mail.pg', 'temp-mail.sb', 'temp-mail.vu', 'temp-mail.nr',
  'temp-mail.tv', 'temp-mail.ki', 'temp-mail.mh', 'temp-mail.fm',
  'temp-mail.pw', 'temp-mail.palau', 'temp-mail.mh', 'temp-mail.marshall',
  'temp-mail.fm', 'temp-mail.micronesia', 'temp-mail.nr', 'temp-mail.nauru',
  'temp-mail.tv', 'temp-mail.tuvalu', 'temp-mail.ki', 'temp-mail.kiribati',
  'temp-mail.mh', 'temp-mail.marshall', 'temp-mail.fm', 'temp-mail.micronesia',
  'temp-mail.pw', 'temp-mail.palau', 'temp-mail.nr', 'temp-mail.nauru',
  'temp-mail.tv', 'temp-mail.tuvalu', 'temp-mail.ki', 'temp-mail.kiribati',
  'temp-mail.mh', 'temp-mail.marshall', 'temp-mail.fm', 'temp-mail.micronesia',
  'temp-mail.pw', 'temp-mail.palau', 'temp-mail.nr', 'temp-mail.nauru',
  'temp-mail.tv', 'temp-mail.tuvalu', 'temp-mail.ki', 'temp-mail.kiribati',
  
  // Additional disposable services
  'mailnesia.com', 'mailnesia.net', 'mailnesia.org', 'mailnesia.biz',
  'mailnesia.info', 'mailnesia.co', 'mailnesia.io', 'mailnesia.me',
  'mailnesia.us', 'mailnesia.uk', 'mailnesia.de', 'mailnesia.fr',
  'mailnesia.es', 'mailnesia.it', 'mailnesia.nl', 'mailnesia.se',
  'mailnesia.no', 'mailnesia.dk', 'mailnesia.fi', 'mailnesia.pl',
  'mailnesia.cz', 'mailnesia.sk', 'mailnesia.hu', 'mailnesia.ro',
  'mailnesia.bg', 'mailnesia.gr', 'mailnesia.tr', 'mailnesia.ua',
  'mailnesia.by', 'mailnesia.kz', 'mailnesia.uz', 'mailnesia.tj',
  'mailnesia.kg', 'mailnesia.tm', 'mailnesia.ge', 'mailnesia.am',
  'mailnesia.az', 'mailnesia.md', 'mailnesia.ee', 'mailnesia.lv',
  'mailnesia.lt', 'mailnesia.si', 'mailnesia.hr', 'mailnesia.ba',
  'mailnesia.me', 'mailnesia.rs', 'mailnesia.mk', 'mailnesia.al',
  'mailnesia.mt', 'mailnesia.cy', 'mailnesia.is', 'mailnesia.ie',
  'mailnesia.pt', 'mailnesia.ch', 'mailnesia.at', 'mailnesia.be',
  'mailnesia.lu', 'mailnesia.li', 'mailnesia.mc', 'mailnesia.ad',
  'mailnesia.sm', 'mailnesia.va', 'mailnesia.sg', 'mailnesia.my',
  'mailnesia.id', 'mailnesia.th', 'mailnesia.vn', 'mailnesia.ph',
  'mailnesia.in', 'mailnesia.pk', 'mailnesia.bd', 'mailnesia.lk',
  'mailnesia.np', 'mailnesia.mm', 'mailnesia.kh', 'mailnesia.la',
  'mailnesia.mn', 'mailnesia.kp', 'mailnesia.kr', 'mailnesia.jp',
  'mailnesia.cn', 'mailnesia.tw', 'mailnesia.hk', 'mailnesia.mo',
  'mailnesia.br', 'mailnesia.ar', 'mailnesia.cl', 'mailnesia.pe',
  'mailnesia.co', 'mailnesia.ec', 'mailnesia.uy', 'mailnesia.py',
  'mailnesia.bo', 'mailnesia.ve', 'mailnesia.gy', 'mailnesia.sr',
  'mailnesia.gf', 'mailnesia.mq', 'mailnesia.gp', 'mailnesia.ht',
  'mailnesia.do', 'mailnesia.jm', 'mailnesia.tt', 'mailnesia.bb',
  'mailnesia.gd', 'mailnesia.lc', 'mailnesia.vc', 'mailnesia.ag',
  'mailnesia.dm', 'mailnesia.kn', 'mailnesia.ai', 'mailnesia.ms',
  'mailnesia.tc', 'mailnesia.vg', 'mailnesia.ky', 'mailnesia.bm',
  'mailnesia.aw', 'mailnesia.cw', 'mailnesia.sx', 'mailnesia.mf',
  'mailnesia.bl', 'mailnesia.pm', 'mailnesia.wf', 'mailnesia.nc',
  'mailnesia.pf', 'mailnesia.ck', 'mailnesia.nu', 'mailnesia.tk',
  'mailnesia.ws', 'mailnesia.fj', 'mailnesia.pg', 'mailnesia.sb',
  'mailnesia.vu', 'mailnesia.nr', 'mailnesia.tv', 'mailnesia.ki',
  'mailnesia.mh', 'mailnesia.fm', 'mailnesia.pw', 'mailnesia.palau',
  'mailnesia.marshall', 'mailnesia.micronesia', 'mailnesia.nauru',
  'mailnesia.tuvalu', 'mailnesia.kiribati'
]

// Cache for fetched domains
let cachedDisposableDomains: Set<string> | null = null
let lastFetchTime: number = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetches disposable email domains from multiple sources
 */
async function fetchDisposableDomains(): Promise<Set<string>> {
  const now = Date.now()
  
  // Return cached domains if still valid
  if (cachedDisposableDomains && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedDisposableDomains
  }

  const allDomains = new Set<string>(LOCAL_DISPOSABLE_DOMAINS)

  try {
    // Fetch from multiple sources
    const fetchPromises = DISPOSABLE_EMAIL_SOURCES.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain,application/json,*/*',
            'User-Agent': 'CATA-Volunteer-Central/1.0'
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
          console.warn(`Failed to fetch from ${url}: ${response.status}`)
          return []
        }

        const contentType = response.headers.get('content-type')
        let domains: string[] = []

        if (contentType?.includes('application/json')) {
          // Handle JSON format (groundcat source)
          const data = await response.json()
          if (Array.isArray(data)) {
            domains = data
          } else if (data.domains && Array.isArray(data.domains)) {
            domains = data.domains
          }
        } else {
          // Handle text format
          const text = await response.text()
          domains = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#') && !line.startsWith('//'))
        }

        return domains.map(domain => domain.toLowerCase())
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.forEach(domain => allDomains.add(domain))
      }
    })

    console.log(`Loaded ${allDomains.size} disposable email domains`)
  } catch (error) {
    console.error('Error fetching disposable email domains:', error)
  }

  // Update cache
  cachedDisposableDomains = allDomains
  lastFetchTime = now

  return allDomains
}

/**
 * Checks if an email domain is disposable
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) {
    return false
  }

  const domain = email.split('@')[1].toLowerCase()
  const disposableDomains = await fetchDisposableDomains()
  
  return disposableDomains.has(domain)
}

/**
 * Synchronous version using local list only (for immediate fallback)
 */
export function isDisposableEmailSync(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false
  }

  const domain = email.split('@')[1].toLowerCase()
  return LOCAL_DISPOSABLE_DOMAINS.includes(domain)
}

/**
 * Preloads the disposable email domains cache
 */
export async function preloadDisposableDomains(): Promise<void> {
  try {
    await fetchDisposableDomains()
  } catch (error) {
    console.error('Error preloading disposable email domains:', error)
  }
}

/**
 * Gets the current count of disposable domains
 */
export async function getDisposableDomainCount(): Promise<number> {
  const domains = await fetchDisposableDomains()
  return domains.size
}
