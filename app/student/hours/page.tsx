"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Navigation } from "@/components/layout/navigation"
import { Clock, Plus, CheckCircle, AlertCircle, XCircle, Mail, FileText, Award, TrendingUp } from "lucide-react"

export default function HoursPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)

  const [loggedHours] = useState([
    {
      id: 1,
      organization: "Food Bank of Central Valley",
      hours: 4,
      date: "2024-01-15",
      status: "approved",
      description: "Sorted donations and helped with food distribution to families in need",
      approvedBy: "Michael Torres",
      approvedDate: "2024-01-16",
      submittedDate: "2024-01-15",
    },
    {
      id: 2,
      organization: "CATA Library",
      hours: 3,
      date: "2024-01-12",
      status: "pending",
      description: "Assisted with book organization and reading program for elementary students",
      submittedDate: "2024-01-12",
    },
    {
      id: 3,
      organization: "Senior Center",
      hours: 2.5,
      date: "2024-01-10",
      status: "approved",
      description: "Helped with technology assistance for seniors learning to use smartphones",
      approvedBy: "Susan Williams",
      approvedDate: "2024-01-11",
      submittedDate: "2024-01-10",
    },
    {
      id: 4,
      organization: "Community Garden Project",
      hours: 3.5,
      date: "2024-01-08",
      status: "denied",
      description: "Garden cleanup and maintenance work",
      deniedReason: "Insufficient documentation provided",
      reviewedBy: "Maria Rodriguez",
      reviewedDate: "2024-01-09",
      submittedDate: "2024-01-08",
    },
    {
      id: 5,
      organization: "Animal Shelter",
      hours: 4,
      date: "2024-01-05",
      status: "override_pending",
      description: "Animal care and kennel cleaning - coordinator unavailable for verification",
      overrideEmail: "david@valleyrescue.org",
      submittedDate: "2024-01-05",
    },
  ])

  const [registeredOpportunities] = useState([
    { id: 1, title: "Community Garden Cleanup", organization: "Green Valley Initiative" },
    { id: 2, title: "Youth Mentoring Program", organization: "CATA Elementary" },
    { id: 3, title: "Animal Shelter Support", organization: "Valley Animal Rescue" },
  ])

  const totalHours = loggedHours.filter((h) => h.status === "approved").reduce((sum, h) => sum + h.hours, 0)
  const pendingHours = loggedHours.filter((h) => h.status === "pending").reduce((sum, h) => sum + h.hours, 0)
  const thisMonthHours = loggedHours
    .filter((h) => h.status === "approved" && new Date(h.date).getMonth() === new Date().getMonth())
    .reduce((sum, h) => sum + h.hours, 0)

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowLogDialog(false)
    }, 2000)
  }

  const handleOverrideRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowOverrideDialog(false)
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "denied":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "override_pending":
        return <Mail className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "denied":
        return "bg-red-100 text-red-800"
      case "override_pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      <Navigation userRole="student" userName="Sarah Johnson" pendingNotifications={2} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Volunteer Hours</h2>
          <p className="text-muted-foreground font-sans">
            Track your volunteer hours and request verification for your community service.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors animate-slide-in-right">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">Total Approved</p>
                  <p className="text-2xl font-serif font-bold text-primary">{totalHours}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-secondary/20 hover:border-secondary/40 transition-colors animate-slide-in-right"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-serif font-bold text-secondary">{pendingHours}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-primary/20 hover:border-primary/40 transition-colors animate-slide-in-right"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">This Month</p>
                  <p className="text-2xl font-serif font-bold text-primary">{thisMonthHours}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-secondary/20 hover:border-secondary/40 transition-colors animate-slide-in-right"
            style={{ animationDelay: "0.3s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-serif font-bold text-secondary">{loggedHours.length}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
            <DialogTrigger asChild>
              <Button className="font-sans font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Log Volunteer Hours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Log Volunteer Hours</DialogTitle>
                <DialogDescription className="font-sans">
                  Record your volunteer hours for verification.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogHours} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="opportunity" className="font-sans">
                    Volunteer Opportunity
                  </Label>
                  <Select>
                    <SelectTrigger className="font-sans">
                      <SelectValue placeholder="Select an opportunity" />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredOpportunities.map((opp) => (
                        <SelectItem key={opp.id} value={opp.id.toString()} className="font-sans">
                          {opp.title} - {opp.organization}
                        </SelectItem>
                      ))}
                      <SelectItem value="other" className="font-sans">
                        Other (not from registered opportunities)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
\
