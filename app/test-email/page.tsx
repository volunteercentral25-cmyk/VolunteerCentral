'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, Server, Database } from 'lucide-react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/email-service/email/test')
      const data = await response.json()
      setDiagnostics(data)
    } catch (err) {
      setError('Failed to run diagnostics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError(null)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/email-service/email/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(data)
      } else {
        setError(data.error || 'Failed to send test email')
      }
    } catch (err) {
      setError('Failed to send test email')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const StatusIndicator = ({ status }: { status: string }) => {
    if (status.includes('✅')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Email Service Diagnostics
          </h1>
          <p className="text-gray-600">
            Test and verify the Flask mail service configuration
          </p>
        </div>

        {/* Diagnostics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Diagnostics
            </CardTitle>
            <CardDescription>
              Check if the email service is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={loading} className="mb-4">
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>

            {diagnostics && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Flask Mail Status */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Flask Mail
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Initialized:</span>
                        <div className="flex items-center gap-1">
                          <StatusIndicator status={diagnostics.flask_mail?.initialized} />
                          <span>{diagnostics.flask_mail?.initialized}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Server:</span>
                        <span>{diagnostics.flask_mail?.configuration?.server}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Port:</span>
                        <span>{diagnostics.flask_mail?.configuration?.port}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Password:</span>
                        <div className="flex items-center gap-1">
                          <StatusIndicator status={diagnostics.flask_mail?.configuration?.password_set} />
                          <span>{diagnostics.flask_mail?.configuration?.password_set}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Status */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Supabase
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <div className="flex items-center gap-1">
                          <StatusIndicator status={diagnostics.supabase?.status} />
                          <span>{diagnostics.supabase?.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Connection:</span>
                        <div className="flex items-center gap-1">
                          <StatusIndicator status={diagnostics.supabase?.connection} />
                          <span>{diagnostics.supabase?.connection}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Environment Variables</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(diagnostics.environment_variables || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span>{key}:</span>
                        <div className="flex items-center gap-1">
                          <StatusIndicator status={value as string} />
                          <span>{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Status */}
                <Alert className={diagnostics.ready_to_send_emails ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className={diagnostics.ready_to_send_emails ? 'text-green-800' : 'text-red-800'}>
                    <strong>Overall Status:</strong> {diagnostics.ready_to_send_emails ? 
                      '✅ Ready to send emails!' : 
                      '❌ Not ready to send emails - check configuration'}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a test email to verify the service is working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Test Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="mt-1"
                />
              </div>
              
              <Button onClick={sendTestEmail} disabled={loading || !email}>
                {loading ? 'Sending...' : 'Send Test Email'}
              </Button>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {testResult && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong> Test email sent to {testResult.recipient}
                    <br />
                    <small>Sent at: {new Date(testResult.timestamp).toLocaleString()}</small>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Check if Flask Mail is Working</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Run Diagnostics</h4>
              <p className="text-sm text-gray-600">
                Click "Run Diagnostics" to check if all environment variables are set correctly.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. Check Environment Variables in Vercel</h4>
              <p className="text-sm text-gray-600">
                Make sure these variables are set in your Vercel project settings:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>FLASK_MAIL_SERVER = smtp.gmail.com</li>
                <li>FLASK_MAIL_PORT = 587</li>
                <li>FLASK_MAIL_USERNAME = CLTVolunteerCentral@gmail.com</li>
                <li>FLASK_MAIL_PASSWORD = jnkb gfpz qxjz nflx</li>
                <li>FLASK_MAIL_USE_TLS = true</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. Send Test Email</h4>
              <p className="text-sm text-gray-600">
                Enter your email address and send a test email to verify the service works.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
