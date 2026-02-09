'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home,
  Users,
  FileText,
  Bell,
  Upload,
  MessageSquare,
  DollarSign,
  Settings,
  Calendar,
  Search,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Tax Returns', href: '/returns', icon: FileText },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'IRS Notices', href: '/notices', icon: Bell },
  { name: 'Tasks', href: '/tasks', icon: Calendar },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Compliance', href: '/compliance', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Logo and collapse button */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">TP</span>
              </div>
              <span className="text-lg font-semibold">TaxPro</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">{item.name}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User profile */}
        <div className="border-t p-4">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Enrolled Agent</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="sm" className="w-full mt-2 justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}