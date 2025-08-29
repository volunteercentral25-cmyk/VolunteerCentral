'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MobileAdminLayout from '@/components/layout/mobile-admin-layout'
import { 
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Calendar
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

export default function MobileAdminDomains() {
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
      setError(null)
    } catch (error) {
      console.error('Error loading domains:', error)
      setError('Failed to load domains')
    } finally {
      setLoading(false)
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

  const handleAddDomain = async () => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domainForm)
      })

      if (!response.ok) {
        throw new Error('Failed to add domain')
      }

      // Reset form and reload domains
      setDomainForm({
        domain: '',
        is_trusted: true,
        reason: ''
      })
      setShowAddModal(false)
      await loadDomains()
      setSuccessMessage('Domain added successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error adding domain:', error)
      setError('Failed to add domain')
    } finally {
      setSubmitting(false)
    }
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

  const handleUpdateDomain = async () => {
    if (!selectedDomain) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/domains', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainId: selectedDomain.id,
          updates: domainForm
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update domain')
      }

      // Reload domains to get updated data
      await loadDomains()
      setShowEditModal(false)
      setSelectedDomain(null)
      setSuccessMessage('Domain updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error updating domain:', error)
      setError('Failed to update domain')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      const response = await fetch('/api/admin/domains', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete domain')
      }

      // Reload domains to get updated data
      await loadDomains()
      setSuccessMessage('Domain deleted successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting domain:', error)
      setError('Failed to delete domain')
    }
  }

  if (loading && !domainsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Domains</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={loadDomains} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MobileAdminLayout
      currentPage="domains"
      pageTitle="Manage Email Domains"
      pageDescription="Manage trusted and untrusted email domains for student verification."
      onSignOut={handleSignOut}
      userName="Admin"
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg"
        >
          <p className="text-green-800 text-sm text-center">{successMessage}</p>
        </motion.div>
      )}

      {/* Add Domain Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mb-6"
      >
        <Button 
          onClick={() => setShowAddModal(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Domain
        </Button>
      </motion.div>

      {/* Search and Filters - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search domains..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">All Domains</option>
                  <option value="trusted">Trusted</option>
                  <option value="untrusted">Untrusted</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{domainsData?.pagination.total || 0} domains</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Domains List - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4"
      >
        {domainsData?.domains.length ? (
          domainsData.domains.map((domain) => (
            <Card key={domain.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Domain Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        domain.is_trusted ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {domain.is_trusted ? (
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <ShieldX className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">{domain.domain}</h3>
                        <Badge className={
                          domain.is_trusted ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'
                        }>
                          {domain.is_trusted ? 'Trusted' : 'Untrusted'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Domain Details */}
                  <div className="space-y-2 text-sm">
                    {domain.reason && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">
                          <strong>Reason:</strong> {domain.reason}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Added {new Date(domain.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">By {domain.added_by}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditDomain(domain)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your search or filters, or add a new domain.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Pagination - Mobile Optimized */}
      {domainsData && domainsData.pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: domainsData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                size="sm"
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(domainsData.pagination.totalPages, currentPage + 1))}
            disabled={currentPage === domainsData.pagination.totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}

      {/* Add Domain Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Domain
            </DialogTitle>
            <DialogDescription>
              Add a new email domain to the trusted or untrusted list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domainForm.domain}
                onChange={(e) => setDomainForm({ ...domainForm, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="is_trusted">Status</Label>
              <select
                id="is_trusted"
                value={domainForm.is_trusted.toString()}
                onChange={(e) => setDomainForm({ ...domainForm, is_trusted: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              >
                <option value="true">Trusted</option>
                <option value="false">Untrusted</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={domainForm.reason}
                onChange={(e) => setDomainForm({ ...domainForm, reason: e.target.value })}
                placeholder="Why is this domain trusted/untrusted?"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleAddDomain}
                disabled={submitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Domain
            </DialogTitle>
            <DialogDescription>
              Update the settings for {selectedDomain?.domain}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDomain && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_domain">Domain</Label>
                <Input
                  id="edit_domain"
                  value={domainForm.domain}
                  onChange={(e) => setDomainForm({ ...domainForm, domain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_is_trusted">Status</Label>
                <select
                  id="edit_is_trusted"
                  value={domainForm.is_trusted.toString()}
                  onChange={(e) => setDomainForm({ ...domainForm, is_trusted: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                >
                  <option value="true">Trusted</option>
                  <option value="false">Untrusted</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit_reason">Reason</Label>
                <Textarea
                  id="edit_reason"
                  value={domainForm.reason}
                  onChange={(e) => setDomainForm({ ...domainForm, reason: e.target.value })}
                  placeholder="Why is this domain trusted/untrusted?"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateDomain}
                  disabled={submitting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Updating...' : 'Update Domain'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileAdminLayout>
  )
}
