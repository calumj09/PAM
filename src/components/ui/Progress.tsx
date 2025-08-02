import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  label?: string
  animated?: boolean
}

export function Progress({
  value,
  className,
  size = 'md',
  variant = 'default',
  showValue = false,
  label,
  animated = false
}: ProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    default: 'bg-pam-primary',
    success: 'bg-pam-success',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-pam-gray-700">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-pam-gray-600">
              {normalizedValue}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-pam-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${normalizedValue}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${normalizedValue}%`}
        />
      </div>
    </div>
  )
}

// Circular Progress Component
interface CircularProgressProps {
  value: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  variant = 'default',
  showValue = false,
  children
}: CircularProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

  const variantClasses = {
    default: 'stroke-pam-primary',
    success: 'stroke-pam-success',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500'
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-pam-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-out',
            variantClasses[variant]
          )}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-lg font-semibold text-pam-gray-700">
            {normalizedValue}%
          </span>
        ))}
      </div>
    </div>
  )
}