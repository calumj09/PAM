'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  CheckCircleIcon as CheckSolid,
  DocumentTextIcon as DocumentSolid,
  ChartBarIcon as ChartSolid,
  CalendarDaysIcon as CalendarSolid,
  SparklesIcon as SparklesSolid
} from '@heroicons/react/24/solid'

const navItems = [
  { 
    href: '/dashboard/today', 
    label: 'Today', 
    icon: HomeIcon,
    activeIcon: HomeSolid
  },
  { 
    href: '/dashboard/checklist', 
    label: 'Timeline', 
    icon: CheckCircleIcon,
    activeIcon: CheckSolid
  },
  { 
    href: '/dashboard/calendar', 
    label: 'Calendar', 
    icon: CalendarDaysIcon,
    activeIcon: CalendarSolid
  },
  { 
    href: '/dashboard/info', 
    label: 'Local Info', 
    icon: DocumentTextIcon,
    activeIcon: DocumentSolid
  },
  { 
    href: '/dashboard/tracker', 
    label: 'Tracker', 
    icon: ChartBarIcon,
    activeIcon: ChartSolid
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-pam-gray-border safe-area-pb">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = isActive ? item.activeIcon : item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 transition-all duration-200"
              >
                <div className={`p-1 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-pam-burgundy/10' : 'hover:bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-pam-burgundy' : 'text-pam-text-gray'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  isActive 
                    ? 'text-pam-burgundy font-semibold' 
                    : 'text-pam-text-gray'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}