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
    if (selectedClubIds.length === 0) {
      setError('Please select at least one club to supervise')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/club-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubIds: selectedClubIds
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
                Choose which clubs you will supervise. You can select up to 2 clubs at a time.
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Selected: {selectedClubIds.length}/2 clubs
                    </span>
                    {selectedClubIds.length > 2 && (
                      <Badge variant="destructive" className="text-xs">
                        Maximum 2 clubs allowed
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {clubs.map((club) => (
                      <motion.div
                        key={club.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedClubIds.includes(club.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleClubToggle(club.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedClubIds.includes(club.id)}
                            onChange={() => handleClubToggle(club.id)}
                            disabled={!selectedClubIds.includes(club.id) && selectedClubIds.length >= 2}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{club.name}</h3>
                            {club.description && (
                              <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                            )}
                          </div>
                          {selectedClubIds.includes(club.id) && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {clubs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No clubs available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <div className="flex gap-3 p-6 border-t">
              <Button
                onClick={handleSave}
                disabled={saving || selectedClubIds.length === 0 || selectedClubIds.length > 2}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Selection'}
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
