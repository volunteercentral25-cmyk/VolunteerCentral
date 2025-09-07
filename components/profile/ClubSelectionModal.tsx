'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Award,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck
} from 'lucide-react'

interface ClubSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userRole?: 'student' | 'admin'
  initialClubs?: { nths: boolean }
}

export function ClubSelectionModal({ isOpen, onClose, onComplete, userRole = 'student', initialClubs }: ClubSelectionModalProps) {
  console.log('ClubSelectionModal: Rendering with props:', { isOpen, userRole, initialClubs })
  
  const [selectedClubs, setSelectedClubs] = useState({
    nths: initialClubs?.nths || true // Default to NTHS selected
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const isAdmin = userRole === 'admin'
  const title = isAdmin ? 'Welcome to Volunteer Central!' : 'Welcome to Volunteer Central!'
  const description = isAdmin 
    ? 'You are an advisor for NTHS (National Technical Honor Society)'
    : 'You are a member of NTHS (National Technical Honor Society)'

  // Update selected clubs when initialClubs changes
  useEffect(() => {
    console.log('ClubSelectionModal: initialClubs changed:', initialClubs)
    if (initialClubs) {
      const newSelectedClubs = {
        nths: initialClubs.nths || true // Default to NTHS selected
      }
      setSelectedClubs(newSelectedClubs)
      console.log('ClubSelectionModal: Updated selectedClubs to:', newSelectedClubs)
    }
  }, [initialClubs])

  const handleClubToggle = (club: 'nths') => {
    console.log('ClubSelectionModal: Toggling club:', club, 'from', selectedClubs[club], 'to', !selectedClubs[club])
    setSelectedClubs(prev => ({
      ...prev,
      [club]: !prev[club]
    }))
    if (message) setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setMessage(null)

    console.log('Submitting club selection:', selectedClubs)

    try {
      const response = await fetch('/api/student/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nths: selectedClubs.nths
        })
      })

      console.log('Club API response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Club API response data:', responseData)
        
        // Create a success message showing selected clubs
        const selectedClubNames = []
        if (selectedClubs.nths) selectedClubNames.push('NTHS')
        
        const successMessage = selectedClubNames.length > 0 
          ? `Successfully saved: ${selectedClubNames.join(', ')}`
          : 'Club information updated successfully!'
        
        setMessage({ type: 'success', text: successMessage })
        setTimeout(() => {
          onComplete()
          setMessage(null)
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error('Club API error:', errorData)
        setMessage({ type: 'error', text: errorData.error || 'Failed to save club information' })
      }
    } catch (error) {
      console.error('Error saving club information:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="glass-effect border-0 shadow-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  {isAdmin ? <UserCheck className="h-8 w-8 text-white" /> : <Users className="h-8 w-8 text-white" />}
                </div>
                <CardTitle className="text-gradient text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="flex-1">{message.text}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium text-gray-900">
                      {isAdmin ? 'NTHS Advisor Status:' : 'NTHS Membership Status:'}
                    </Label>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 bg-green-50">
                      <Checkbox
                        id="nths"
                        checked={selectedClubs.nths}
                        onCheckedChange={() => handleClubToggle('nths')}
                        disabled={isLoading}
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="nths" className="text-sm font-medium text-gray-900 cursor-pointer">
                            NTHS
                          </Label>
                          <p className="text-xs text-gray-600">
                            {isAdmin ? 'NTHS advisor' : 'National Technical Honor Society member'}
                          </p>
                        </div>
                        {selectedClubs.nths && (
                          <Badge className="bg-green-100 text-green-800">
                            {isAdmin ? 'Advisor' : 'Member'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      {isAdmin 
                        ? 'As an NTHS advisor, you can manage student memberships and create opportunities for NTHS members.'
                        : 'As an NTHS member, you can participate in volunteer opportunities and track your service hours.'
                      }
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Skip for Now
                    </Button>
                    <Button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
