import { createClient } from '@/lib/supabase/client'
import { ChecklistGenerator } from './checklist-generator'

export interface ChecklistItemRecord {
  id: string
  child_id: string
  title: string
  description: string
  due_date: string
  category: 'immunization' | 'registration' | 'milestone' | 'checkup'
  is_completed: boolean
  completed_date: string | null
  metadata: {
    vaccines?: string[]
    requirements?: string[]
    links?: { [state: string]: string }
    milestoneType?: string
    isOptional?: boolean
  }
  created_at: string
}

export class ChecklistService {
  private static supabase = createClient()

  /**
   * Generate and save checklist for a child
   */
  static async generateChecklistForChild(
    childId: string,
    dateOfBirth: string,
    userState?: string
  ): Promise<void> {
    const dob = new Date(dateOfBirth)
    const generatedItems = ChecklistGenerator.generateChecklist(childId, dob, userState)

    // Check if items already exist to avoid duplicates
    const { data: existingItems } = await this.supabase
      .from('checklist_items')
      .select('id')
      .eq('child_id', childId)

    const existingIds = new Set(existingItems?.map(item => item.id) || [])

    // Filter out items that already exist
    const newItems = generatedItems.filter(item => !existingIds.has(item.id))

    if (newItems.length === 0) return

    // Convert to database format
    const itemsToInsert = newItems.map(item => ({
      id: item.id,
      child_id: childId,
      title: item.title,
      description: item.description,
      due_date: item.dueDate.toISOString().split('T')[0],
      category: item.category,
      is_completed: false,
      completed_date: null,
      metadata: item.metadata
    }))

    const { error } = await this.supabase
      .from('checklist_items')
      .insert(itemsToInsert)

    if (error) {
      console.error('Error inserting checklist items:', error)
      throw error
    }
  }

  /**
   * Get checklist items for a child
   */
  static async getChecklistForChild(childId: string): Promise<ChecklistItemRecord[]> {
    const { data, error } = await this.supabase
      .from('checklist_items')
      .select('*')
      .eq('child_id', childId)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching checklist items:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get all checklist items for user's children
   */
  static async getAllChecklistItems(): Promise<ChecklistItemRecord[]> {
    const { data, error } = await this.supabase
      .from('checklist_items')
      .select(`
        *,
        children!inner(user_id)
      `)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching all checklist items:', error)
      throw error
    }

    return data || []
  }

  /**
   * Mark checklist item as completed
   */
  static async markItemCompleted(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .update({
        is_completed: true,
        completed_date: new Date().toISOString()
      })
      .eq('id', itemId)

    if (error) {
      console.error('Error marking item as completed:', error)
      throw error
    }
  }

  /**
   * Mark checklist item as incomplete
   */
  static async markItemIncomplete(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .update({
        is_completed: false,
        completed_date: null
      })
      .eq('id', itemId)

    if (error) {
      console.error('Error marking item as incomplete:', error)
      throw error
    }
  }

  /**
   * Get upcoming items (next 30 days)
   */
  static async getUpcomingItems(daysAhead: number = 30): Promise<ChecklistItemRecord[]> {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + daysAhead)

    const { data, error } = await this.supabase
      .from('checklist_items')
      .select(`
        *,
        children!inner(user_id)
      `)
      .eq('is_completed', false)
      .gte('due_date', now.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching upcoming items:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get overdue items
   */
  static async getOverdueItems(): Promise<ChecklistItemRecord[]> {
    const now = new Date()

    const { data, error } = await this.supabase
      .from('checklist_items')
      .select(`
        *,
        children!inner(user_id)
      `)
      .eq('is_completed', false)
      .lt('due_date', now.toISOString().split('T')[0])
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching overdue items:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(
    category: 'immunization' | 'registration' | 'milestone' | 'checkup'
  ): Promise<ChecklistItemRecord[]> {
    const { data, error } = await this.supabase
      .from('checklist_items')
      .select(`
        *,
        children!inner(user_id)
      `)
      .eq('category', category)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching items by category:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<{
    totalItems: number
    completedItems: number
    upcomingItems: number
    overdueItems: number
    completionPercentage: number
  }> {
    const [allItems, upcomingItems, overdueItems] = await Promise.all([
      this.getAllChecklistItems(),
      this.getUpcomingItems(),
      this.getOverdueItems()
    ])

    const completedItems = allItems.filter(item => item.is_completed).length
    const completionPercentage = allItems.length > 0 
      ? Math.round((completedItems / allItems.length) * 100)
      : 0

    return {
      totalItems: allItems.length,
      completedItems,
      upcomingItems: upcomingItems.length,
      overdueItems: overdueItems.length,
      completionPercentage
    }
  }

  /**
   * Delete all checklist items for a child (when child is deleted)
   */
  static async deleteChecklistForChild(childId: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .delete()
      .eq('child_id', childId)

    if (error) {
      console.error('Error deleting checklist items:', error)
      throw error
    }
  }
}