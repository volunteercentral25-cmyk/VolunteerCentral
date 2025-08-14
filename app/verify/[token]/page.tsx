"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Calendar, Clock, User, Building, Mail, Phone, AlertTriangle } from "lucide-react"

interface VerificationPageProps {
  params: {
    token: string
  }
}

export default function VerificationPage({ params }: VerificationPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "denied" | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "deny" | null>(null)
  const [denyReason, setDenyReason] = useState("")

  // Mock data - in real app, this would be fetched based on token
  const [verificationData] = useState({
    studentName: "Sarah Johnson",
    studentId: "12345678",
    studentEmail: "sarah.johnson@cata.edu",
    organization: "CATA Library",
    coordinatorName: "Jennifer Smith",
    coordinatorEmail: "j.smith@cata.edu",
    hours: 3,
    date: "2024-01-12",
    description: "Assisted with book organization and reading program for elementary students",
    submittedDate: "2024-01-12",
    requestType: "regular", // or "override"
    overrideReason: null,
  })

  const handleVerification = async (action: "approve" | "deny") => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setVerificationStatus(action === "approve" ? "approved" : "denied")
      setIsLoading(false)
      setShowConfirmDialog(false)
    }, 2000)
  }

  const openConfirmDialog = (action: "approve" | "deny") => {
    setActionType(action)
    setShowConfirmDialog(true)
  }

  if (verificationStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              {verificationStatus === "approved" ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-serif font-bold mb-2">
                {verificationStatus === "approved" ? "Hours Verified!" : "Hours Denied"}
              </h2>
              <p className="text-muted-foreground font-sans">
                {verificationStatus === "approved"
                  ? "Thank you for verifying the student's volunteer hours."
                  : "The volunteer hours have been denied with your feedback."}
              </p>
            </div>
            <div className="text-sm text-muted-foreground font-sans space-y-1">
              <p>Student: {verificationData.studentName}</p>
              <p>Hours: {verificationData.hours}</p>
              <p>Date: {new Date(verificationData.date).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Image src="/cata-logo.png" alt="CATA Logo" width={40} height={40} />
            <div>
              <h1 className="text-xl font-serif font-bold text-primary">CATA Volunteer</h1>
              <p className="text-sm text-muted-foreground font-sans">Hour Verification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center animate-fade-in-up">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Verify Volunteer Hours</h2>
            <p className="text-muted-foreground font-sans">
              Please review and verify the student's volunteer hours below.
            </p>
          </div>

          {/* Verification Card */}
          <Card className="border-primary/20 animate-slide-in-right">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-primary">Hour Verification Request</CardTitle>
                  <CardDescription className="font-sans">
                    Submitted on {new Date(verificationData.submittedDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 font-sans">Pending Verification</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-secondary mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Student Information
                    </h3>
                    <div className="space-y-2 text-sm font-sans">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{verificationData.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student ID:</span>
                        <span className="font-semibold">{verificationData.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold">{verificationData.studentEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-secondary mb-3 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Organization Details
                    </h3>
                    <div className="space-y-2 text-sm font-sans">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="font-semibold">{verificationData.organization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinator:</span>
                        <span className="font-semibold">{verificationData.coordinatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold">{verificationData.coordinatorEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer Activity Details */}
              <div className="border-t pt-6">
                <h3 className="font-serif font-semibold text-secondary mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Volunteer Activity Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground font-sans">Date</div>
                    <div className="font-serif font-semibold">
                      {new Date(verificationData.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground font-sans">Hours</div>
                    <div className="font-serif font-semibold text-2xl">{verificationData.hours}</div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <Building className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground font-sans">Location</div>
                    <div className="font-serif font-semibold">{verificationData.organization}</div>
                  </div>
                </div>
                <div>
                  <Label className="font-sans font-semibold">Activity Description</Label>
                  <p className="mt-2 p-4 bg-accent/30 rounded-lg text-sm font-sans text-muted-foreground">
                    {verificationData.description}
                  </p>
                </div>
              </div>

              {/* Override Information (if applicable) */}
              {verificationData.requestType === "override" && verificationData.overrideReason && (
                <div className="border-t pt-6">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-serif font-semibold text-yellow-700">Override Request</h3>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-sans text-yellow-800">{verificationData.overrideReason}</p>
                  </div>
                </div>
              )}

              {/* Verification Actions */}
              <div className="border-t pt-6">
                <h3 className="font-serif font-semibold text-secondary mb-4">Verification Decision</h3>
                <p className="text-sm text-muted-foreground font-sans mb-6">
                  Please verify if the student completed the volunteer hours as described. Your decision will be
                  recorded and the student will be notified.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => openConfirmDialog("deny")}
                    variant="outline"
                    className="flex-1 font-sans font-semibold bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Hours
                  </Button>
                  <Button onClick={() => openConfirmDialog("approve")} className="flex-1 font-sans font-semibold">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Hours
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mt-6 border-secondary/20">
            <CardContent className="p-6">
              <h3 className="font-serif font-semibold text-secondary mb-3">Important Information</h3>
              <div className="space-y-2 text-sm font-sans text-muted-foreground">
                <p>• Please only verify hours if you can confirm the student's participation</p>
                <p>• If you have questions, contact the CATA Volunteer program administrator</p>
                <p>• This verification link is secure and can only be used once</p>
                <p>• Your decision will be final and cannot be changed</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground font-sans">
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    support@catavolunteer.org
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    (559) 327-3000
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {actionType === "approve" ? "Verify Hours" : "Deny Hours"}
              </DialogTitle>
              <DialogDescription className="font-sans">
                {actionType === "approve"
                  ? "Confirm that you want to verify these volunteer hours."
                  : "Please provide a reason for denying these hours."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-accent/50 p-4 rounded-lg">
                <div className="text-sm font-sans space-y-1">
                  <p>
                    <strong>Student:</strong> {verificationData.studentName}
                  </p>
                  <p>
                    <strong>Hours:</strong> {verificationData.hours}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(verificationData.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Organization:</strong> {verificationData.organization}
                  </p>
                </div>
              </div>
              {actionType === "deny" && (
                <div className="space-y-2">
                  <Label htmlFor="denyReason" className="font-sans">
                    Reason for Denial
                  </Label>
                  <Textarea
                    id="denyReason"
                    placeholder="Please explain why you cannot verify these hours..."
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    className="font-sans"
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="font-sans">
                Cancel
              </Button>
              <Button
                onClick={() => handleVerification(actionType!)}
                disabled={isLoading || (actionType === "deny" && !denyReason.trim())}
                className={`font-sans font-semibold ${actionType === "deny" ? "bg-red-600 hover:bg-red-700" : ""}`}
              >
                {isLoading
                  ? actionType === "approve"
                    ? "Verifying..."
                    : "Denying..."
                  : actionType === "approve"
                    ? "Verify Hours"
                    : "Deny Hours"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
