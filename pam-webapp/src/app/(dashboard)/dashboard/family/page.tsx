'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FamilySharingService, 
  FamilyGroup, 
  FamilyRole 
} from '@/lib/services/family-sharing-service'
import { FamilyManagement } from '@/components/family/FamilyManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  UserGroupIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  HeartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function FamilyPage() {
  const [family, setFamily] = useState<FamilyGroup | null>(null)
  const [userRole, setUserRole] = useState<FamilyRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadFamilyData()
  }, [])

  const loadFamilyData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please sign in to manage your family')
        return
      }

      // Get user's primary family
      const primaryFamily = await FamilySharingService.getUserPrimaryFamily(user.id)
      
      if (!primaryFamily) {
        // Create a default family for the user if none exists
        await createDefaultFamily(user)
        return loadFamilyData()
      }

      setFamily(primaryFamily)
      setNewFamilyName(primaryFamily.name)

      // Get user's role in this family
      const role = await FamilySharingService.getUserFamilyRole(user.id, primaryFamily.id)
      setUserRole(role)

    } catch (error) {
      console.error('Error loading family data:', error)
      setError('Failed to load family information')
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultFamily = async (user: any) => {
    try {
      // This would be handled by the database trigger when user signs up
      // But let's make sure they have a family
      const { data, error } = await supabase
        .from('family_groups')
        .insert({
          name: `${user.email?.split('@')[0] || 'My'} Family`,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Add user as owner
      await supabase
        .from('family_members')
        .insert({
          family_id: data.id,
          user_id: user.id,
          role: 'owner',
          added_by: user.id,
          permissions: FamilySharingService.getDefaultPermissions('owner')
        })

      // Update all user's children to belong to this family
      await supabase
        .from('children')
        .update({ family_id: data.id })
        .eq('user_id', user.id)

    } catch (error) {
      console.error('Error creating default family:', error)
      throw error
    }
  }

  const handleUpdateFamilyName = async () => {
    if (!family || !newFamilyName.trim()) return

    try {
      await FamilySharingService.updateFamilyName(family.id, newFamilyName.trim())
      setFamily({ ...family, name: newFamilyName.trim() })
      setIsEditingName(false)
      setSuccess('Family name updated successfully')
    } catch (error: any) {
      console.error('Error updating family name:', error)
      setError(error.message || 'Failed to update family name')
    }
  }

  const handleLeaveFamily = async () => {
    if (!family || !userRole) return

    if (userRole === 'owner') {
      setError('Family owners cannot leave their family. Transfer ownership first or delete the family.')
      return
    }

    if (!confirm('Are you sure you want to leave this family? You will lose access to shared children and data.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await FamilySharingService.leaveFamily(family.id, user.id)
      
      // Redirect to dashboard or reload
      window.location.reload()
    } catch (error: any) {
      console.error('Error leaving family:', error)
      setError(error.message || 'Failed to leave family')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Family Settings</h1>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <InformationCircleIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-orange-900 mb-2">No Family Found</h3>
            <p className="text-orange-700 mb-4">
              You don't belong to any family yet. Create one or accept an invitation to get started.
            </p>
            <Button 
              onClick={loadFamilyData}
              className="bg-pam-red hover:bg-pam-red/90"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEditFamily = userRole === 'owner'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserGroupIcon className="w-6 h-6 text-pam-red" />
        <h1 className="text-2xl font-bold text-gray-900">Family Settings</h1>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Family Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-pam-red" />
            Family Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family Name
              </label>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                    autoFocus
                  />
                  <Button
                    onClick={handleUpdateFamilyName}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingName(false)
                      setNewFamilyName(family.name)
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">{family.name}</p>
                  {canEditFamily && (
                    <Button
                      onClick={() => setIsEditingName(true)}
                      size="sm"
                      variant="outline"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(family.created_at).toLocaleDateString('en-AU')}
            </div>
            <div>
              <span className="font-medium">Your Role:</span>{' '}
              <span className="px-2 py-1 bg-pam-pink text-pam-red text-xs rounded-full font-medium ml-1">
                {userRole ? FamilySharingService.getRoleDisplayName(userRole) : 'Unknown'}
              </span>
            </div>
          </div>

          {/* Leave Family Option (not for owners) */}
          {userRole !== 'owner' && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Leave Family</p>
                  <p className="text-sm text-gray-600">
                    Remove yourself from this family and lose access to shared data
                  </p>
                </div>
                <Button
                  onClick={handleLeaveFamily}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Leave Family
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Management */}
      <FamilyManagement familyId={family.id} userRole={userRole || 'caregiver'} />

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2"> Family Sharing Tips</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Partners</strong> have almost full access - perfect for spouses</p>
            <p>• <strong>Caregivers</strong> can add activities but not edit existing ones</p>
            <p>• <strong>Grandparents</strong> can view progress and add special moments</p>
            <p>• All family members can see children's activities and milestones</p>
            <p>• Only owners can remove members or delete the family</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}