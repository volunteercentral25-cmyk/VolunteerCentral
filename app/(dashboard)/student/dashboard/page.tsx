'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/lib/hooks/useDashboard'
import {
  DashboardHeader,
  StatsCards,
  QuickActions,
  RecentActivity,
  ProgressSection,
  LoadingSpinner,
  ErrorDisplay
} from '@/components/dashboard'

export default function StudentDashboard() {
  const { data, loading, error, refetch } = useDashboard()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <ErrorDisplay error={error} onRetry={refetch} className="min-h-screen" />
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Preparing your dashboard..." />
      </div>
    )
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
      <DashboardHeader profile={data.profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Welcome back!
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hello, <span className="text-gradient">{data.profile.full_name}</span>! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to make a difference? Track your progress, discover opportunities, and continue building your community impact.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={data.stats} achievements={data.achievements} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity activities={data.recentActivity} />

        {/* Progress Section */}
        <ProgressSection stats={data.stats} achievements={data.achievements} />
      </main>
    </div>
  )
}
