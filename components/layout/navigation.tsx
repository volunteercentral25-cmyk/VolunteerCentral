"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Home, Calendar, Clock, Users, Settings, LogOut, Menu, User, Award, Bell, ChevronDown, Shield } from "lucide-react"

interface NavigationProps {
  userRole?: "student" | "admin"
  userName?: string
  pendingNotifications?: number
}

export function Navigation({
  userRole = "student",
  userName = "Sarah Johnson",
  pendingNotifications = 3,
}: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const studentNavItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/student/opportunities", label: "Opportunities", icon: Calendar },
    { href: "/student/hours", label: "My Hours", icon: Clock },
    { href: "/student/profile", label: "Profile", icon: User },
  ]

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/opportunities", label: "Opportunities", icon: Calendar },
    { href: "/admin/hours", label: "Hour Reviews", icon: Clock },
    { href: "/admin/domains", label: "Email Domains", icon: Shield },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const navItems = userRole === "admin" ? adminNavItems : studentNavItems

  const isActive = (href: string) => pathname === href

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"}
            className="flex items-center space-x-3"
          >
            <Image src="/logo.png" alt="CATA Logo" width={40} height={40} className="animate-pulse-cata" />
            <div>
              <h1 className="text-xl font-serif font-bold text-primary">volunteer</h1>
              <p className="text-sm text-muted-foreground font-sans">
                {userRole === "admin" ? "Admin Portal" : "Student Portal"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`font-sans ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {pendingNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {pendingNotifications}
                </Badge>
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-sans">{userName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-sans">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={userRole === "admin" ? "/admin/profile" : "/student/profile"} className="font-sans">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={userRole === "admin" ? "/admin/settings" : "/student/settings"} className="font-sans">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {userRole === "student" && (
                  <DropdownMenuItem asChild>
                    <Link href="/student/achievements" className="font-sans">
                      <Award className="h-4 w-4 mr-2" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="font-sans text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="font-serif text-primary">volunteer</SheetTitle>
                  <SheetDescription className="font-sans">
                    {userRole === "admin" ? "Admin Portal" : "Student Portal"}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif font-semibold">{userName}</p>
                      <p className="text-sm text-muted-foreground font-sans capitalize">{userRole}</p>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors font-sans ${
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Additional Actions */}
                  <div className="pt-4 border-t space-y-2">
                    <Link
                      href={userRole === "admin" ? "/admin/profile" : "/student/profile"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-sans"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={userRole === "admin" ? "/admin/settings" : "/student/settings"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-sans"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    {userRole === "student" && (
                      <Link
                        href="/student/achievements"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-sans"
                      >
                        <Award className="h-5 w-5" />
                        <span>Achievements</span>
                      </Link>
                    )}
                    <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-sans w-full text-left">
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
