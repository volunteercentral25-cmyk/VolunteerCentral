"use client"
import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, MapPin, Users, Award, Plus, TrendingUp, Heart, CheckCircle, AlertCircle } from "lucide-react"

export default function StudentDashboard() {
  const [user] = useState({
    name: "Sarah Johnson",
    studentId: "12345678",
    email: "sarah.johnson@cata.edu",
    totalHours: 45.5,
    goalHours: 100,
    rank: 12,
    joinDate: "September 2024",
  })

  const [recentHours] = useState([
    {
      id: 1,
      organization: "Food Bank of Central Valley",
      hours: 4,
      date: "2024-01-15",
      status: "approved",
      description: "Sorted donations and helped with food distribution",
    },
    {
      id: 2,
      organization: "CATA Library",
      hours: 3,
      date: "2024-01-12",
      status: "pending",
      description: "Assisted with book organization and reading program",
    },
    {
      id: 3,
      organization: "Senior Center",
      hours: 2.5,
      date: "2024-01-10",
      status: "approved",
      description: "Helped with technology assistance for seniors",
    },
  ])

  const [upcomingOpportunities] = useState([
    {
      id: 1,
      title: "Community Garden Cleanup",
      organization: "Green Valley Initiative",
      date: "2024-01-20",
      time: "9:00 AM - 12:00 PM",
      location: "Central Park",
      spots: 15,
      registered: 8,
    },
    {
      id: 2,
      title: "Youth Mentoring Program",
      organization: "CATA Elementary",
      date: "2024-01-22",
      time: "3:30 PM - 5:00 PM",
      location: "Elementary Campus",
      spots: 10,
      registered: 6,
    },
    {
      id: 3,
      title: "Animal Shelter Support",
      organization: "Valley Animal Rescue",
      date: "2024-01-25",
      time: "10:00 AM - 2:00 PM",
      location: "Animal Shelter",
      spots: 12,
      registered: 4,
    },
  ])

  const progressPercentage = (user.totalHours / user.goalHours) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      {/* Navigation Component */}
      <Navigation userRole="student" userName={user.name} pendingNotifications={2} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground font-sans">
            Track your volunteer hours and discover new opportunities to make a difference.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors animate-slide-in-right">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-serif font-bold text-primary">{user.totalHours}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
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
                  <p className="text-sm font-sans text-muted-foreground">Class Rank</p>
                  <p className="text-2xl font-serif font-bold text-secondary">#{user.rank}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-secondary" />
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
                  <p className="text-sm font-sans text-muted-foreground">Organizations</p>
                  <p className="text-2xl font-serif font-bold text-primary">8</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Heart className="h-6 w-6 text-primary" />
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
                  <p className="text-sm font-sans text-muted-foreground">This Month</p>
                  <p className="text-2xl font-serif font-bold text-secondary">12.5</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-primary">Annual Goal Progress</CardTitle>
            <CardDescription className="font-sans">
              You're {Math.round(progressPercentage)}% of the way to your {user.goalHours} hour goal!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm font-sans text-muted-foreground">
                <span>{user.totalHours} hours completed</span>
                <span>{user.goalHours - user.totalHours} hours remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Hours */}
          <Card className="border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-secondary">Recent Hours</CardTitle>
                <CardDescription className="font-sans">Your latest volunteer activities</CardDescription>
              </div>
              <Button size="sm" className="font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Log Hours
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHours.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-4 p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {entry.status === "approved" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-serif font-semibold text-sm">{entry.organization}</h4>
                        <Badge variant={entry.status === "approved" ? "default" : "secondary"} className="font-sans">
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans mb-2">{entry.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground font-sans">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {entry.hours} hours
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Opportunities */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-primary">Upcoming Opportunities</CardTitle>
                <CardDescription className="font-sans">Events you can join</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="font-sans bg-transparent">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-serif font-semibold text-sm mb-1">{opportunity.title}</h4>
                        <p className="text-sm text-muted-foreground font-sans">{opportunity.organization}</p>
                      </div>
                      <Button size="sm" variant="outline" className="font-sans bg-transparent">
                        Register
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-sans">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(opportunity.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {opportunity.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {opportunity.registered}/{opportunity.spots} spots
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-16 font-sans font-semibold" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Log Volunteer Hours
          </Button>
          <Button variant="outline" className="h-16 font-sans font-semibold bg-transparent" size="lg">
            <Calendar className="h-5 w-5 mr-2" />
            Browse Opportunities
          </Button>
          <Button variant="outline" className="h-16 font-sans font-semibold bg-transparent" size="lg">
            <Award className="h-5 w-5 mr-2" />
            View Achievements
          </Button>
        </div>
      </main>
    </div>
  )
}
