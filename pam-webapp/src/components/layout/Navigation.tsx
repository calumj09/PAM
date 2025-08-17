'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  CheckCircleIcon, 
  MapPinIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  CheckCircleIcon as CheckSolid,
  MapPinIcon as MapPinSolid,
  ChartBarIcon as ChartSolid,
  CalendarDaysIcon as CalendarSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpSolid,
  CogIcon as CogSolid
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
    icon: MapPinIcon,
    activeIcon: MapPinSolid
  },
  { 
    href: '/dashboard/tracker', 
    label: 'Tracker', 
    icon: ChartBarIcon,
    activeIcon: ChartSolid
  },
  { 
    href: '/dashboard/growth', 
    label: 'Growth', 
    icon: ArrowTrendingUpIcon,
    activeIcon: ArrowTrendingUpSolid
  },
  { 
    href: '/dashboard/settings', 
    label: 'Settings', 
    icon: CogIcon,
    activeIcon: CogSolid
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border safe-area-pb shadow-lg">
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
                className="flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-primary/10 shadow-sm' : 'hover:bg-muted'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={`text-xs font-medium mt-1 ${
                  isActive 
                    ? 'text-primary font-semibold' 
                    : 'text-muted-foreground'
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