'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search,
  ArrowLeft,
  User,
  LogOut,
  Shield,
  ShieldCheck,
  ShieldX,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Filter
} from 'lucide-react'

interface TrustedDomain {
  id: string
  domain: string
  is_trusted: boolean
  reason: string
  added_by: string
  created_at: string
  updated_at: string
}

interface DomainsData {
  domains: TrustedDomain[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminDomains() {
  const [user, setUser] = useState<any>(null)
  const [domainsData, setDomainsData] = useState<DomainsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<TrustedDomain | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [domainForm, setDomainForm] = useState({
    domain: '',
    is_trusted: true,
    reason: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadDomains()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  useEffect(() => {
    loadDomains()
  }, [currentPage, search, statusFilter])

  const loadDomains = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/domains?${params}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/student/dashboard')
          return
        }
        throw new Error('Failed to load domains')
      }
      const data = await response.json()
      setDomainsData(data)
    } catch (error) {
      console.error('Error loading domains:', error)
      setError('Failed to load domains')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleAddDomain = () => {
    setDomainForm({ domain: '', is_trusted: true, reason: '' })
    setShowAddModal(true)
  }

  const handleEditDomain = (domain: TrustedDomain) => {
    setSelectedDomain(domain)
    setDomainForm({
      domain: domain.domain,
      is_trusted: domain.is_trusted,
      reason: domain.reason
    })
    setShowEditModal(true)
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete domain')
      }

      setSuccessMessage('Domain deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      await loadDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      setError('Failed to delete domain')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitDomain = async () => {
    if (!domainForm.domain.trim()) {
      setError('Domain is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const url = showEditModal && selectedDomain 
        ? `/api/admin/domains/${selectedDomain.id}`
        : '/api/admin/domains'
      
      const method = showEditModal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domainForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save domain')
      }

      setShowAddModal(false)
      setShowEditModal(false)
      setSelectedDomain(null)
      setSuccessMessage(`Domain ${showEditModal ? 'updated' : 'added'} successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await loadDomains()
    } catch (error) {
      console.error('Error saving domain:', error)
      setError(error instanceof Error ? error.message : 'Failed to save domain')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error && !domainsData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Domains</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDomains} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Domain Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="btn-secondary btn-hover-effect"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Domain Management
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted <span className="text-gradient">Email Domains</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage trusted and untrusted email domains for verification emails. Control which domains are allowed for volunteer hour verification.
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        {(successMessage || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            {successMessage && (
              <Card className="glass-effect border-0 shadow-xl bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {error && (
              <Card className="glass-effect border-0 shadow-xl bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search domains..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="min-w-[200px]">
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Domains</option>
                      <option value="trusted">Trusted Only</option>
                      <option value="untrusted">Untrusted Only</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>{domainsData?.pagination.total || 0} domains</span>
                  </div>
                  <Button 
                    onClick={handleAddDomain}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Domain
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Domains List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid gap-6">
            {domainsData?.domains.length ? (
              domainsData.domains.map((domain) => {
                try {
                  // Ensure the key is a string
                  const key = typeof domain.id === 'string' ? domain.id : String(domain.id || '')
                  return (
                    <Card key={key} className="glass-effect border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          domain.is_trusted ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {domain.is_trusted ? (
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                          ) : (
                            <ShieldX className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                            <Badge className={
                              domain.is_trusted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }>
                              {domain.is_trusted ? 'Trusted' : 'Untrusted'}
                            </Badge>
                          </div>
                          
                          {domain.reason && (
                            <p className="text-gray-600 mb-2">{domain.reason}</p>
                          )}
                          
                          <div className="text-sm text-gray-500">
                            <span>Added: {new Date(domain.created_at).toLocaleDateString()}</span>
                            {domain.updated_at !== domain.created_at && (
                              <span className="ml-4">Updated: {new Date(domain.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="btn-secondary"
                          onClick={() => handleEditDomain(domain)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="btn-secondary text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteDomain(domain.id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } catch (error) {
              console.error('Error rendering domain:', error, domain);
              return null;
            }
          })
            ) : (
              <Card className="glass-effect border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains found</h3>
                  <p className="text-gray-600 mb-4">Start by adding trusted or untrusted email domains.</p>
                  <Button onClick={handleAddDomain} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Domain
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {domainsData && domainsData.pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: domainsData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "btn-primary" : "btn-secondary"}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(domainsData.pagination.totalPages, currentPage + 1))}
              disabled={currentPage === domainsData.pagination.totalPages}
              className="btn-secondary"
            >
              Next
            </Button>
          </motion.div>
        )}
      </main>

      {/* Add/Edit Domain Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedDomain(null)
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <CardHeader>
              <CardTitle>{showEditModal ? 'Edit Domain' : 'Add New Domain'}</CardTitle>
              <CardDescription>
                {showEditModal ? 'Update the domain settings' : 'Add a new trusted or untrusted domain'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={domainForm.domain}
                  onChange={(e) => setDomainForm({...domainForm, domain: e.target.value.toLowerCase().trim()})}
                  placeholder="example.com"
                  disabled={showEditModal} // Don't allow editing domain name
                />
              </div>
              
              <div>
                <Label htmlFor="is_trusted">Status</Label>
                <select
                  id="is_trusted"
                  value={domainForm.is_trusted.toString()}
                  onChange={(e) => setDomainForm({...domainForm, is_trusted: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="true">Trusted</option>
                  <option value="false">Untrusted</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={domainForm.reason}
                  onChange={(e) => setDomainForm({...domainForm, reason: e.target.value})}
                  placeholder="Why is this domain trusted/untrusted?"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmitDomain}
                  className="btn-primary flex-1"
                  disabled={submitting || !domainForm.domain.trim()}
                >
                  {submitting ? 'Saving...' : showEditModal ? 'Update Domain' : 'Add Domain'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedDomain(null)
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </motion.div>
        </div>
      )}
    </div>
  )
}
