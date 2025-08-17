import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateAustralian(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function parseAustralianDate(dateString: string): Date | null {
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // JavaScript months are 0-based
  const year = parseInt(parts[2], 10)
  
  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}