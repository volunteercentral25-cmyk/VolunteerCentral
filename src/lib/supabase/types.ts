export interface Profile {
  id: string
  email: string
  student_id?: string
  full_name: string
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

export interface VolunteerOpportunity {
  id: string
  title: string
  description: string
  location: string
  date: string
  start_time: string
  end_time: string
  max_participants: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface OpportunityRegistration {
  id: string
  opportunity_id: string
  student_id: string
  registered_at: string
  status: 'registered' | 'attended' | 'no_show'
}

export interface VolunteerHours {
  id: string
  student_id: string
  opportunity_id?: string
  hours: number
  date: string
  description: string
  status: 'pending' | 'approved' | 'denied' | 'override_pending'
  override_email?: string
  override_token?: string
  approved_by?: string
  approved_at?: string
  created_at: string
}

export interface EmailVerification {
  id: string
  email: string
  token: string
  expires_at: string
  verified_at?: string
}
