'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserGroupIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

interface Child {
  id: string
  name: string
  date_of_birth: string
  is_due_date: boolean
  baby_type: string
  created_at: string
}

interface ChildrenManagementProps {
  userId: string
}

export function ChildrenManagement({ userId }: ChildrenManagementProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to delete this child? This will also delete all associated data (tracker entries, checklist items, etc.).')) {
      return
    }

    setDeletingId(childId)
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      
      // Remove from local state
      setChildren(children.filter(c => c.id !== childId))
    } catch (error) {
      console.error('Error deleting child:', error)
      alert('Failed to delete child. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth: string, isDueDate: boolean) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    
    if (isDueDate && birthDate > today) {
      const weeks = Math.floor((birthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
      return `Due in ${weeks} weeks`
    }
    
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth())
    
    if (months < 1) {
      const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${days} days old`
    } else if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''} old`
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Children
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Children
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No children added yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">
                      {child.is_due_date ? 'Due ' : 'Born '} {formatDate(child.date_of_birth)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculateAge(child.date_of_birth, child.is_due_date)} • {child.baby_type === 'twins' ? 'Twins' : 'Single baby'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        alert('Edit functionality coming soon!')
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChild(child.id)}
                      disabled={deletingId === child.id || children.length === 1}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title={children.length === 1 ? "You must have at least one child" : "Delete child"}
                    >
                      {deletingId === child.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {children.length > 1 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Note: You have multiple children registered. The app may show combined data in some sections.
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement add child functionality
              alert('To add another child, please use the onboarding flow. Multiple child support is coming soon!')
            }}
            className="w-full"
          >
            Add Another Child
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}