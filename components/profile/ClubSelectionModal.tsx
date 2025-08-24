'use client'

import { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'

interface ClubSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function ClubSelectionModal({ isOpen, onClose, onComplete }: ClubSelectionModalProps) {
  const [selectedClubs, setSelectedClubs] = useState({
    beta_club: false,
    nths: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleClubToggle = (club: 'beta_club' | 'nths') => {
    setSelectedClubs(prev => ({
      ...prev,
      [club]: !prev[club]
    }))
    // Clear message when user makes changes
    if (message) setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/student/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beta_club: selectedClubs.beta_club,
          nths: selectedClubs.nths
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Club information saved successfully!' })
        
        // Close modal and call onComplete after a short delay
        setTimeout(() => {
          onComplete()
          setMessage(null)
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to save club information' })
      }
    } catch (error) {
      console.error('Error saving club information:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Allow users to skip club selection
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
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gradient text-xl">Welcome to Volunteer Central!</CardTitle>
                <CardDescription>Tell us about your club memberships to help us personalize your experience</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Message Display */}
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
                  {/* Club Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium text-gray-900">Select your club memberships:</Label>
                    
                    {/* Beta Club */}
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                      <Checkbox
                        id="beta_club"
                        checked={selectedClubs.beta_club}
                        onCheckedChange={() => handleClubToggle('beta_club')}
                        disabled={isLoading}
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="beta_club" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Beta Club
                          </Label>
                          <p className="text-xs text-gray-600">National Beta Club member</p>
                        </div>
                        {selectedClubs.beta_club && (
                          <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                        )}
                      </div>
                    </div>

                    {/* NTHS */}
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
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
                          <p className="text-xs text-gray-600">National Technical Honor Society member</p>
                        </div>
                        {selectedClubs.nths && (
                          <Badge className="bg-green-100 text-green-800">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      You can be a member of both clubs. This information helps us provide you with relevant opportunities and track your achievements.
                    </p>
                  </div>

                  {/* Action Buttons */}
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
                          Continue
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
