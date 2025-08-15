export const APP_NAME = 'CATA Volunteer'
export const APP_DESCRIPTION = 'Community Action Through Volunteering'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    OPPORTUNITIES: '/student/opportunities',
    HOURS: '/student/hours',
    PROFILE: '/student/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    OPPORTUNITIES: '/admin/opportunities',
    HOURS: '/admin/hours',
    SETTINGS: '/admin/settings',
  },
} as const

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
} as const

export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const

export const HOURS_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
} as const

export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
} as const

export const EMAIL_TEMPLATES = {
  VERIFICATION: 'verification',
  HOURS_OVERRIDE: 'hours_override',
  APPROVAL_NOTIFICATION: 'approval_notification',
} as const
