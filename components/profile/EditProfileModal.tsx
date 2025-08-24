'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  X,
  User,
  Mail,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  student_id: string | null
  full_name: string
  role: string
  created_at: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileData
  onProfileUpdate: (updatedProfile: ProfileData) => void
}

export function EditProfileModal({ isOpen, onClose, profile, onProfileUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    student_id: profile.student_id || '',
    email: profile.email
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' })
      return false
    }
    
    if (!formData.student_id.trim()) {
      setMessage({ type: 'error', text: 'Student ID is required' })
      return false
    }

    if (!/^\d{10}$/.test(formData.student_id)) {
      setMessage({ type: 'error', text: 'Student ID must be exactly 10 digits' })
      return false
    }

    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' })
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          student_id: formData.student_id.trim(),
          email: formData.email.trim()
        })
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        onProfileUpdate(updatedProfile)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose()
          setMessage(null)
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      // Reset form data to original values
      setFormData({
        full_name: profile.full_name,
        student_id: profile.student_id || '',
        email: profile.email
      })
      setMessage(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass-effect border-0 shadow-2xl">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gradient text-xl">Edit Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      className="input-focus-effect"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Student ID */}
                  <div className="space-y-2">
                    <Label htmlFor="student_id" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student ID
                    </Label>
                    <Input
                      id="student_id"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      title="Student ID must be exactly 10 digits"
                      placeholder="10-digit Student ID"
                      value={formData.student_id}
                      onChange={(e) => handleInputChange("student_id", e.target.value)}
                      className="input-focus-effect"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">Must be exactly 10 digits</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@cata.edu"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="input-focus-effect"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Account Status (Read-only) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      <span className="text-sm text-gray-600">Your account is verified and active</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
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
