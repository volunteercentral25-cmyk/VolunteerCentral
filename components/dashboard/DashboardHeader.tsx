'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/lib/types/dashboard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/cata-logo.png" 
              alt="CATA Logo" 
              width={48} 
              height={48} 
              className="rounded-lg shadow-glow" 
            />
            <div>
              <p className="text-lg font-semibold text-gradient">volunteer</p>
              <p className="text-xs text-gray-600">Student Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{profile.full_name}</span>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="btn-secondary btn-hover-effect"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
