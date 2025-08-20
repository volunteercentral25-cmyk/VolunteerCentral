'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Mail, Building2 } from 'lucide-react'
import { validateEmail, getExampleOrganizationalDomains, formatDomain } from '@/lib/utils/emailValidation'

interface EmailVerificationFieldProps {
  value: string
  onChange: (email: string) => void
  onValidationChange: (isValid: boolean) => void
  required?: boolean
  label?: string
  placeholder?: string
  className?: string
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
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (value && hasInteracted) {
      const result = validateEmail(value)
      setValidationResult(result)
      onValidationChange(result.isValid && result.isCustomDomain)
    } else {
      setValidationResult(null)
      onValidationChange(false)
    }
  }, [value, hasInteracted, onValidationChange])

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
    if (!hasInteracted || !value) return ''
    if (validationResult?.isValid && validationResult?.isCustomDomain) {
      return 'border-green-500 focus:border-green-500'
    }
    return 'border-red-500 focus:border-red-500'
  }

  const getInputIcon = () => {
    if (!hasInteracted || !value) return <Mail className="h-4 w-4 text-gray-400" />
    if (validationResult?.isValid && validationResult?.isCustomDomain) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
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
      {hasInteracted && value && (
        <div className="space-y-2">
          {validationResult?.isValid && validationResult?.isCustomDomain && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Valid organizational email:</strong> {formatDomain(validationResult.domain)}
              </AlertDescription>
            </Alert>
          )}

          {!validationResult?.isValid && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationResult?.error || 'Invalid email format'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Help Text */}
      {isFocused && (
        <div className="text-sm text-gray-600 space-y-2">
          <p>This email will be used to verify your volunteer hours. Personal email providers (Gmail, Yahoo, Outlook, etc.) are not accepted.</p>
          
          <div>
            <p className="font-medium mb-1">Examples of acceptable domains:</p>
            <div className="flex flex-wrap gap-1">
              {getExampleOrganizationalDomains().slice(0, 8).map((domain) => (
                <Badge key={domain} variant="outline" className="text-xs">
                  @{domain}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-1 text-red-600">Not accepted:</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Disposable emails
              </Badge>
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Temporary emails
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
