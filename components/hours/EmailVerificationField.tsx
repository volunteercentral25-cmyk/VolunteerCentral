'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Mail, Building2, Loader2 } from 'lucide-react'

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
  status: number
  message: string
}

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
      const response = await fetch('/api/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Verification failed')
      }

      const result = await response.json()
      setValidationResult(result)
      onValidationChange(result.isValid && !result.isDisposable)
    } catch (error) {
      console.error('Email verification error:', error)
      setValidationResult({
        isValid: false,
        isDisposable: false,
        status: 500,
        message: 'Failed to verify email'
      })
      onValidationChange(false)
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
    if (validationResult?.isValid && !validationResult?.isDisposable) {
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
    if (validationResult?.isValid && !validationResult?.isDisposable) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getValidationMessage = () => {
    if (!validationResult) return null

    if (validationResult.isValid && !validationResult.isDisposable) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Valid email:</strong> {validationResult.message}
          </AlertDescription>
        </Alert>
      )
    }

    if (validationResult.isDisposable) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Disposable email detected:</strong> {validationResult.message}
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
          <p>This email will be verified using EmailListVerify API to ensure it's not a disposable or temporary email address.</p>
          
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
                Disposable emails (tempmailo, guerrillamail, etc.)
              </Badge>
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Temporary emails
              </Badge>
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Personal emails (Gmail, Yahoo, etc.)
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
