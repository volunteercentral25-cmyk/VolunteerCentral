'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Heart, 
  User, 
  ArrowRight 
} from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      href: '/student/hours',
      icon: Clock,
      title: 'Log Hours',
      description: 'Record your volunteer activities',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      href: '/student/opportunities',
      icon: Heart,
      title: 'Opportunities',
      description: 'Find new volunteer events',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      href: '/student/profile',
      icon: User,
      title: 'My Profile',
      description: 'View your progress & history',
      gradient: 'from-green-600 to-blue-600'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="glass-effect border-0 shadow-xl card-hover-effect cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`rounded-xl bg-gradient-to-r ${action.gradient} p-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <Button className="btn-primary w-full">
                  {action.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
