import React from 'react'
import { cn } from '@/lib/utils'

interface ToggleOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ToggleGroupProps {
  options: ToggleOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

export function ToggleGroup({
  options,
  value,
  onValueChange,
  className,
  size = 'md',
  variant = 'default'
}: ToggleGroupProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  }

  const variantClasses = {
    default: {
      base: 'bg-pam-gray-100 border border-pam-gray-200',
      active: 'bg-pam-primary text-white shadow-sm',
      inactive: 'text-pam-gray-700 hover:bg-pam-gray-200'
    },
    outline: {
      base: 'bg-white border border-pam-gray-300',
      active: 'bg-pam-primary border-pam-primary text-white shadow-sm',
      inactive: 'text-pam-gray-700 hover:bg-pam-gray-50 hover:border-pam-gray-400'
    }
  }

  return (
    <div 
      className={cn(
        'inline-flex rounded-lg p-1',
        variantClasses[variant].base,
        className
      )}
      role="tablist"
    >
      {options.map((option, index) => {
        const isActive = value === option.value
        const isFirst = index === 0
        const isLast = index === options.length - 1
        
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              'inline-flex items-center justify-center font-medium transition-all duration-200 relative',
              'focus:outline-none focus:ring-2 focus:ring-pam-primary focus:ring-offset-1',
              'active:scale-95',
              sizeClasses[size],
              isFirst && 'rounded-l-md',
              isLast && 'rounded-r-md',
              !isFirst && !isLast && 'rounded-none',
              isActive 
                ? variantClasses[variant].active
                : variantClasses[variant].inactive
            )}
            onClick={() => onValueChange(option.value)}
          >
            {option.icon && (
              <span className="mr-2 flex-shrink-0">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}