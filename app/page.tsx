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
    <div className="min-h-screen bg-cata-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cata-burgundy/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cata-navy/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cata-burgundy/20 to-cata-navy/20 rounded-full blur-2xl animate-spin-slow"></div>
      </div>
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-cata-burgundy/30 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image src="/cata-logo.png" alt="CATA Logo" width={50} height={50} className="animate-float drop-shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-cata-burgundy to-cata-navy rounded-full opacity-20 blur-xl animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gradient bg-gradient-to-r from-cata-burgundy via-cata-navy to-cata-burgundy bg-clip-text text-transparent animate-gradient-x">CATA Volunteer</h1>
                <p className="text-sm text-cata-navy font-sans font-medium">Central High School</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-cata-navy animate-pulse-cata group">
                <div className="p-2 bg-cata-burgundy/10 rounded-full group-hover:bg-cata-burgundy/20 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-sans font-medium">500+ Students</span>
              </div>
              <div className="flex items-center space-x-2 text-cata-navy animate-pulse-cata group">
                <div className="p-2 bg-cata-navy/10 rounded-full group-hover:bg-cata-navy/20 transition-colors">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-sm font-sans font-medium">10,000+ Hours</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section - Full Width */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-fade-in-up relative z-10">
                <div className="space-y-6">
                  <div className="relative">
                    <h2 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-2xl">
                      Empower Your <span className="text-gradient bg-gradient-to-r from-cata-burgundy via-white to-cata-navy bg-clip-text text-transparent animate-gradient-x">Community</span>
                    </h2>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cata-burgundy/50 to-cata-navy/50 blur-lg opacity-30 animate-pulse"></div>
                  </div>
                  <p className="text-xl md:text-2xl text-white/95 font-sans leading-relaxed max-w-2xl">
                    Explore volunteer opportunities, log your hours, and make a <span className="text-cata-burgundy font-semibold">difference</span> in your community.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="card-cata hover-lift animate-scale-in group">
                    <div className="flex items-center space-x-4 p-6">
                      <div className="p-3 bg-gradient-to-br from-cata-burgundy/20 to-cata-burgundy/10 rounded-xl animate-glow group-hover:scale-110 transition-transform">
                        <Heart className="h-6 w-6 text-cata-burgundy" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-cata-burgundy mb-1">Find Opportunities</h3>
                        <p className="text-sm text-white/80 font-sans">Browse local volunteer events</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-cata hover-lift animate-scale-in group">
                    <div className="flex items-center space-x-4 p-6">
                      <div className="p-3 bg-gradient-to-br from-cata-navy/20 to-cata-navy/10 rounded-xl animate-glow group-hover:scale-110 transition-transform">
                        <Award className="h-6 w-6 text-cata-navy" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-cata-navy mb-1">Track Hours</h3>
                        <p className="text-sm text-white/80 font-sans">Log and monitor your service</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button className="btn-cata-primary animate-bounce-cata group">
                    <span className="group-hover:scale-105 transition-transform">Get Started Today</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cata-burgundy to-cata-navy rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                  <button className="btn-cata-secondary group">
                    <span className="group-hover:scale-105 transition-transform">Learn More</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center group">
                    <div className="text-3xl font-serif font-bold text-cata-burgundy mb-2 animate-pulse-cata">50+</div>
                    <div className="text-sm text-white/80 font-sans font-medium">Active Opportunities</div>
                    <div className="w-12 h-1 bg-gradient-to-r from-cata-burgundy to-cata-navy mx-auto mt-2 rounded-full group-hover:scale-x-150 transition-transform"></div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-serif font-bold text-cata-navy mb-2 animate-pulse-cata">500+</div>
                    <div className="text-sm text-white/80 font-sans font-medium">Student Volunteers</div>
                    <div className="w-12 h-1 bg-gradient-to-r from-cata-navy to-cata-burgundy mx-auto mt-2 rounded-full group-hover:scale-x-150 transition-transform"></div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-serif font-bold text-cata-burgundy mb-2 animate-pulse-cata">10K+</div>
                    <div className="text-sm text-white/80 font-sans font-medium">Hours Logged</div>
                    <div className="w-12 h-1 bg-gradient-to-r from-cata-burgundy to-cata-navy mx-auto mt-2 rounded-full group-hover:scale-x-150 transition-transform"></div>
                  </div>
                </div>
              </div>

              {/* Auth Forms */}
              <div className="animate-slide-in-right relative z-10">
                <Card className="card-cata-gradient shadow-2xl border-0 backdrop-blur-xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-3xl font-serif text-white mb-2">Welcome Back</CardTitle>
                    <CardDescription className="text-white/90 font-sans text-lg">
                      Sign in to your CATA Volunteer account
                    </CardDescription>
                    <div className="w-24 h-1 bg-gradient-to-r from-cata-burgundy to-cata-navy mx-auto mt-4 rounded-full"></div>
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
          </div>
        </section>
      </main>
    </div>
  )
}
