'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  Shield, 
  LogOut,
  ChevronDown,
  User
} from 'lucide-react'

interface MobileAdminLayoutProps {
  children: React.ReactNode
  currentPage: string
  pageTitle: string
  pageDescription: string
  onSignOut: () => void
  userName?: string
}

export default function MobileAdminLayout({
  children,
  currentPage,
  pageTitle,
  pageDescription,
  onSignOut,
  userName = 'Admin'
}: MobileAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'Students', href: '/admin/students', icon: Users, current: currentPage === 'students' },
    { name: 'Opportunities', href: '/admin/opportunities', icon: Calendar, current: currentPage === 'opportunities' },
    { name: 'Hours', href: '/admin/hours', icon: Clock, current: currentPage === 'hours' },
    { name: 'Domains', href: '/admin/domains', icon: Shield, current: currentPage === 'domains' },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2 -ml-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/logo.png" 
                  alt="Volunteer Central Logo" 
                  width={28} 
                  height={28} 
                  className="rounded-lg"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Volunteer Central</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{userName}</span>
              </div>
              <Button 
                onClick={onSignOut}
                variant="outline" 
                size="sm"
                className="text-xs px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3" onClick={toggleSidebar}>
                    <Image 
                      src="/logo.png" 
                      alt="Volunteer Central Logo" 
                      width={32} 
                      height={32} 
                      className="rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Volunteer Central</p>
                      <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={toggleSidebar}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${item.current ? 'text-purple-600' : 'text-gray-500'}`} />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Logged in as {userName}
                  </div>
                  <Button
                    onClick={onSignOut}
                    variant="outline"
                    className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600 text-sm">{pageDescription}</p>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}
