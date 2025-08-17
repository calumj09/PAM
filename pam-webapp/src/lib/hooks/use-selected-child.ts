'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Child {
  id: string
  name: string
  date_of_birth: string
  gender?: string
  is_premium_feature?: boolean
}

export function useSelectedChild() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (childrenError) {
        setError('Failed to load children')
        console.error('Error loading children:', childrenError)
        return
      }

      setChildren(childrenData || [])

      // Auto-select first child if only one exists
      if (childrenData && childrenData.length === 1) {
        setSelectedChild(childrenData[0])
      } else if (childrenData && childrenData.length > 1) {
        // Try to restore previously selected child from localStorage
        const savedChildId = localStorage.getItem('selectedChildId')
        if (savedChildId) {
          const savedChild = childrenData.find(c => c.id === savedChildId)
          if (savedChild) {
            setSelectedChild(savedChild)
          }
        }
      }
    } catch (error) {
      console.error('Error in loadChildren:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const selectChild = (child: Child) => {
    setSelectedChild(child)
    // Save selection to localStorage
    localStorage.setItem('selectedChildId', child.id)
  }

  return {
    children,
    selectedChild,
    selectChild,
    isLoading,
    error,
    hasMultipleChildren: children.length > 1,
    hasNoChildren: children.length === 0
  }
}