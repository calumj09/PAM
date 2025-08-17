import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { EmailService } from './email-service'
import crypto from 'crypto'

export type FamilyRole = 'owner' | 'partner' | 'caregiver' | 'grandparent'

export interface FamilyGroup {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: FamilyRole
  permissions: Record<string, boolean>
  joined_at: string
  added_by: string
  user?: {
    email?: string
    user_metadata?: {
      first_name?: string
      last_name?: string
    }
  }
}

export interface FamilyInvitation {
  id: string
  family_id: string
  invited_by: string
  email: string
  role: FamilyRole
  token: string
  expires_at: string
  accepted_at?: string
  accepted_by?: string
  created_at: string
  invited_by_user?: {
    email?: string
    user_metadata?: {
      first_name?: string
      last_name?: string
    }
  }
  family?: {
    name: string
  }
}

export interface FamilyPermissions {
  canViewActivities: boolean
  canAddActivities: boolean
  canEditActivities: boolean
  canDeleteActivities: boolean
  canViewAnalytics: boolean
  canManageChildren: boolean
  canInviteMembers: boolean
  canRemoveMembers: boolean
}

export class FamilySharingService {
  
  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: FamilyRole): FamilyPermissions {
    const permissions: Record<FamilyRole, FamilyPermissions> = {
      owner: {
        canViewActivities: true,
        canAddActivities: true,
        canEditActivities: true,
        canDeleteActivities: true,
        canViewAnalytics: true,
        canManageChildren: true,
        canInviteMembers: true,
        canRemoveMembers: true,
      },
      partner: {
        canViewActivities: true,
        canAddActivities: true,
        canEditActivities: true,
        canDeleteActivities: true,
        canViewAnalytics: true,
        canManageChildren: true,
        canInviteMembers: true,
        canRemoveMembers: false,
      },
      caregiver: {
        canViewActivities: true,
        canAddActivities: true,
        canEditActivities: false,
        canDeleteActivities: false,
        canViewAnalytics: false,
        canManageChildren: false,
        canInviteMembers: false,
        canRemoveMembers: false,
      },
      grandparent: {
        canViewActivities: true,
        canAddActivities: true,
        canEditActivities: false,
        canDeleteActivities: false,
        canViewAnalytics: true,
        canManageChildren: false,
        canInviteMembers: false,
        canRemoveMembers: false,
      }
    }
    
    return permissions[role]
  }

  /**
   * Get user's family groups
   */
  static async getUserFamilies(userId: string): Promise<FamilyGroup[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('family_groups')
      .select(`
        *,
        family_members!inner(user_id, role)
      `)
      .eq('family_members.user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user families:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get family members
   */
  static async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        user:user_id (
          email,
          user_metadata
        )
      `)
      .eq('family_id', familyId)
      .order('joined_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching family members:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get user's role in a family
   */
  static async getUserFamilyRole(userId: string, familyId: string): Promise<FamilyRole | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('family_members')
      .select('role')
      .eq('user_id', userId)
      .eq('family_id', familyId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data.role as FamilyRole
  }

  /**
   * Create a family invitation
   */
  static async inviteFamilyMember(
    familyId: string, 
    email: string, 
    role: FamilyRole,
    invitedBy: string
  ): Promise<FamilyInvitation> {
    const supabase = createClient()
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', invitedBy) // This should be the user being invited, need to fix
      .single()
    
    if (existingMember) {
      throw new Error('User is already a member of this family')
    }
    
    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', email)
      .is('accepted_at', null)
      .single()
    
    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email')
    }
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry
    
    const { data, error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        invited_by: invitedBy,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating family invitation:', error)
      throw error
    }
    
    // Send invitation email (we'll implement this next)
    await this.sendInvitationEmail(data, familyId)
    
    return data
  }

  /**
   * Get pending invitations for a family
   */
  static async getFamilyInvitations(familyId: string): Promise<FamilyInvitation[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('family_invitations')
      .select(`
        *,
        invited_by_user:invited_by (
          email,
          user_metadata
        ),
        family:family_id (
          name
        )
      `)
      .eq('family_id', familyId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching family invitations:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Accept a family invitation
   */
  static async acceptInvitation(token: string): Promise<{ success: boolean; family_name?: string; role?: string; error?: string }> {
    const supabase = createClient()
    
    // Call the database function
    const { data, error } = await supabase
      .rpc('accept_family_invitation', { invitation_token: token })
    
    if (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: error.message }
    }
    
    return data
  }

  /**
   * Remove a family member
   */
  static async removeFamilyMember(familyId: string, userId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error removing family member:', error)
      throw error
    }
  }

  /**
   * Leave a family
   */
  static async leaveFamily(familyId: string, userId: string): Promise<void> {
    const supabase = createClient()
    
    // Check if user is the owner
    const role = await this.getUserFamilyRole(userId, familyId)
    if (role === 'owner') {
      throw new Error('Family owners cannot leave their family. Transfer ownership first.')
    }
    
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error leaving family:', error)
      throw error
    }
  }

  /**
   * Update family member role
   */
  static async updateMemberRole(familyId: string, userId: string, newRole: FamilyRole): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('family_members')
      .update({ 
        role: newRole,
        permissions: this.getDefaultPermissions(newRole)
      })
      .eq('family_id', familyId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error updating member role:', error)
      throw error
    }
  }

  /**
   * Update family name
   */
  static async updateFamilyName(familyId: string, name: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('family_groups')
      .update({ 
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', familyId)
    
    if (error) {
      console.error('Error updating family name:', error)
      throw error
    }
  }

  /**
   * Cancel/delete invitation
   */
  static async cancelInvitation(invitationId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('family_invitations')
      .delete()
      .eq('id', invitationId)
    
    if (error) {
      console.error('Error canceling invitation:', error)
      throw error
    }
  }

  /**
   * Check if user has permission for an action
   */
  static async hasPermission(
    userId: string, 
    familyId: string, 
    permission: keyof FamilyPermissions
  ): Promise<boolean> {
    const role = await this.getUserFamilyRole(userId, familyId)
    if (!role) return false
    
    const permissions = this.getDefaultPermissions(role)
    return permissions[permission]
  }

  /**
   * Get user's primary family (first one they own or belong to)
   */
  static async getUserPrimaryFamily(userId: string): Promise<FamilyGroup | null> {
    const families = await this.getUserFamilies(userId)
    return families.length > 0 ? families[0] : null
  }

  /**
   * Assign children to family when creating
   */
  static async assignChildToFamily(childId: string, familyId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('children')
      .update({ family_id: familyId })
      .eq('id', childId)
    
    if (error) {
      console.error('Error assigning child to family:', error)
      throw error
    }
  }

  /**
   * Send invitation email
   */
  private static async sendInvitationEmail(invitation: FamilyInvitation, familyId: string): Promise<void> {
    try {
      const supabase = createClient()
      
      // Get family details and inviter info
      const [familyResult, inviterResult] = await Promise.all([
        supabase
          .from('family_groups')
          .select('name')
          .eq('id', familyId)
          .single(),
        supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', invitation.invited_by)
          .single()
      ])

      const familyName = familyResult.data?.name || 'Your Family'
      const inviterName = inviterResult.data 
        ? `${inviterResult.data.first_name || ''} ${inviterResult.data.last_name || ''}`.trim()
        : 'A family member'

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`
      
      await EmailService.sendFamilyInvitation(
        invitation.email,
        familyName,
        inviterName || 'A family member',
        this.getRoleDisplayName(invitation.role),
        inviteUrl
      )
      
      console.log(`Family invitation email sent to ${invitation.email}`)
    } catch (error) {
      console.error('Error sending invitation email:', error)
      // Don't throw error to prevent invitation creation failure
      // Log the error but allow the invitation to be created
    }
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(role: FamilyRole): string {
    const names: Record<FamilyRole, string> = {
      owner: 'Owner ',
      partner: 'Partner ',
      caregiver: 'Caregiver',
      grandparent: 'Grandparent '
    }
    return names[role]
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: FamilyRole): string {
    const descriptions: Record<FamilyRole, string> = {
      owner: 'Full access to manage family, children, and invite members',
      partner: 'Full access to children data, can invite members',
      caregiver: 'Can view and add activities, limited editing',
      grandparent: 'Can view activities and analytics, limited adding'
    }
    return descriptions[role]
  }
}