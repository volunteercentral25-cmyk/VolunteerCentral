export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin'
  student_id?: string
  phone?: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalHours: number
  approvedHours: number
  pendingHours: number
  opportunities: number
  goalProgress: number
}

export interface RecentActivity {
  id: string
  activity: string
  hours: number
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface Achievement {
  name: string
  description: string
  earned: boolean
  remaining?: number
  icon?: string
}

export interface DashboardData {
  profile: Profile
  stats: DashboardStats
  recentActivity: RecentActivity[]
  achievements: Achievement[]
}

export interface DashboardError {
  message: string
  code: string
  details?: string
}

export interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: DashboardError | null
}
