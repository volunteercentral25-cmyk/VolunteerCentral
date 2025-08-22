import { NextRequest, NextResponse } from 'next/server'

const EMAIL_LIST_VERIFY_API_KEY = '1Rauf1CKVzhk4r5VmNOMvZnaWs73odjU'

// Comprehensive list of personal email providers that should be blocked
const PERSONAL_EMAIL_PROVIDERS = [
  // Major US providers
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'gmx.com',
  'live.com', 'msn.com', 'mail.com', 'inbox.com', 'fastmail.com',
  'tutanota.com', 'mail.ru', 'qq.com', '163.com', '126.com',
  'sina.com', 'sohu.com', 'yeah.net', 'foxmail.com', '139.com',
  '189.cn', 'wo.cn', '21cn.com', '263.net', 'tom.com',
  'sogou.com', 'netease.com', 'aliyun.com', 'baidu.com', 'tencent.com',
  'me.com', 'mac.com', 'rocketmail.com', 'ymail.com', 'att.net',
  'verizon.net', 'comcast.net', 'charter.net', 'cox.net', 'earthlink.net',
  'juno.com', 'netzero.net', 'bellsouth.net', 'sbcglobal.net', 'pacbell.net',
  'ameritech.net', 'swbell.net', 'prodigy.net', 'mindspring.com', 'compuserve.com',
  
  // UK providers
  'aol.co.uk', 'gmail.co.uk', 'yahoo.co.uk', 'hotmail.co.uk', 'outlook.co.uk',
  'live.co.uk', 'btinternet.com', 'talktalk.net', 'virginmedia.com', 'sky.com',
  
  // French providers
  'orange.net', 'wanadoo.fr', 'laposte.net', 'free.fr', 'sfr.fr',
  'orange.fr', 'gmail.fr', 'yahoo.fr', 'hotmail.fr', 'outlook.fr',
  
  // German providers
  'web.de', 'gmx.de', 'yahoo.de', 'hotmail.de', 'outlook.de',
  't-online.de', 'freenet.de', 'arcor.de', '1und1.de', 'vodafone.de',
  
  // Italian providers
  'gmail.it', 'yahoo.it', 'hotmail.it', 'outlook.it', 'libero.it',
  'virgilio.it', 'alice.it', 'tiscali.it', 'fastwebnet.it', 'tim.it',
  
  // Spanish providers
  'gmail.es', 'yahoo.es', 'hotmail.es', 'outlook.es', 'terra.es',
  'wanadoo.es', 'telefonica.net', 'ono.es', 'jazztel.com', 'vodafone.es',
  
  // Dutch providers
  'gmail.nl', 'yahoo.nl', 'hotmail.nl', 'outlook.nl', 'ziggo.nl',
  'kpn.nl', 'telfort.nl', 'online.nl', 'planet.nl', 'chello.nl',
  
  // Canadian providers
  'gmail.ca', 'yahoo.ca', 'hotmail.ca', 'outlook.ca', 'rogers.com',
  'bell.ca', 'shaw.ca', 'telus.net', 'sympatico.ca', 'cogeco.ca',
  
  // Australian providers
  'gmail.com.au', 'yahoo.com.au', 'hotmail.com.au', 'outlook.com.au', 'bigpond.com',
  'optusnet.com.au', 'iinet.net.au', 'tpg.com.au', 'dodo.com.au', 'internode.on.net',
  
  // South African providers
  'gmail.co.za', 'yahoo.co.za', 'hotmail.co.za', 'outlook.co.za', 'mweb.co.za',
  'telkomsa.net', 'vodamail.co.za', 'webmail.co.za', 'absamail.co.za', 'icon.co.za',
  
  // Brazilian providers
  'gmail.com.br', 'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'uol.com.br',
  'bol.com.br', 'ig.com.br', 'terra.com.br', 'globo.com', 'oi.com.br',
  
  // Mexican providers
  'gmail.com.mx', 'yahoo.com.mx', 'hotmail.com.mx', 'outlook.com.mx', 'prodigy.net.mx',
  'telmex.com', 'uninet.net.mx', 'grupored.com.mx', 'avantel.net.mx', 'att.net.mx',
  
  // Indian providers
  'gmail.in', 'yahoo.in', 'hotmail.in', 'outlook.in', 'rediffmail.com',
  'sify.com', 'vsnl.net', 'airtelmail.com', 'bsnl.in', 'mtnl.net.in',
  
  // Japanese providers
  'gmail.co.jp', 'yahoo.co.jp', 'hotmail.co.jp', 'outlook.co.jp', 'docomo.ne.jp',
  'ezweb.ne.jp', 'softbank.ne.jp', 'au.com', 'nifty.com', 'biglobe.ne.jp',
  
  // Korean providers
  'gmail.co.kr', 'yahoo.co.kr', 'hotmail.co.kr', 'outlook.co.kr', 'naver.com',
  'daum.net', 'hanmail.net', 'nate.com', 'empas.com', 'dreamwiz.com',
  
  // Chinese providers
  'gmail.cn', 'yahoo.cn', 'hotmail.cn', 'outlook.cn', 'qq.com',
  '163.com', '126.com', 'sina.com', 'sohu.com', 'yeah.net',
  'foxmail.com', '139.com', '189.cn', 'wo.cn', '21cn.com',
  
  // Additional international providers
  'gmail.se', 'yahoo.se', 'hotmail.se', 'outlook.se', 'gmail.no', 'yahoo.no',
  'hotmail.no', 'outlook.no', 'gmail.dk', 'yahoo.dk', 'hotmail.dk', 'outlook.dk',
  'gmail.fi', 'yahoo.fi', 'hotmail.fi', 'outlook.fi', 'gmail.pl', 'yahoo.pl',
  'hotmail.pl', 'outlook.pl', 'gmail.cz', 'yahoo.cz', 'hotmail.cz', 'outlook.cz',
  'gmail.sk', 'yahoo.sk', 'hotmail.sk', 'outlook.sk', 'gmail.hu', 'yahoo.hu',
  'hotmail.hu', 'outlook.hu', 'gmail.ro', 'yahoo.ro', 'hotmail.ro', 'outlook.ro',
  'gmail.bg', 'yahoo.bg', 'hotmail.bg', 'outlook.bg', 'gmail.gr', 'yahoo.gr',
  'hotmail.gr', 'outlook.gr', 'gmail.tr', 'yahoo.tr', 'hotmail.tr', 'outlook.tr',
  'gmail.ua', 'yahoo.ua', 'hotmail.ua', 'outlook.ua', 'gmail.by', 'yahoo.by',
  'hotmail.by', 'outlook.by', 'gmail.kz', 'yahoo.kz', 'hotmail.kz', 'outlook.kz',
  'gmail.uz', 'yahoo.uz', 'hotmail.uz', 'outlook.uz', 'gmail.tj', 'yahoo.tj',
  'hotmail.tj', 'outlook.tj', 'gmail.kg', 'yahoo.kg', 'hotmail.kg', 'outlook.kg',
  'gmail.tm', 'yahoo.tm', 'hotmail.tm', 'outlook.tm', 'gmail.ge', 'yahoo.ge',
  'hotmail.ge', 'outlook.ge', 'gmail.am', 'yahoo.am', 'hotmail.am', 'outlook.am',
  'gmail.az', 'yahoo.az', 'hotmail.az', 'outlook.az', 'gmail.md', 'yahoo.md',
  'hotmail.md', 'outlook.md', 'gmail.ee', 'yahoo.ee', 'hotmail.ee', 'outlook.ee',
  'gmail.lv', 'yahoo.lv', 'hotmail.lv', 'outlook.lv', 'gmail.lt', 'yahoo.lt',
  'hotmail.lt', 'outlook.lt', 'gmail.si', 'yahoo.si', 'hotmail.si', 'outlook.si',
  'gmail.hr', 'yahoo.hr', 'hotmail.hr', 'outlook.hr', 'gmail.ba', 'yahoo.ba',
  'hotmail.ba', 'outlook.ba', 'gmail.me', 'yahoo.me', 'hotmail.me', 'outlook.me',
  'gmail.rs', 'yahoo.rs', 'hotmail.rs', 'outlook.rs', 'gmail.mk', 'yahoo.mk',
  'hotmail.mk', 'outlook.mk', 'gmail.al', 'yahoo.al', 'hotmail.al', 'outlook.al',
  'gmail.mt', 'yahoo.mt', 'hotmail.mt', 'outlook.mt', 'gmail.cy', 'yahoo.cy',
  'hotmail.cy', 'outlook.cy', 'gmail.is', 'yahoo.is', 'hotmail.is', 'outlook.is',
  'gmail.ie', 'yahoo.ie', 'hotmail.ie', 'outlook.ie', 'gmail.pt', 'yahoo.pt',
  'hotmail.pt', 'outlook.pt', 'gmail.ch', 'yahoo.ch', 'hotmail.ch', 'outlook.ch',
  'gmail.at', 'yahoo.at', 'hotmail.at', 'outlook.at', 'gmail.be', 'yahoo.be',
  'hotmail.be', 'outlook.be', 'gmail.lu', 'yahoo.lu', 'hotmail.lu', 'outlook.lu',
  'gmail.li', 'yahoo.li', 'hotmail.li', 'outlook.li', 'gmail.mc', 'yahoo.mc',
  'hotmail.mc', 'outlook.mc', 'gmail.ad', 'yahoo.ad', 'hotmail.ad', 'outlook.ad',
  'gmail.sm', 'yahoo.sm', 'hotmail.sm', 'outlook.sm', 'gmail.va', 'yahoo.va',
  'hotmail.va', 'outlook.va', 'gmail.sg', 'yahoo.sg', 'hotmail.sg', 'outlook.sg',
  'gmail.my', 'yahoo.my', 'hotmail.my', 'outlook.my', 'gmail.id', 'yahoo.id',
  'hotmail.id', 'outlook.id', 'gmail.th', 'yahoo.th', 'hotmail.th', 'outlook.th',
  'gmail.vn', 'yahoo.vn', 'hotmail.vn', 'outlook.vn', 'gmail.ph', 'yahoo.ph',
  'hotmail.ph', 'outlook.ph', 'gmail.in', 'yahoo.in', 'hotmail.in', 'outlook.in',
  'gmail.pk', 'yahoo.pk', 'hotmail.pk', 'outlook.pk', 'gmail.bd', 'yahoo.bd',
  'hotmail.bd', 'outlook.bd', 'gmail.lk', 'yahoo.lk', 'hotmail.lk', 'outlook.lk',
  'gmail.np', 'yahoo.np', 'hotmail.np', 'outlook.np', 'gmail.mm', 'yahoo.mm',
  'hotmail.mm', 'outlook.mm', 'gmail.kh', 'yahoo.kh', 'hotmail.kh', 'outlook.kh',
  'gmail.la', 'yahoo.la', 'hotmail.la', 'outlook.la', 'gmail.mn', 'yahoo.mn',
  'hotmail.mn', 'outlook.mn', 'gmail.kp', 'yahoo.kp', 'hotmail.kp', 'outlook.kp',
  'gmail.kr', 'yahoo.kr', 'hotmail.kr', 'outlook.kr', 'gmail.jp', 'yahoo.jp',
  'hotmail.jp', 'outlook.jp', 'gmail.cn', 'yahoo.cn', 'hotmail.cn', 'outlook.cn',
  'gmail.tw', 'yahoo.tw', 'hotmail.tw', 'outlook.tw', 'gmail.hk', 'yahoo.hk',
  'hotmail.hk', 'outlook.hk', 'gmail.mo', 'yahoo.mo', 'hotmail.mo', 'outlook.mo',
  'gmail.br', 'yahoo.br', 'hotmail.br', 'outlook.br', 'gmail.ar', 'yahoo.ar',
  'hotmail.ar', 'outlook.ar', 'gmail.cl', 'yahoo.cl', 'hotmail.cl', 'outlook.cl',
  'gmail.pe', 'yahoo.pe', 'hotmail.pe', 'outlook.pe', 'gmail.co', 'yahoo.co',
  'hotmail.co', 'outlook.co', 'gmail.ec', 'yahoo.ec', 'hotmail.ec', 'outlook.ec',
  'gmail.uy', 'yahoo.uy', 'hotmail.uy', 'outlook.uy', 'gmail.py', 'yahoo.py',
  'hotmail.py', 'outlook.py', 'gmail.bo', 'yahoo.bo', 'hotmail.bo', 'outlook.bo',
  'gmail.ve', 'yahoo.ve', 'hotmail.ve', 'outlook.ve', 'gmail.gy', 'yahoo.gy',
  'hotmail.gy', 'outlook.gy', 'gmail.sr', 'yahoo.sr', 'hotmail.sr', 'outlook.sr',
  'gmail.gf', 'yahoo.gf', 'hotmail.gf', 'outlook.gf', 'gmail.mq', 'yahoo.mq',
  'hotmail.mq', 'outlook.mq', 'gmail.gp', 'yahoo.gp', 'hotmail.gp', 'outlook.gp',
  'gmail.ht', 'yahoo.ht', 'hotmail.ht', 'outlook.ht', 'gmail.do', 'yahoo.do',
  'hotmail.do', 'outlook.do', 'gmail.jm', 'yahoo.jm', 'hotmail.jm', 'outlook.jm',
  'gmail.tt', 'yahoo.tt', 'hotmail.tt', 'outlook.tt', 'gmail.bb', 'yahoo.bb',
  'hotmail.bb', 'outlook.bb', 'gmail.gd', 'yahoo.gd', 'hotmail.gd', 'outlook.gd',
  'gmail.lc', 'yahoo.lc', 'hotmail.lc', 'outlook.lc', 'gmail.vc', 'yahoo.vc',
  'hotmail.vc', 'outlook.vc', 'gmail.ag', 'yahoo.ag', 'hotmail.ag', 'outlook.ag',
  'gmail.dm', 'yahoo.dm', 'hotmail.dm', 'outlook.dm', 'gmail.kn', 'yahoo.kn',
  'hotmail.kn', 'outlook.kn', 'gmail.ai', 'yahoo.ai', 'hotmail.ai', 'outlook.ai',
  'gmail.ms', 'yahoo.ms', 'hotmail.ms', 'outlook.ms', 'gmail.tc', 'yahoo.tc',
  'hotmail.tc', 'outlook.tc', 'gmail.vg', 'yahoo.vg', 'hotmail.vg', 'outlook.vg',
  'gmail.ky', 'yahoo.ky', 'hotmail.ky', 'outlook.ky', 'gmail.bm', 'yahoo.bm',
  'hotmail.bm', 'outlook.bm', 'gmail.aw', 'yahoo.aw', 'hotmail.aw', 'outlook.aw',
  'gmail.cw', 'yahoo.cw', 'hotmail.cw', 'outlook.cw', 'gmail.sx', 'yahoo.sx',
  'hotmail.sx', 'outlook.sx', 'gmail.mf', 'yahoo.mf', 'hotmail.mf', 'outlook.mf',
  'gmail.bl', 'yahoo.bl', 'hotmail.bl', 'outlook.bl', 'gmail.pm', 'yahoo.pm',
  'hotmail.pm', 'outlook.pm', 'gmail.wf', 'yahoo.wf', 'hotmail.wf', 'outlook.wf',
  'gmail.nc', 'yahoo.nc', 'hotmail.nc', 'outlook.nc', 'gmail.pf', 'yahoo.pf',
  'hotmail.pf', 'outlook.pf', 'gmail.ck', 'yahoo.ck', 'hotmail.ck', 'outlook.ck',
  'gmail.nu', 'yahoo.nu', 'hotmail.nu', 'outlook.nu', 'gmail.tk', 'yahoo.tk',
  'hotmail.tk', 'outlook.tk', 'gmail.ws', 'yahoo.ws', 'hotmail.ws', 'outlook.ws',
  'gmail.fj', 'yahoo.fj', 'hotmail.fj', 'outlook.fj', 'gmail.pg', 'yahoo.pg',
  'hotmail.pg', 'outlook.pg', 'gmail.sb', 'yahoo.sb', 'hotmail.sb', 'outlook.sb',
  'gmail.vu', 'yahoo.vu', 'hotmail.vu', 'outlook.vu', 'gmail.nr', 'yahoo.nr',
  'hotmail.nr', 'outlook.nr', 'gmail.tv', 'yahoo.tv', 'hotmail.tv', 'outlook.tv',
  'gmail.ki', 'yahoo.ki', 'hotmail.ki', 'outlook.ki', 'gmail.mh', 'yahoo.mh',
  'hotmail.mh', 'outlook.mh', 'gmail.fm', 'yahoo.fm', 'hotmail.fm', 'outlook.fm',
  'gmail.pw', 'yahoo.pw', 'hotmail.pw', 'outlook.pw'
]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // FIRST: Check if it's a personal email provider (PRIORITY CHECK)
    const domain = email.split('@')[1]?.toLowerCase()
    const isPersonal = PERSONAL_EMAIL_PROVIDERS.includes(domain)
    
    if (isPersonal) {
      console.log(`Personal email blocked: ${email} (domain: ${domain})`)
      return NextResponse.json({
        isValid: false,
        isDisposable: false,
        isPersonal: true,
        status: 400,
        message: 'Personal email providers are not accepted for verification',
        source: 'api'
      })
    }

    // SECOND: Call EmailListVerify API with correct parameters
    const response = await fetch('https://api.emaillistverify.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        key: EMAIL_LIST_VERIFY_API_KEY,
        format: 'json'
      })
    })

    console.log('EmailListVerify API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EmailListVerify API Error Response:', errorText)
      throw new Error(`EmailListVerify API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('EmailListVerify API Result:', result)

    // Handle different response formats
    let status = result.status || result.code || 0
    let message = result.message || result.msg || 'Unknown response'

    // EmailListVerify returns different status codes
    // 200: Valid email
    // 400: Invalid email
    // 401: Disposable email
    // 402: Invalid domain
    // 403: Invalid format

    const isDisposable = status === 401
    const isValid = status === 200

    return NextResponse.json({
      isValid: isValid && !isDisposable,
      isDisposable: isDisposable,
      isPersonal: false,
      status: status,
      message: message || getStatusMessage(status),
      source: 'api'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to verify email',
        details: errorMessage,
        isValid: false,
        isDisposable: false,
        isPersonal: false,
        status: 500,
        message: 'Email verification service unavailable',
        source: 'api'
      },
      { status: 500 }
    )
  }
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 200:
      return 'Valid email address'
    case 400:
      return 'Invalid email address'
    case 401:
      return 'Disposable email address not allowed'
    case 402:
      return 'Invalid domain'
    case 403:
      return 'Invalid email format'
    default:
      return 'Unknown error'
  }
}
