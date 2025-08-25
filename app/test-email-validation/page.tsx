'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ValidationResult {
  email: string
  domain: string
  isValid: boolean
  status: string
  reason: string
  checks: {
    explicitlyTrusted: boolean | null
    explicitlyUntrusted: boolean | null
    isDisposable: boolean
    existsInDatabase: boolean
  }
}

export default function TestEmailValidation() {
  const [email, setEmail] = useState('')
  const [results, setResults] = useState<ValidationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testEmails = [
    // Trusted organizational emails
    'supervisor@mayoclinic.org',
    'manager@redcross.org',
    'admin@harvard.edu',
    'contact@whitehouse.gov',
    'info@boyscouts.org',
    
    // Personal emails (should be blocked)
    'test@gmail.com',
    'user@yahoo.com',
    'person@hotmail.com',
    'email@outlook.com',
    
    // Disposable emails (should be blocked)
    'temp@tempmail.org',
    'test@yopmail.com',
    'user@10minutemail.com',
    'email@guerrillamail.com',
    
    // Unknown domains (should be trusted by default)
    'contact@mycompany.com',
    'admin@localbusiness.org',
    'info@startup.tech'
  ]

  const validateEmail = async (testEmail: string) => {
    try {
      const response = await fetch('/api/validate-email-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        return {
          email: testEmail,
          domain: testEmail.split('@')[1],
          isValid: false,
          status: 'error',
          reason: 'API error',
          checks: {
            explicitlyTrusted: null,
            explicitlyUntrusted: null,
            isDisposable: false,
            existsInDatabase: false
          }
        }
      }
    } catch (error) {
      return {
        email: testEmail,
        domain: testEmail.split('@')[1],
        isValid: false,
        status: 'error',
        reason: 'Network error',
        checks: {
          explicitlyTrusted: null,
          explicitlyUntrusted: null,
          isDisposable: false,
          existsInDatabase: false
        }
      }
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    const newResults = []
    
    for (const testEmail of testEmails) {
      const result = await validateEmail(testEmail)
      newResults.push(result)
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setResults(newResults)
    setIsLoading(false)
  }

  const testSingleEmail = async () => {
    if (!email) return
    
    setIsLoading(true)
    const result = await validateEmail(email)
    setResults([result])
    setIsLoading(false)
  }

  const getStatusBadge = (result: ValidationResult) => {
    if (result.isValid) {
      return <Badge className="bg-green-100 text-green-800">Trusted</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
    }
  }

  const getStatusIcon = (result: ValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Email Domain Validation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Email Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Single Email</h3>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testSingleEmail} disabled={isLoading || !email}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
              </Button>
            </div>
          </div>

          {/* Run All Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Run All Tests</h3>
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="grid gap-4">
                {results.map((result, index) => (
                  <Alert key={index} className={result.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {getStatusIcon(result)}
                    <AlertDescription>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.email}</span>
                        {getStatusBadge(result)}
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Domain:</strong> {result.domain}</p>
                        <p><strong>Status:</strong> {result.status}</p>
                        <p><strong>Reason:</strong> {result.reason}</p>
                        <div className="text-xs text-gray-600 mt-2">
                          <p><strong>Checks:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Explicitly Trusted: {result.checks.explicitlyTrusted ? 'Yes' : 'No'}</li>
                            <li>Explicitly Untrusted: {result.checks.explicitlyUntrusted ? 'Yes' : 'No'}</li>
                            <li>Is Disposable: {result.checks.isDisposable ? 'Yes' : 'No'}</li>
                            <li>Exists in Database: {result.checks.existsInDatabase ? 'Yes' : 'No'}</li>
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {results.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Total Tests:</strong> {results.length}</p>
                  <p><strong>Trusted:</strong> {results.filter(r => r.isValid).length}</p>
                  <p><strong>Blocked:</strong> {results.filter(r => !r.isValid).length}</p>
                </div>
                <div>
                  <p><strong>Success Rate:</strong> {((results.filter(r => r.isValid).length / results.length) * 100).toFixed(1)}%</p>
                  <p><strong>Database Hits:</strong> {results.filter(r => r.checks.existsInDatabase).length}</p>
                  <p><strong>Disposable Detected:</strong> {results.filter(r => r.checks.isDisposable).length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
