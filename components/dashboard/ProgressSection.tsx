'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award } from 'lucide-react'
import { DashboardStats, Achievement } from '@/lib/types/dashboard'

interface ProgressSectionProps {
  stats: DashboardStats
  achievements: Achievement[]
}

export function ProgressSection({ stats, achievements }: ProgressSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Progress</h2>
      <Card className="glass-effect border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hours Goal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours Goal</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Progress</span>
                  <span className="font-medium">{stats.totalHours}/20 hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.goalProgress}%` }}
                    transition={{ duration: 1, delay: 1 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {Math.max(0, 20 - stats.totalHours)} hours remaining to reach your goal
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.earned ? 'bg-white/50' : 'bg-white/30 opacity-50'
                    }`}
                  >
                    <div className={`rounded-full p-2 ${
                      achievement.earned ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Award className={`h-5 w-5 ${
                        achievement.earned ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{achievement.name}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {!achievement.earned && achievement.remaining && (
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.remaining} hours remaining
                        </p>
                      )}
                    </div>
                    <Badge className={
                      achievement.earned 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-600'
                    }>
                      {achievement.earned ? 'Achieved' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
