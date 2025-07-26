'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FamilySharingService, 
  FamilyMember, 
  FamilyInvitation, 
  FamilyRole 
} from '@/lib/services/family-sharing-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  UserGroupIcon,
  PlusIcon,
  EnvelopeIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { StarIcon as CrownIcon } from '@heroicons/react/24/solid'

interface FamilyManagementProps {
  familyId: string
  userRole: FamilyRole
}

export function FamilyManagement({ familyId, userRole }: FamilyManagementProps) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<FamilyRole>('partner')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadFamilyData()
  }, [familyId])

  const loadFamilyData = async () => {
    try {
      setIsLoading(true)
      const [membersData, invitationsData] = await Promise.all([
        FamilySharingService.getFamilyMembers(familyId),
        FamilySharingService.getFamilyInvitations(familyId)
      ])
      
      setMembers(membersData)
      setInvitations(invitationsData)
    } catch (error) {
      console.error('Error loading family data:', error)
      setError('Failed to load family information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      setIsInviting(true)
      setError('')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await FamilySharingService.inviteFamilyMember(
        familyId,
        inviteEmail.trim(),
        inviteRole,
        user.id
      )

      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setShowInviteForm(false)
      await loadFamilyData()

    } catch (error: any) {
      console.error('Error inviting member:', error)
      setError(error.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return

    try {
      await FamilySharingService.removeFamilyMember(familyId, memberUserId)
      setSuccess('Family member removed successfully')
      await loadFamilyData()
    } catch (error: any) {
      console.error('Error removing member:', error)
      setError(error.message || 'Failed to remove family member')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return

    try {
      await FamilySharingService.cancelInvitation(invitationId)
      setSuccess('Invitation cancelled')
      await loadFamilyData()
    } catch (error: any) {
      console.error('Error canceling invitation:', error)
      setError(error.message || 'Failed to cancel invitation')
    }
  }

  const copyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setSuccess('Invite link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      setError('Failed to copy invite link')
    }
  }

  const canInviteMembers = userRole === 'owner' || userRole === 'partner'
  const canRemoveMembers = userRole === 'owner'

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-pam-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family information...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-6 h-6 text-pam-red" />
          <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
        </div>
        {canInviteMembers && (
          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-pam-red hover:bg-pam-red/90"
            size="sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
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

      {/* Invite Form */}
      {showInviteForm && canInviteMembers && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Invite Family Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as FamilyRole)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                >
                  <option value="partner">Partner - Full access</option>
                  <option value="caregiver">Caregiver - Limited access</option>
                  <option value="grandparent">Grandparent - View & add only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {FamilySharingService.getRoleDescription(inviteRole)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isInviting}
                  className="bg-pam-red hover:bg-pam-red/90"
                >
                  {isInviting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      Send Invitation
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Current Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pam-red to-pam-pink rounded-full flex items-center justify-center">
                    {member.role === 'owner' ? (
                      <CrownIcon className="w-5 h-5 text-white" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {member.user?.user_metadata?.first_name || 
                         member.user?.email?.split('@')[0] || 
                         'Unknown User'}
                      </p>
                      <span className="px-2 py-1 bg-pam-pink text-pam-red text-xs rounded-full font-medium">
                        {FamilySharingService.getRoleDisplayName(member.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{member.user?.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString('en-AU')}
                    </p>
                  </div>
                </div>

                {canRemoveMembers && member.role !== 'owner' && (
                  <Button
                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-8 h-8 text-yellow-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                          {FamilySharingService.getRoleDisplayName(invitation.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Invited {new Date(invitation.created_at).toLocaleDateString('en-AU')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {new Date(invitation.expires_at).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyInviteLink(invitation.token)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                    {canInviteMembers && (
                      <Button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Family Sharing Privacy</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Only family members can see your children's data</p>
            <p>• Each role has different permissions for data access</p>
            <p>• You can remove members or leave families anytime</p>
            <p>• Owners have full control over family management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}