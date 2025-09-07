'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, CheckCircle, AlertCircle } from 'lucide-react'

interface Club {
  id: string
  name: string
  description: string
}

interface AdminClubSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function AdminClubSelectionModal({
  isOpen,
  onClose,
  onComplete
}: AdminClubSelectionModalProps) {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadClubs()
    }
  }, [isOpen])

  const loadClubs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/club-selection')
      if (!response.ok) {
        throw new Error('Failed to load clubs')
      }
      
      const data = await response.json()
      setClubs(data.clubs || [])
      setSelectedClubIds(data.supervisedClubIds || [])
    } catch (error) {
      console.error('Error loading clubs:', error)
      setError('Failed to load clubs')
    } finally {
      setLoading(false)
    }
  }

  const handleClubToggle = (clubId: string) => {
    setSelectedClubIds(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId)
      } else {
        return [...prev, clubId]
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // Since we only have NTHS, automatically select it
      const nthClub = clubs.find(club => club.name === 'NTHS')
      if (!nthClub) {
        throw new Error('NTHS club not found')
      }

      const response = await fetch('/api/admin/club-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubIds: [nthClub.id]
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save club selection')
      }

      onComplete()
    } catch (error) {
      console.error('Error saving club selection:', error)
      setError(error instanceof Error ? error.message : 'Failed to save club selection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Select Clubs to Supervise
              </CardTitle>
              <CardDescription>
                You are supervising NTHS (National Technical Honor Society). This gives you access to manage NTHS members and create opportunities for them.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-green-900">NTHS Supervisor</h3>
                        <p className="text-sm text-green-700 mt-1">
                          You will supervise NTHS (National Technical Honor Society) members and create opportunities for them.
                        </p>
                        <div className="mt-3">
                          <Badge className="bg-green-100 text-green-800">
                            Automatically Selected
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">
                      As an NTHS supervisor, you can:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Create volunteer opportunities for NTHS members</li>
                      <li>• Manage student registrations and hours</li>
                      <li>• View reports and analytics for NTHS activities</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="flex gap-3 p-6 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Continue with NTHS'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
