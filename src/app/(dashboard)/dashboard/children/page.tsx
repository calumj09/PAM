'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDateAustralian, parseAustralianDate } from '@/lib/utils'
import { ChecklistService } from '@/lib/services/checklist-service'
import { FamilySharingService } from '@/lib/services/family-sharing-service'
import { PlusIcon, UserGroupIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Child {
  id: string
  name: string
  date_of_birth: string
  is_premium_feature: boolean
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildDOB, setNewChildDOB] = useState('')
  const [error, setError] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error loading children:', error)
      setError('Failed to load children')
    } finally {
      setIsLoading(false)
    }
  }

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChildName.trim() || !newChildDOB) return

    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Parse the Australian date format
      const parsedDate = parseAustralianDate(newChildDOB)
      if (!parsedDate) {
        setError('Please enter a valid date in DD/MM/YYYY format')
        setIsLoading(false)
        return
      }

      // Check if adding more than one child (premium feature)
      const isPremium = children.length > 0

      // Get user's primary family to assign child to
      const primaryFamily = await FamilySharingService.getUserPrimaryFamily(user.id)

      const { data: insertedChild, error } = await supabase
        .from('children')
        .insert({
          user_id: user.id,
          name: newChildName.trim(),
          date_of_birth: parsedDate.toISOString().split('T')[0],
          is_premium_feature: isPremium,
          family_id: primaryFamily?.id || null
        })
        .select()
        .single()

      if (error) throw error

      // Generate checklist for the new child
      try {
        // Get user's state from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('state_territory')
          .eq('id', user.id)
          .single()

        await ChecklistService.generateChecklistForChild(
          insertedChild.id,
          insertedChild.date_of_birth,
          profile?.state_territory || undefined
        )
      } catch (checklistError) {
        console.error('Error generating checklist:', checklistError)
        // Don't throw error - child creation succeeded, checklist generation is secondary
      }

      // Reset form
      setNewChildName('')
      setNewChildDOB('')
      setIsAdding(false)
      
      // Reload children
      await loadChildren()
    } catch (error) {
      console.error('Error adding child:', error)
      setError('Failed to add child')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child? This will also delete all their associated data.')) {
      return
    }

    try {
      // Delete checklist items first
      await ChecklistService.deleteChecklistForChild(childId)
      
      // Then delete the child
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      await loadChildren()
    } catch (error) {
      console.error('Error deleting child:', error)
      setError('Failed to delete child')
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`
      }
      return `${years}y ${months}m old`
    }
  }

  if (isLoading && children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            My Children
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your children&apos;s profiles
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Child
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Child Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Child</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addChild} className="space-y-4">
              <Input
                label="Child's Name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Enter child's name"
                required
              />
              
              <Input
                label="Date of Birth"
                value={newChildDOB}
                onChange={(e) => setNewChildDOB(e.target.value)}
                placeholder="DD/MM/YYYY"
                helperText="Enter in Australian date format (DD/MM/YYYY)"
                required
              />

              {children.length > 0 && (
                <div className="p-3 bg-pam-pink/20 border border-pam-pink/30 rounded-lg">
                  <p className="text-sm text-pam-red">
                    <strong>Premium Feature:</strong> Adding multiple children requires a premium subscription.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" isLoading={isLoading}>
                  Add Child
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setNewChildName('')
                    setNewChildDOB('')
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Children List */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first child to start using PAM&apos;s personalized features
            </p>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pam-pink rounded-full flex items-center justify-center">
                      <span className="text-xl">👶</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        Born {formatDateAustralian(new Date(child.date_of_birth))}
                      </p>
                      <p className="text-sm text-pam-red font-medium">
                        {calculateAge(child.date_of_birth)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {child.is_premium_feature && (
                      <span className="px-2 py-1 bg-pam-pink/20 text-pam-red text-xs rounded-full">
                        Premium
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChild(child.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}