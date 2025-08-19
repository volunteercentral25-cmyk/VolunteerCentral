'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  Activity 
} from 'lucide-react'
import { RecentActivity as RecentActivityType } from '@/lib/types/dashboard'

interface RecentActivityProps {
  activities: RecentActivityType[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Activity className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusBgClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100'
      case 'pending':
        return 'bg-yellow-100'
      default:
        return 'bg-red-100'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Activity</h2>
      <Card className="glass-effect border-0 shadow-xl">
        <CardContent className="p-6">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-white/50">
                  <div className={`rounded-full p-2 ${getStatusBgClass(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.activity}</p>
                    <p className="text-sm text-gray-600">
                      {activity.hours} hours logged • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeClass(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity. Start by logging your first volunteer hours!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
