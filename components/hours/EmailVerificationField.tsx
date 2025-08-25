'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Mail, Building2, Loader2 } from 'lucide-react'
import { isDisposableEmail, isDisposableEmailSync, preloadDisposableDomains } from '@/lib/utils/disposableEmailDomains'

interface EmailVerificationFieldProps {
  value: string
  onChange: (email: string) => void
  onValidationChange: (isValid: boolean) => void
  required?: boolean
  label?: string
  placeholder?: string
  className?: string
}

interface EmailValidationResult {
  isValid: boolean
  isDisposable: boolean
  isPersonal: boolean
  status: number
  message: string
  source?: 'api' | 'fallback' | 'local'
}

// Popular personal email providers that should be blocked
const POPULAR_PERSONAL_EMAIL_PROVIDERS = [
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

export function EmailVerificationField({
  value,
  onChange,
  onValidationChange,
  required = true,
  label = "Verification Email",
  placeholder = "supervisor@organization.com",
  className = ""
}: EmailVerificationFieldProps) {
  const [validationResult, setValidationResult] = useState<EmailValidationResult | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastVerifiedEmail = useRef<string>('')

  // Preload disposable domains on component mount
  useEffect(() => {
    preloadDisposableDomains()
  }, [])

  useEffect(() => {
    if (value && hasInteracted) {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        verifyEmail(value)
      }, 500) // 500ms debounce
    } else {
      setValidationResult(null)
      onValidationChange(false)
      lastVerifiedEmail.current = ''
    }

    // Cleanup on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, hasInteracted])

  const verifyEmail = async (email: string) => {
    // Prevent duplicate verification of the same email
    if (lastVerifiedEmail.current === email) {
      return
    }

    setIsVerifying(true)
    lastVerifiedEmail.current = email

    try {
      // First check if it's a popular personal email provider (PRIORITY CHECK)
      const domain = email.split('@')[1]?.toLowerCase()
      const isPersonal = POPULAR_PERSONAL_EMAIL_PROVIDERS.includes(domain)
      
      if (isPersonal) {
        console.log(`Personal email blocked in frontend: ${email} (domain: ${domain})`)
        setValidationResult({
          isValid: false,
          isDisposable: false,
          isPersonal: true,
          status: 400,
          message: 'Personal email providers are not accepted for verification',
          source: 'local'
        })
        onValidationChange(false)
        return
      }

      // Then check if it's a disposable email (SECONDARY CHECK)
      const isDisposableLocal = isDisposableEmailSync(email)
      if (isDisposableLocal) {
        setValidationResult({
          isValid: false,
          isDisposable: true,
          isPersonal: false,
          status: 401,
          message: 'Disposable email detected (local check)',
          source: 'local'
        })
        onValidationChange(false)
        return
      }

      // Use the new domain validation API that checks our trusted domains database
      const domainValidationResponse = await fetch('/api/validate-email-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (domainValidationResponse.ok) {
        const domainResult = await domainValidationResponse.json()
        
        if (!domainResult.error) {
          setValidationResult({
            isValid: domainResult.isValid,
            isDisposable: domainResult.status === 'disposable',
            isPersonal: false,
            status: domainResult.isValid ? 200 : 400,
            message: domainResult.reason,
            source: 'api'
          })
          onValidationChange(domainResult.isValid)
          return
        }
      }

      // Fallback: try the EmailListVerify API if domain validation fails
      const response = await fetch('/api/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (!result.error) {
          setValidationResult({
            ...result,
            isPersonal: false,
            source: 'fallback'
          })
          onValidationChange(result.isValid && !result.isDisposable)
          return
        }
      }

      // Fallback to comprehensive disposable email check
      const isDisposable = await isDisposableEmail(email)
      
      setValidationResult({
        isValid: !isDisposable,
        isDisposable: isDisposable,
        isPersonal: false,
        status: isDisposable ? 401 : 200,
        message: isDisposable 
          ? 'Disposable email detected (comprehensive check)' 
          : 'Email appears valid (comprehensive check)',
        source: 'fallback'
      })
      onValidationChange(!isDisposable)

    } catch (error) {
      console.error('Email verification error:', error)
      
      // Final fallback to local list only
      const isDisposableLocal = isDisposableEmailSync(email)
      
      setValidationResult({
        isValid: !isDisposableLocal,
        isDisposable: isDisposableLocal,
        isPersonal: false,
        status: isDisposableLocal ? 401 : 200,
        message: isDisposableLocal 
          ? 'Disposable email detected (local check)' 
          : 'Email appears valid (local check)',
        source: 'local'
      })
      onValidationChange(!isDisposableLocal)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    onChange(email)
    setHasInteracted(true)
    
    // Reset validation when email changes
    if (email !== lastVerifiedEmail.current) {
      setValidationResult(null)
      onValidationChange(false)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const getInputBorderClass = () => {
    if (!hasInteracted || !value || isVerifying) return ''
    if (validationResult?.isValid && !validationResult?.isDisposable && !validationResult?.isPersonal) {
      return 'border-green-500 focus:border-green-500'
    }
    return 'border-red-500 focus:border-red-500'
  }

  const getInputIcon = () => {
    if (isVerifying) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
    if (!hasInteracted || !value) {
      return <Mail className="h-4 w-4 text-gray-400" />
    }
    if (validationResult?.isValid && !validationResult?.isDisposable && !validationResult?.isPersonal) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getValidationMessage = () => {
    if (!validationResult) return null

    if (validationResult.isPersonal) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Personal email detected:</strong> {validationResult.message}
          </AlertDescription>
        </Alert>
      )
    }

    if (validationResult.isValid && !validationResult.isDisposable && !validationResult.isPersonal) {
      const sourceText = validationResult.source === 'api' 
        ? 'EmailListVerify API' 
        : validationResult.source === 'fallback'
        ? 'comprehensive check'
        : 'local check'
      
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Valid organizational email:</strong> Verified via {sourceText}
          </AlertDescription>
        </Alert>
      )
    }

    if (validationResult.isDisposable) {
      const sourceText = validationResult.source === 'api' 
        ? 'EmailListVerify API' 
        : validationResult.source === 'fallback'
        ? 'comprehensive check'
        : 'local check'
      
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Disposable email detected:</strong> Blocked via {sourceText}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {validationResult.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="verification-email" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            id="verification-email"
            type="email"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`pr-10 ${getInputBorderClass()}`}
            required={required}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getInputIcon()}
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {hasInteracted && value && getValidationMessage()}

      {/* Help Text */}
      {isFocused && (
        <div className="text-sm text-gray-600 space-y-2">
          <p>This email is verified using multiple sources to ensure it's from a legitimate organization.</p>
          
          <div>
            <p className="font-medium mb-1">Examples of acceptable domains:</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">@company.com</Badge>
              <Badge variant="outline" className="text-xs">@organization.org</Badge>
              <Badge variant="outline" className="text-xs">@school.edu</Badge>
              <Badge variant="outline" className="text-xs">@hospital.org</Badge>
            </div>
          </div>

          <div>
            <p className="font-medium mb-1 text-red-600">Not accepted:</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Personal emails (Gmail, Yahoo, etc.)
              </Badge>
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Disposable emails (tempmailo, tempumail, qqveo, guerrillamail, etc.)
              </Badge>
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Temporary emails
              </Badge>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            <p>Verification sources: Personal email check → EmailListVerify API → Comprehensive domain lists → Local fallback</p>
          </div>
        </div>
      )}
    </div>
  )
}
