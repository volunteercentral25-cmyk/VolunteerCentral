"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  User,
  Settings,
  LogOut,
  Calendar,
  Award,
  TrendingUp,
  Eye,
  Check,
  X,
  Mail,
} from "lucide-react"

export default function AdminDashboard() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [pendingHours] = useState([])

  const [overrideRequests] = useState([])

  const [recentActivity] = useState([])

  const stats = {
    totalStudents: 0,
    pendingReviews: pendingHours.length + overrideRequests.length,
    totalHoursThisMonth: 0,
    averageHoursPerStudent: 0,
  }

  const handleApprove = async (entryId: number) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSelectedEntry(null)
    }, 1500)
  }

  const handleDeny = async (entryId: number, reason: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSelectedEntry(null)
    }, 1500)
  }

  const handleSendOverrideEmail = async (entryId: number) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSelectedEntry(null)
    }, 1500)
  }

  const filteredPendingHours = pendingHours.filter(
    (entry) =>
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.organization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredOverrideRequests = overrideRequests.filter(
    (entry) =>
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.organization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/cata-logo.png" alt="CATA Logo" width={40} height={40} />
              <div>
                <h1 className="text-xl font-serif font-bold text-primary">CATA Volunteer</h1>
                <p className="text-sm text-muted-foreground font-sans">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-sans">Admin User</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground font-sans">
            Manage student volunteer hours and verify community service activities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors animate-slide-in-right">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-serif font-bold text-primary">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
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
                  <p className="text-sm font-sans text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-serif font-bold text-secondary">{stats.pendingReviews}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <AlertCircle className="h-6 w-6 text-secondary" />
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
                  <p className="text-sm font-sans text-muted-foreground">Hours This Month</p>
                  <p className="text-2xl font-serif font-bold text-primary">{stats.totalHoursThisMonth}</p>
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
                  <p className="text-sm font-sans text-muted-foreground">Avg Hours/Student</p>
                  <p className="text-2xl font-serif font-bold text-secondary">{stats.averageHoursPerStudent}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students or organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-sans"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Reviews */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-serif text-primary">Pending Reviews</CardTitle>
                <CardDescription className="font-sans">Student volunteer hours awaiting verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="regular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="regular" className="font-sans">
                      Regular Hours ({filteredPendingHours.length})
                    </TabsTrigger>
                    <TabsTrigger value="override" className="font-sans">
                      Override Requests ({filteredOverrideRequests.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="regular">
                    <div className="space-y-4">
                      {filteredPendingHours.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-serif font-semibold">{entry.studentName}</h4>
                                <p className="text-sm text-muted-foreground font-sans">{entry.organization}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-yellow-100 text-yellow-800 font-sans">Pending</Badge>
                                <span className="text-sm font-sans font-semibold text-primary">{entry.hours} hrs</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-sans mb-3">{entry.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground font-sans">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(entry.date).toLocaleDateString()}
                                </span>
                                <span>ID: {entry.studentId}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="font-sans bg-transparent"
                                      onClick={() => setSelectedEntry(entry)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    {selectedEntry && (
                                      <>
                                        <DialogHeader>
                                          <DialogTitle className="font-serif">Review Volunteer Hours</DialogTitle>
                                          <DialogDescription className="font-sans">
                                            {selectedEntry.studentName} - {selectedEntry.organization}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                              <Label className="font-sans font-semibold">Student Information</Label>
                                              <div className="mt-2 space-y-1 text-sm font-sans">
                                                <p>Name: {selectedEntry.studentName}</p>
                                                <p>ID: {selectedEntry.studentId}</p>
                                                <p>Email: {selectedEntry.studentEmail}</p>
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="font-sans font-semibold">Activity Details</Label>
                                              <div className="mt-2 space-y-1 text-sm font-sans">
                                                <p>Date: {new Date(selectedEntry.date).toLocaleDateString()}</p>
                                                <p>Hours: {selectedEntry.hours}</p>
                                                <p>Organization: {selectedEntry.organization}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="font-sans font-semibold">Description</Label>
                                            <p className="mt-2 text-sm text-muted-foreground font-sans">
                                              {selectedEntry.description}
                                            </p>
                                          </div>
                                          {selectedEntry.status === "override_pending" && (
                                            <div>
                                              <Label className="font-sans font-semibold">Override Reason</Label>
                                              <p className="mt-2 text-sm text-muted-foreground font-sans">
                                                {selectedEntry.reason}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <DialogFooter className="flex-col sm:flex-row gap-2">
                                          {selectedEntry.status === "override_pending" ? (
                                            <Button
                                              onClick={() => handleSendOverrideEmail(selectedEntry.id)}
                                              disabled={isLoading}
                                              className="font-sans font-semibold"
                                            >
                                              <Mail className="h-4 w-4 mr-2" />
                                              {isLoading ? "Sending..." : "Send Override Email"}
                                            </Button>
                                          ) : (
                                            <>
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    className="font-sans bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                                                  >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Deny
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                  <DialogHeader>
                                                    <DialogTitle className="font-serif">Deny Hours</DialogTitle>
                                                    <DialogDescription className="font-sans">
                                                      Please provide a reason for denying these hours.
                                                    </DialogDescription>
                                                  </DialogHeader>
                                                  <div className="space-y-4">
                                                    <div>
                                                      <Label htmlFor="denyReason" className="font-sans">
                                                        Reason for Denial
                                                      </Label>
                                                      <Textarea
                                                        id="denyReason"
                                                        placeholder="Explain why these hours are being denied..."
                                                        className="font-sans"
                                                        rows={3}
                                                      />
                                                    </div>
                                                  </div>
                                                  <DialogFooter>
                                                    <Button
                                                      onClick={() => handleDeny(selectedEntry.id, "reason")}
                                                      disabled={isLoading}
                                                      className="font-sans font-semibold bg-red-600 hover:bg-red-700"
                                                    >
                                                      {isLoading ? "Denying..." : "Deny Hours"}
                                                    </Button>
                                                  </DialogFooter>
                                                </DialogContent>
                                              </Dialog>
                                              <Button
                                                onClick={() => handleApprove(selectedEntry.id)}
                                                disabled={isLoading}
                                                className="font-sans font-semibold"
                                              >
                                                <Check className="h-4 w-4 mr-2" />
                                                {isLoading ? "Approving..." : "Approve"}
                                              </Button>
                                            </>
                                          )}
                                        </DialogFooter>
                                      </>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="override">
                    <div className="space-y-4">
                      {filteredOverrideRequests.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-serif font-semibold">{entry.studentName}</h4>
                                <p className="text-sm text-muted-foreground font-sans">{entry.organization}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-blue-100 text-blue-800 font-sans">Override Pending</Badge>
                                <span className="text-sm font-sans font-semibold text-primary">{entry.hours} hrs</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-sans mb-2">{entry.description}</p>
                            <p className="text-sm text-blue-600 font-sans mb-3">
                              <strong>Reason:</strong> {entry.reason}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground font-sans">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(entry.date).toLocaleDateString()}
                                </span>
                                <span>Coordinator: {entry.coordinatorEmail}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="font-sans bg-transparent"
                                      onClick={() => setSelectedEntry(entry)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    {selectedEntry && (
                                      <>
                                        <DialogHeader>
                                          <DialogTitle className="font-serif">Review Override Request</DialogTitle>
                                          <DialogDescription className="font-sans">
                                            {selectedEntry.studentName} - {selectedEntry.organization}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                              <Label className="font-sans font-semibold">Student Information</Label>
                                              <div className="mt-2 space-y-1 text-sm font-sans">
                                                <p>Name: {selectedEntry.studentName}</p>
                                                <p>ID: {selectedEntry.studentId}</p>
                                                <p>Email: {selectedEntry.studentEmail}</p>
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="font-sans font-semibold">Activity Details</Label>
                                              <div className="mt-2 space-y-1 text-sm font-sans">
                                                <p>Date: {new Date(selectedEntry.date).toLocaleDateString()}</p>
                                                <p>Hours: {selectedEntry.hours}</p>
                                                <p>Organization: {selectedEntry.organization}</p>
                                                <p>Coordinator: {selectedEntry.coordinatorEmail}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="font-sans font-semibold">Description</Label>
                                            <p className="mt-2 text-sm text-muted-foreground font-sans">
                                              {selectedEntry.description}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="font-sans font-semibold">Override Reason</Label>
                                            <p className="mt-2 text-sm text-muted-foreground font-sans">
                                              {selectedEntry.reason}
                                            </p>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            onClick={() => handleSendOverrideEmail(selectedEntry.id)}
                                            disabled={isLoading}
                                            className="font-sans font-semibold"
                                          >
                                            <Mail className="h-4 w-4 mr-2" />
                                            {isLoading ? "Sending..." : "Send Override Email"}
                                          </Button>
                                        </DialogFooter>
                                      </>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="font-serif text-secondary">Recent Activity</CardTitle>
                <CardDescription className="font-sans">Latest admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.action === "approved" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans">
                          <span className="font-semibold">{activity.studentName}</span> - {activity.hours} hours{" "}
                          <span
                            className={`font-semibold ${
                              activity.action === "approved" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {activity.action}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">{activity.organization}</p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        {activity.reason && (
                          <p className="text-xs text-red-600 font-sans mt-1">Reason: {activity.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
