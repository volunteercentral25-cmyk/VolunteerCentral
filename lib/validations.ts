import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  studentId: z.string().regex(/^\d{10}$/, 'Student ID must be exactly 10 digits'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const hoursSchema = z.object({
  hours: z.number().min(0.1, 'Hours must be at least 0.1'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  opportunityId: z.string().optional(),
})

export const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  maxVolunteers: z.number().min(0, 'Max volunteers must be 0 or greater'),
})

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  studentId: z.string().regex(/^\d{10}$/, 'Student ID must be exactly 10 digits'),
  email: z.string().email('Invalid email address'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type HoursFormData = z.infer<typeof hoursSchema>
export type OpportunityFormData = z.infer<typeof opportunitySchema>
export type ProfileFormData = z.infer<typeof profileSchema>
