// Premium Family Sharing Service

export interface FamilyMember {
  id: string
  userId: string
  email: string
  name: string
  role: 'primary_parent' | 'partner' | 'grandparent' | 'caregiver' | 'guardian'
  permissions: {
    viewTimeline: boolean
    editChecklist: boolean
    addEntries: boolean
    viewAIChat: boolean
    manageCalendar: boolean
    inviteMembers: boolean
  }
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Date
  lastActive?: Date
  avatar?: string
}

export interface FamilyInvitation {
  id: string
  fromUserId: string
  fromUserName: string
  toEmail: string
  role: FamilyMember['role']
  permissions: FamilyMember['permissions']
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: Date
  expiresAt: Date
  message?: string
}

export interface SharedActivity {
  id: string
  type: 'checklist_completion' | 'milestone_achieved' | 'ai_question' | 'calendar_event' | 'photo_upload'
  childId: string
  userId: string
  userRole: FamilyMember['role']
  title: string
  description?: string
  timestamp: Date
  data: any
  visibility: 'all_family' | 'parents_only' | 'primary_only'
  reactions: {
    userId: string
    type: 'heart' | 'celebration' | 'support' | 'concern'
    timestamp: Date
  }[]
  comments: {
    id: string
    userId: string
    message: string
    timestamp: Date
  }[]
}

export interface FamilySettings {
  familyId: string
  name: string
  primaryParentId: string
  subscriptionPlan: 'family_basic' | 'family_premium'
  settings: {
    autoShareMilestones: boolean
    notifyAllMembers: boolean
    allowGrandparentAccess: boolean
    dataRetentionDays: number
    privacyLevel: 'open' | 'restricted' | 'private'
  }
  children: string[] // Array of child IDs this family manages
  createdAt: Date
  updatedAt: Date
}

export class FamilySharingService {
  async createFamily(
    primaryParentId: string,
    familyName: string,
    childIds: string[]
  ): Promise<{ familyId: string; success: boolean }> {
    try {
      const familyId = `family-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      const familySettings: FamilySettings = {
        familyId,
        name: familyName,
        primaryParentId,
        subscriptionPlan: 'family_basic',
        settings: {
          autoShareMilestones: true,
          notifyAllMembers: true,
          allowGrandparentAccess: false,
          dataRetentionDays: 365,
          privacyLevel: 'restricted'
        },
        children: childIds,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store in database
      await this.saveFamilySettings(familySettings)
      
      return { familyId, success: true }
    } catch (error) {
      console.error('Failed to create family:', error)
      return { familyId: '', success: false }
    }
  }

  async inviteFamilyMember(
    familyId: string,
    fromUserId: string,
    toEmail: string,
    role: FamilyMember['role'],
    customMessage?: string
  ): Promise<{ invitationId: string; success: boolean }> {
    try {
      const family = await this.getFamilySettings(familyId)
      if (!family || family.primaryParentId !== fromUserId) {
        throw new Error('Unauthorized to invite members')
      }

      const permissions = this.getDefaultPermissions(role)
      const invitationId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      const invitation: FamilyInvitation = {
        id: invitationId,
        fromUserId,
        fromUserName: await this.getUserName(fromUserId),
        toEmail,
        role,
        permissions,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: customMessage
      }

      await this.saveInvitation(invitation)
      await this.sendInvitationEmail(invitation, family.name)
      
      return { invitationId, success: true }
    } catch (error) {
      console.error('Failed to invite family member:', error)
      return { invitationId: '', success: false }
    }
  }

  private getDefaultPermissions(role: FamilyMember['role']): FamilyMember['permissions'] {
    switch (role) {
      case 'primary_parent':
        return {
          viewTimeline: true,
          editChecklist: true,
          addEntries: true,
          viewAIChat: true,
          manageCalendar: true,
          inviteMembers: true
        }
      case 'partner':
        return {
          viewTimeline: true,
          editChecklist: true,
          addEntries: true,
          viewAIChat: true,
          manageCalendar: true,
          inviteMembers: false
        }
      case 'grandparent':
        return {
          viewTimeline: true,
          editChecklist: false,
          addEntries: true,
          viewAIChat: false,
          manageCalendar: false,
          inviteMembers: false
        }
      case 'caregiver':
        return {
          viewTimeline: true,
          editChecklist: true,
          addEntries: true,
          viewAIChat: false,
          manageCalendar: false,
          inviteMembers: false
        }
      default:
        return {
          viewTimeline: true,
          editChecklist: false,
          addEntries: false,
          viewAIChat: false,
          manageCalendar: false,
          inviteMembers: false
        }
    }
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<{ success: boolean; familyId?: string }> {
    try {
      const invitation = await this.getInvitation(invitationId)
      if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
        throw new Error('Invalid or expired invitation')
      }

      // Create family member record
      const member: FamilyMember = {
        id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId,
        email: invitation.toEmail,
        name: await this.getUserName(userId),
        role: invitation.role,
        permissions: invitation.permissions,
        status: 'active',
        joinedAt: new Date()
      }

      await this.addFamilyMember(invitation.fromUserId, member)
      await this.updateInvitationStatus(invitationId, 'accepted')
      
      return { success: true, familyId: invitation.fromUserId }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      return { success: false }
    }
  }

  async shareActivity(
    familyId: string,
    userId: string,
    activity: Omit<SharedActivity, 'id' | 'timestamp' | 'reactions' | 'comments'>
  ): Promise<{ activityId: string; success: boolean }> {
    try {
      const member = await this.getFamilyMember(familyId, userId)
      if (!member) {
        throw new Error('User not a family member')
      }

      const activityId = `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      const sharedActivity: SharedActivity = {
        ...activity,
        id: activityId,
        timestamp: new Date(),
        reactions: [],
        comments: []
      }

      await this.saveSharedActivity(familyId, sharedActivity)
      await this.notifyFamilyMembers(familyId, sharedActivity, userId)
      
      return { activityId, success: true }
    } catch (error) {
      console.error('Failed to share activity:', error)
      return { activityId: '', success: false }
    }
  }

