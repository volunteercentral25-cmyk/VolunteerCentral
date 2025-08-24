"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  Users,
  Clock,
  Award,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  Search,
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    studentId: "",
    confirmPassword: ""
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        showMessage('error', `Login failed: ${error.message}`)
        return
      }

      showMessage('success', 'Login successful! Redirecting...')
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error) {
      showMessage('error', 'An unexpected error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (formData.password !== formData.confirmPassword) {
      showMessage('error', 'Passwords do not match')
      setIsLoading(false)
      return
    }

    // Enforce 10-digit student ID on homepage register as well
    if (!/^\d{10}$/.test(formData.studentId)) {
      showMessage('error', 'Student ID must be exactly 10 digits')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            student_id: formData.studentId,
            role: "student"
          }
        }
      })

      if (error) {
        showMessage('error', `Registration failed: ${error.message}`)
        return
      }

      showMessage('success', 'Account created successfully! Please check your email for verification.')
      // Clear form data
      setFormData({
        email: "",
        password: "",
        fullName: "",
        studentId: "",
        confirmPassword: ""
      })
      // Switch to login tab after a short delay
      setTimeout(() => setActiveTab("login"), 2000)
    } catch (error) {
      showMessage('error', 'An unexpected error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
              <div>
                <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                <p className="text-xs text-gray-600">Community Service</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <Link href="#auth" className="btn-secondary btn-hover-effect rounded-md px-4 py-2">Sign In</Link>
              <Link href="#auth" className="btn-primary btn-hover-effect rounded-md px-4 py-2">Get Started</Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4">
        {/* Hero */}
        <section className="grid gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div className="flex flex-col justify-center gap-8">
            <Badge className="w-fit bg-gradient-to-r from-purple-600 to-pink-600 text-white">Join the movement</Badge>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Empower your <span className="text-gradient">community impact</span>
            </h1>
            <p className="max-w-prose text-lg leading-relaxed text-gray-600 md:text-xl">
              Discover opportunities, log hours effortlessly, and earn recognition for your service. Built for students, loved by administrators.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#auth" className="btn-primary btn-hover-effect rounded-md px-5 py-3">Start now</Link>
              <Link href="/dashboard" className="btn-secondary rounded-md px-5 py-3">Go to dashboard</Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-gradient">200+</p>
                <p className="text-xs text-gray-600">Active students</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-gradient">4K+</p>
                <p className="text-xs text-gray-600">Hours logged</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm sm:block hidden">
                <p className="text-3xl font-bold text-gradient">25+</p>
                <p className="text-xs text-gray-600">Opportunities</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div id="auth" className="flex justify-center">
            <Card className="glass-effect w-full max-w-md border-0 shadow-xl">
              <CardHeader className="space-y-2 text-center">
                <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-purple">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gradient text-2xl">Welcome</CardTitle>
                <CardDescription>Sign in or create your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Message Display */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
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
                    <button
                      onClick={() => setMessage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1">
                    <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600">Sign In</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-6 space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="your.email@cata.edu" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? "Signing In..." : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="mt-6 space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input id="register-name" type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-student-id">Student ID</Label>
                        <Input id="register-student-id" type="text" inputMode="numeric" pattern="\d{10}" maxLength={10} title="Student ID must be exactly 10 digits" placeholder="10-digit Student ID" value={formData.studentId} onChange={(e) => handleInputChange("studentId", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input id="register-email" type="email" placeholder="your.email@cata.edu" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input id="register-password" type="password" placeholder="Create a password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <Input id="register-confirm-password" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} className="input-focus-effect" required />
                      </div>
                      <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[{
              icon: Heart,
              title: "Find Opportunities",
              description: "Discover meaningful volunteer opportunities that match your interests.",
              color: "from-pink-50 to-purple-50"
            }, {
              icon: Clock,
              title: "Track Hours",
              description: "Log hours instantly and keep everything verified and organized.",
              color: "from-indigo-50 to-blue-50"
            }, {
              icon: Award,
              title: "Earn Recognition",
              description: "Showcase your impact with badges, certificates, and reports.",
              color: "from-amber-50 to-rose-50"
            }].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.35 }}
              >
                <Card className="group card-hover-effect border-0 bg-white/80">
                  <CardContent className="flex items-start gap-4 p-6">
                    <motion.div
                      className={`rounded-xl bg-gradient-to-br ${item.color} p-3 drop-shadow-md`}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      whileHover={{ rotate: 6, scale: 1.1 }}
                    >
                      <item.icon className="h-6 w-6 text-gradient" aria-hidden="true" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-balance text-3xl font-bold text-gray-900 md:text-4xl">How it works</h2>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">Three simple steps to start making an impact.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[{
              icon: Search,
              title: "Explore",
              description: "Browse curated volunteer opportunities across causes and schedules."
            }, {
              icon: CalendarCheck2,
              title: "Sign Up",
              description: "Register for events in a click and receive confirmations."
            }, {
              icon: CheckCircle2,
              title: "Log Hours",
              description: "Track your hours with admin verification and real-time progress."
            }].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.35 }}
              >
                <Card className="group border-0 bg-white/80 shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <motion.div
                        className="rounded-lg bg-gradient-purple p-2 text-white drop-shadow"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.2 }}
                        whileHover={{ rotate: 8, scale: 1.1 }}
                      >
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </motion.div>
                      <span className="text-sm font-semibold text-gray-500">Step {idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <CardContent className="relative z-10 grid gap-6 p-8 md:grid-cols-2 md:p-12">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold md:text-4xl">Ready to make a difference?</h3>
                <p className="text-white/90">Create your account or jump straight into your dashboard to get started.</p>
              </div>
              <div className="flex items-center gap-3 md:justify-end">
                <Link href="#auth" className="rounded-md bg-white px-5 py-3 font-medium text-purple-700 shadow-md transition hover:shadow-lg">Create account</Link>
                <Link href="/dashboard" className="rounded-md bg-white/10 px-5 py-3 font-medium text-white backdrop-blur-sm ring-1 ring-white/30 transition hover:bg-white/20">Go to dashboard</Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-8 border-t border-white/40 bg-white/60 py-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-gray-600 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
            <div>
              <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
              <p className="text-xs text-gray-600">Community Service</p>
            </div>
          </div>
          <p>© {new Date().getFullYear()} Central High School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
