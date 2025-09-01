'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Code,
  Database,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Users,
  Award,
  Heart
} from 'lucide-react'

export default function CreatorPage() {
  return (
    <div className="min-h-screen gradient-bg overflow-hidden w-full">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-purple-300/70 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-blue-300/60 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md w-full"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" priority />
                <div>
                  <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
                  <p className="text-xs text-gray-600">Creator</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8 w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Meet the Creator
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Yatish <span className="text-gradient">Grandhe</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Full-stack developer passionate about creating impactful solutions for education and community service.
          </p>
        </motion.div>

        {/* Creator Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <Code className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Yatish Grandhe</h2>
                  <p className="text-gray-600">Full-Stack Developer</p>
                  <Badge className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    Volunteer Central Creator
                  </Badge>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                    <Code className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Specialization</p>
                      <p className="text-sm text-gray-600">Web Development & UI/UX</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Focus</p>
                      <p className="text-sm text-gray-600">Educational Technology</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Passion</p>
                      <p className="text-sm text-gray-600">Community Impact</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills and Technologies */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gradient">Skills & Technologies</CardTitle>
                <CardDescription>Technologies and frameworks used to build Volunteer Central</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Next.js', icon: Code, color: 'bg-black text-white' },
                    { name: 'React', icon: Code, color: 'bg-blue-600 text-white' },
                    { name: 'TypeScript', icon: Code, color: 'bg-blue-700 text-white' },
                    { name: 'Tailwind CSS', icon: Code, color: 'bg-cyan-500 text-white' },
                    { name: 'Supabase', icon: Database, color: 'bg-green-600 text-white' },
                    { name: 'PostgreSQL', icon: Database, color: 'bg-blue-800 text-white' },
                    { name: 'Framer Motion', icon: Zap, color: 'bg-purple-600 text-white' },
                    { name: 'Shadcn/ui', icon: Code, color: 'bg-gray-800 text-white' },
                    { name: 'Vercel', icon: Globe, color: 'bg-black text-white' }
                  ].map((tech) => (
                    <div key={tech.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <div className={`p-2 rounded-lg ${tech.color}`}>
                        <tech.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Project Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Volunteer Central Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed to streamline community service management for students and administrators.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Student Management",
                description: "Complete student profiles with club memberships, volunteer hours tracking, and achievement systems.",
                color: "from-blue-50 to-purple-50"
              },
              {
                icon: Award,
                title: "Achievement System",
                description: "Automated badges and recognition for volunteer milestones and community service goals.",
                color: "from-amber-50 to-orange-50"
              },
              {
                icon: Shield,
                title: "Admin Controls",
                description: "Comprehensive administrative tools for managing students, opportunities, and volunteer hours.",
                color: "from-green-50 to-blue-50"
              },
              {
                icon: Smartphone,
                title: "Mobile Responsive",
                description: "Optimized for all devices with dedicated mobile interfaces for both students and administrators.",
                color: "from-purple-50 to-pink-50"
              },
              {
                icon: Database,
                title: "Secure Database",
                description: "Robust data management with real-time updates, secure authentication, and comprehensive reporting.",
                color: "from-indigo-50 to-cyan-50"
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Instant notifications, live data synchronization, and seamless user experience across all devices.",
                color: "from-yellow-50 to-red-50"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.35 }}
              >
                <Card className="group card-hover-effect border-0 bg-white/80">
                  <CardContent className="flex items-start gap-4 p-6">
                    <motion.div
                      className={`rounded-xl bg-gradient-to-br ${feature.color} p-3 drop-shadow-md`}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      whileHover={{ rotate: 6, scale: 1.1 }}
                    >
                      <feature.icon className="h-6 w-6 text-gradient" aria-hidden="true" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <CardContent className="relative z-10 grid gap-6 p-8 md:grid-cols-2 md:p-12">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold md:text-4xl">Ready to make a difference?</h3>
                <p className="text-white/90">Join Volunteer Central and start tracking your community service impact today.</p>
              </div>
              <div className="flex items-center gap-3 md:justify-end">
                <Link href="/" className="rounded-md bg-white px-5 py-3 font-medium text-purple-700 shadow-md transition hover:shadow-lg">
                  Get Started
                </Link>
                <Link href="/" className="rounded-md bg-white/10 px-5 py-3 font-medium text-white backdrop-blur-sm ring-1 ring-white/30 transition hover:bg-white/20">
                  Learn More
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="mt-8 border-t border-white/40 bg-white/60 py-8 backdrop-blur-md w-full">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-gray-600 md:flex-row w-full">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Volunteer Central Logo" width={32} height={32} className="rounded-lg shadow-glow" />
            <div>
              <p className="text-sm font-semibold text-gradient">Volunteer Central</p>
              <p className="text-xs text-gray-600">Community Service</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <p>© {new Date().getFullYear()} Central High School. All rights reserved.</p>
            <Link href="/creator" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Created by Yatish Grandhe
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
