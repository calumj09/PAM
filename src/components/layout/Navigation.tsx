'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  HomeIcon, 
  CheckCircleIcon, 
  CalendarDaysIcon,
  BeakerIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: HomeIcon },
  { href: '/dashboard/tracker', label: 'Track', icon: CalendarDaysIcon },
  { href: '/dashboard/growth', label: 'Growth', icon: ScaleIcon },
  { href: '/dashboard/checklist', label: 'Tasks', icon: CheckCircleIcon },
  { href: '/dashboard/medications', label: 'Meds', icon: BeakerIcon },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 safe-area-pb">
      <div className="flex items-center justify-between px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-red-600 bg-red-100 scale-105' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className={cn(
                'p-1 rounded-lg transition-all duration-200',
                isActive ? 'bg-red-100' : ''
              )}>
                <Icon className="w-6 h-6 flex-shrink-0" />
              </div>
              <span className={cn(
                'text-xs font-medium truncate',
                isActive ? 'font-semibold' : ''
              )}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}