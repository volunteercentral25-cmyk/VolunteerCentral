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
    <div className="min-h-screen bg-cata-gradient">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-cata-burgundy/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/cata-logo.png" alt="CATA Logo" width={50} height={50} className="animate-float" />
              <div>
                <h1 className="text-2xl font-serif font-bold text-gradient">CATA Volunteer</h1>
                <p className="text-sm text-cata-navy font-sans">Central High School</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-cata-navy animate-pulse-cata">
                <Users className="h-4 w-4" />
                <span className="text-sm font-sans">500+ Students</span>
              </div>
              <div className="flex items-center space-x-2 text-cata-navy animate-pulse-cata">
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
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Empower Your <span className="text-gradient">Community</span>
              </h2>
              <p className="text-xl text-white/90 font-sans leading-relaxed">
                Explore volunteer opportunities, log your hours, and make a difference in your community.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-cata hover-lift animate-scale-in">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cata-burgundy/10 rounded-lg animate-glow">
                    <Heart className="h-5 w-5 text-cata-burgundy" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-cata-burgundy">Find Opportunities</h3>
                    <p className="text-sm text-muted-foreground font-sans">Browse local volunteer events</p>
                  </div>
                </div>
              </div>

              <div className="card-cata hover-lift animate-scale-in">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cata-navy/10 rounded-lg animate-glow">
                    <Award className="h-5 w-5 text-cata-navy" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-cata-navy">Track Hours</h3>
                    <p className="text-sm text-muted-foreground font-sans">Log and monitor your service</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="btn-cata-primary animate-bounce-cata">
                Get Started Today
              </button>
              <button className="btn-cata-secondary">
                Learn More
              </button>
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

          {/* Auth Forms */}
          <div className="animate-slide-in-right">
            <Card className="card-cata-gradient shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-white">Welcome Back</CardTitle>
                <CardDescription className="text-white/80 font-sans">
                  Sign in to your CATA Volunteer account
                </CardDescription>
              </CardHeader>
              <CardContent>
                                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/20">
                      <TabsTrigger value="login" className="text-white data-[state=active]:bg-white data-[state=active]:text-cata-burgundy">
                        <Lock className="h-4 w-4 mr-2" />
                        Login
                      </TabsTrigger>
                      <TabsTrigger value="register" className="text-white data-[state=active]:bg-white data-[state=active]:text-cata-burgundy">
                        <User className="h-4 w-4 mr-2" />
                        Register
                      </TabsTrigger>
                    </TabsList>

                                      <TabsContent value="login" className="space-y-4 mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white font-sans">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white/90 border-white/20 text-cata-burgundy placeholder:text-cata-burgundy/60 focus-cata"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white font-sans">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="bg-white/90 border-white/20 text-cata-burgundy placeholder:text-cata-burgundy/60 focus-cata"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-cata-primary w-full"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="loading-spinner mr-2"></div>
                              Signing in...
                            </div>
                          ) : (
                            "Sign In"
                          )}
                        </button>
                      </form>
                    </TabsContent>

                                      <TabsContent value="register" className="space-y-4 mt-6">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-email" className="text-white font-sans">Email</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white/90 border-white/20 text-cata-burgundy placeholder:text-cata-burgundy/60 focus-cata"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-id" className="text-white font-sans">Student ID</Label>
                          <Input
                            id="student-id"
                            type="text"
                            placeholder="Enter your 10-digit student ID"
                            className="bg-white/90 border-white/20 text-cata-burgundy placeholder:text-cata-burgundy/60 focus-cata"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password" className="text-white font-sans">Password</Label>
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Create a password"
                            className="bg-white/90 border-white/20 text-cata-burgundy placeholder:text-cata-burgundy/60 focus-cata"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-cata-primary w-full"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="loading-spinner mr-2"></div>
                              Creating account...
                            </div>
                          ) : (
                            "Create Account"
                          )}
                        </button>
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
