'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Calendar, 
  Award, 
  Activity 
} from 'lucide-react'
import { DashboardStats, Achievement } from '@/lib/types/dashboard'

interface StatsCardsProps {
  stats: DashboardStats
  achievements: Achievement[]
}

export function StatsCards({ stats, achievements }: StatsCardsProps) {
  const cards = [
    {
      icon: Clock,
      value: stats.totalHours,
      label: 'Total Hours',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: Calendar,
      value: stats.opportunities,
      label: 'Opportunities',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Award,
      value: achievements.filter(a => a.earned).length,
      label: 'Achievements',
      gradient: 'from-green-600 to-blue-600'
    },
    {
      icon: Activity,
      value: stats.pendingHours,
      label: 'Pending Hours',
      gradient: 'from-orange-600 to-red-600'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
    >
      {cards.map((card, index) => (
        <Card key={index} className="glass-effect border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${card.gradient}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gradient">{card.value}</p>
            <p className="text-sm text-gray-600">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  )
}