  async getFamilyTimeline(
    familyId: string,
    userId: string,
    limit: number = 50
  ): Promise<SharedActivity[]> {
    try {
      const member = await this.getFamilyMember(familyId, userId)
      if (!member || !member.permissions.viewTimeline) {
        return []
      }

      const activities = await this.getSharedActivities(familyId, limit)
      
      // Filter based on visibility and user role
      return activities.filter(activity => {
        if (activity.visibility === 'all_family') return true
        if (activity.visibility === 'parents_only' && ['primary_parent', 'partner'].includes(member.role)) return true
        if (activity.visibility === 'primary_only' && member.role === 'primary_parent') return true
        return false
      })
    } catch (error) {
      console.error('Failed to get family timeline:', error)
      return []
    }
  }

  async addReaction(
    familyId: string,
    activityId: string,
    userId: string,
    reactionType: SharedActivity['reactions'][0]['type']
  ): Promise<{ success: boolean }> {
    try {
      const member = await this.getFamilyMember(familyId, userId)
      if (!member) {
        throw new Error('User not a family member')
      }

      const reaction = {
        userId,
        type: reactionType,
        timestamp: new Date()
      }

      await this.saveReaction(familyId, activityId, reaction)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to add reaction:', error)
      return { success: false }
    }
  }

  async addComment(
    familyId: string,
    activityId: string,
    userId: string,
    message: string
  ): Promise<{ commentId: string; success: boolean }> {
    try {
      const member = await this.getFamilyMember(familyId, userId)
      if (!member) {
        throw new Error('User not a family member')
      }

      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      const comment = {
        id: commentId,
        userId,
        message: message.trim(),
        timestamp: new Date()
      }

      await this.saveComment(familyId, activityId, comment)
      
      return { commentId, success: true }
    } catch (error) {
      console.error('Failed to add comment:', error)
      return { commentId: '', success: false }
    }
  }

  async updateMemberPermissions(
    familyId: string,
    adminUserId: string,
    memberId: string,
    newPermissions: Partial<FamilyMember['permissions']>
  ): Promise<{ success: boolean }> {
    try {
      const admin = await this.getFamilyMember(familyId, adminUserId)
      if (!admin || !admin.permissions.inviteMembers) {
        throw new Error('Insufficient permissions')
      }

      await this.updatePermissions(familyId, memberId, newPermissions)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update permissions:', error)
      return { success: false }
    }
  }

  // Private helper methods (these would interact with your database)
  private async saveFamilySettings(settings: FamilySettings): Promise<void> {
    // Implementation depends on your database
    console.log('Saving family settings:', settings)
  }

  private async getFamilySettings(familyId: string): Promise<FamilySettings | null> {
    // Implementation depends on your database
    return null
  }

  private async saveInvitation(invitation: FamilyInvitation): Promise<void> {
    // Implementation depends on your database
    console.log('Saving invitation:', invitation)
  }

  private async getInvitation(invitationId: string): Promise<FamilyInvitation | null> {
    // Implementation depends on your database
    return null
  }

  private async updateInvitationStatus(invitationId: string, status: FamilyInvitation['status']): Promise<void> {
    // Implementation depends on your database
    console.log('Updating invitation status:', invitationId, status)
  }

  private async addFamilyMember(familyId: string, member: FamilyMember): Promise<void> {
    // Implementation depends on your database
    console.log('Adding family member:', familyId, member)
  }

  private async getFamilyMember(familyId: string, userId: string): Promise<FamilyMember | null> {
    // Implementation depends on your database
    return null
  }

  private async saveSharedActivity(familyId: string, activity: SharedActivity): Promise<void> {
    // Implementation depends on your database
    console.log('Saving shared activity:', familyId, activity)
  }

  private async getSharedActivities(familyId: string, limit: number): Promise<SharedActivity[]> {
    // Implementation depends on your database
    return []
  }

  private async saveReaction(familyId: string, activityId: string, reaction: SharedActivity['reactions'][0]): Promise<void> {
    // Implementation depends on your database
    console.log('Saving reaction:', familyId, activityId, reaction)
  }

  private async saveComment(familyId: string, activityId: string, comment: SharedActivity['comments'][0]): Promise<void> {
    // Implementation depends on your database
    console.log('Saving comment:', familyId, activityId, comment)
  }

  private async updatePermissions(familyId: string, memberId: string, permissions: Partial<FamilyMember['permissions']>): Promise<void> {
    // Implementation depends on your database
    console.log('Updating permissions:', familyId, memberId, permissions)
  }

  private async getUserName(userId: string): Promise<string> {
    // Implementation depends on your user service
    return 'Family Member'
  }

  private async sendInvitationEmail(invitation: FamilyInvitation, familyName: string): Promise<void> {
    // Implementation depends on your email service
    console.log('Sending invitation email:', invitation, familyName)
  }

  private async notifyFamilyMembers(familyId: string, activity: SharedActivity, excludeUserId: string): Promise<void> {
    // Implementation depends on your notification service
    console.log('Notifying family members:', familyId, activity, excludeUserId)
  }
}

export const familySharingService = new FamilySharingService()