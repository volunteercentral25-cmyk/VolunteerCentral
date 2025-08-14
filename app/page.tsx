"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Users, Clock, Award, Mail, Lock, User, GraduationCap } from "lucide-react"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login process
    setTimeout(() => {
      // Redirect to student dashboard
      window.location.href = "/student/dashboard"
    }, 2000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate registration process
    setTimeout(() => {
      // Redirect to student dashboard
      window.location.href = "/student/dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/cata-logo.png" alt="CATA Logo" width={50} height={50} className="animate-pulse-cata" />
              <div>
                <h1 className="text-2xl font-serif font-bold text-primary">CATA Volunteer</h1>
                <p className="text-sm text-muted-foreground font-sans">Central High School</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-secondary">
                <Users className="h-4 w-4" />
                <span className="text-sm font-sans">500+ Students</span>
              </div>
              <div className="flex items-center space-x-2 text-secondary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-sans">10,000+ Hours</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                Empower Your <span className="text-primary">Community</span>
              </h2>
              <p className="text-xl text-muted-foreground font-sans leading-relaxed">
                Explore volunteer opportunities, log your hours, and make a difference in your community.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold">Find Opportunities</h3>
                      <p className="text-sm text-muted-foreground font-sans">Browse local volunteer events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold">Track Hours</h3>
                      <p className="text-sm text-muted-foreground font-sans">Log and verify your impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-serif font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground font-sans">Active Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif font-bold text-secondary">500+</div>
                <div className="text-sm text-muted-foreground font-sans">Student Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground font-sans">Hours Logged</div>
              </div>
            </div>
          </div>

          {/* Authentication Section */}
          <div className="animate-slide-in-right">
            <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-serif text-primary">Get Started</CardTitle>
                <CardDescription className="font-sans">Join the CATA volunteer community</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="font-sans">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="font-sans">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-sans">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@cata.edu"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-sans">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full font-sans font-semibold" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-sans">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId" className="font-sans">
                          Student ID
                        </Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="studentId"
                            type="text"
                            placeholder="12345678"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registerEmail" className="font-sans">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="registerEmail"
                            type="email"
                            placeholder="your.email@cata.edu"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registerPassword" className="font-sans">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="registerPassword"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10 font-sans"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full font-sans font-semibold" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-20 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-serif font-bold text-foreground mb-4">Why Choose CATA Volunteer?</h3>
            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
              Our platform makes it easy for students to find meaningful volunteer opportunities and track their
              community service hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-serif font-semibold mb-2">Easy Discovery</h4>
                <p className="text-muted-foreground font-sans">
                  Find volunteer opportunities that match your interests and schedule.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-xl font-serif font-semibold mb-2">Hour Tracking</h4>
                <p className="text-muted-foreground font-sans">
                  Log your volunteer hours with verification from organization coordinators.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-serif font-semibold mb-2">Recognition</h4>
                <p className="text-muted-foreground font-sans">
                  Earn recognition for your community service and build your college resume.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/cata-logo.png" alt="CATA Logo" width={40} height={40} />
              <div>
                <h5 className="font-serif font-semibold">CATA Volunteer Central</h5>
                <p className="text-sm text-secondary-foreground/80 font-sans">
                  Empowering students to make a difference
                </p>
              </div>
            </div>
            <div className="text-sm text-secondary-foreground/80 font-sans">
              © 2024 CATA Central High School. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
