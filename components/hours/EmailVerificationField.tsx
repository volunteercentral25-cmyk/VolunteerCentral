'use client'

import { useState, useEffect } from 'react'
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
  'aol.co.uk', 'gmail.co.uk', 'yahoo.co.uk', 'hotmail.co.uk', 'outlook.co.uk',
  'live.co.uk', 'btinternet.com', 'talktalk.net', 'virginmedia.com', 'sky.com',
  'orange.net', 'wanadoo.fr', 'laposte.net', 'free.fr', 'sfr.fr',
  'orange.fr', 'gmail.fr', 'yahoo.fr', 'hotmail.fr', 'outlook.fr',
  'web.de', 'gmx.de', 'yahoo.de', 'hotmail.de', 'outlook.de',
  't-online.de', 'freenet.de', 'arcor.de', '1und1.de', 'vodafone.de',
  'gmail.it', 'yahoo.it', 'hotmail.it', 'outlook.it', 'libero.it',
  'virgilio.it', 'alice.it', 'tiscali.it', 'fastwebnet.it', 'tim.it',
  'gmail.es', 'yahoo.es', 'hotmail.es', 'outlook.es', 'terra.es',
  'wanadoo.es', 'telefonica.net', 'ono.es', 'jazztel.com', 'vodafone.es',
  'gmail.nl', 'yahoo.nl', 'hotmail.nl', 'outlook.nl', 'ziggo.nl',
  'kpn.nl', 'telfort.nl', 'online.nl', 'planet.nl', 'chello.nl',
  'gmail.ca', 'yahoo.ca', 'hotmail.ca', 'outlook.ca', 'rogers.com',
  'bell.ca', 'shaw.ca', 'telus.net', 'sympatico.ca', 'cogeco.ca',
  'gmail.com.au', 'yahoo.com.au', 'hotmail.com.au', 'outlook.com.au', 'bigpond.com',
  'optusnet.com.au', 'iinet.net.au', 'tpg.com.au', 'dodo.com.au', 'internode.on.net',
  'gmail.co.za', 'yahoo.co.za', 'hotmail.co.za', 'outlook.co.za', 'mweb.co.za',
  'telkomsa.net', 'vodamail.co.za', 'webmail.co.za', 'absamail.co.za', 'icon.co.za',
  'gmail.com.br', 'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'uol.com.br',
  'bol.com.br', 'ig.com.br', 'terra.com.br', 'globo.com', 'oi.com.br',
  'gmail.com.mx', 'yahoo.com.mx', 'hotmail.com.mx', 'outlook.com.mx', 'prodigy.net.mx',
  'telmex.com', 'uninet.net.mx', 'grupored.com.mx', 'avantel.net.mx', 'att.net.mx',
  'gmail.in', 'yahoo.in', 'hotmail.in', 'outlook.in', 'rediffmail.com',
  'sify.com', 'vsnl.net', 'airtelmail.com', 'bsnl.in', 'mtnl.net.in',
  'gmail.co.jp', 'yahoo.co.jp', 'hotmail.co.jp', 'outlook.co.jp', 'docomo.ne.jp',
  'ezweb.ne.jp', 'softbank.ne.jp', 'au.com', 'nifty.com', 'biglobe.ne.jp',
  'gmail.co.kr', 'yahoo.co.kr', 'hotmail.co.kr', 'outlook.co.kr', 'naver.com',
  'daum.net', 'hanmail.net', 'nate.com', 'empas.com', 'dreamwiz.com',
  'gmail.cn', 'yahoo.cn', 'hotmail.cn', 'outlook.cn', 'qq.com',
  '163.com', '126.com', 'sina.com', 'sohu.com', 'yeah.net',
  'foxmail.com', '139.com', '189.cn', 'wo.cn', '21cn.com'
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

  // Preload disposable domains on component mount
  useEffect(() => {
    preloadDisposableDomains()
  }, [])

  useEffect(() => {
    if (value && hasInteracted) {
      verifyEmail(value)
    } else {
      setValidationResult(null)
      onValidationChange(false)
    }
  }, [value, hasInteracted])

  const verifyEmail = async (email: string) => {
    setIsVerifying(true)
    try {
      // First check if it's a popular personal email provider
      const domain = email.split('@')[1]?.toLowerCase()
      const isPersonal = POPULAR_PERSONAL_EMAIL_PROVIDERS.includes(domain)
      
      if (isPersonal) {
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

      // First try the EmailListVerify API
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
            source: 'api'
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
