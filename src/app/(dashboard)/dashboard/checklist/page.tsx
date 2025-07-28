'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
import { getMilestoneForWeek, getUpcomingMilestones } from '@/lib/data/milestone-bubbles'
import { 
  optionalAdminChecklist, 
  optionalAdminCategories, 
  getTasksByCategory as getOptionalTasksByCategory,
  OptionalAdminTask,
  OptionalAdminCategory 
} from '@/lib/data/optional-admin-checklist'
import { TimelineCalendar } from '@/components/features/TimelineCalendar'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  CalendarDaysIcon,
  BeakerIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronDownIcon,
  ListBulletIcon,
  CalendarIcon,
  FolderOpenIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface ChecklistItem {
  id: string;
  child_id: string;
  title: string;
  description: string;
  due_date: string;
  category: 'immunization' | 'registration' | 'milestone' | 'checkup' | 'appointment';
  is_completed: boolean;
  completed_date: string | null;
  metadata: any;
}

export default function ChecklistPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [userState, setUserState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showOptionalTasks, setShowOptionalTasks] = useState(false)
  const [selectedOptionalCategory, setSelectedOptionalCategory] = useState<OptionalAdminCategory | null>(null)
  const [selectedOptionalTasks, setSelectedOptionalTasks] = useState<string[]>([])
  const [showAddCustomTask, setShowAddCustomTask] = useState(false)
  const [customTaskData, setCustomTaskData] = useState({
    title: '',
    description: '',
    category: 'milestone' as const,
    dueDate: ''
  })
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const supabase = createClient()

  // Debug: Test checklist data import
  console.log('Checklist data import test:', {
    australianChecklistItemsLength: australianChecklistItems.length,
    sampleItems: australianChecklistItems.slice(0, 3).map(i => ({ id: i.id, title: i.title })),
    getChecklistForChildFunction: typeof getChecklistForChild,
    calculateDueDateFunction: typeof calculateDueDate
  })

  useEffect(() => {
    loadData()
    // Debug: Check database schema
    verifyDatabaseSchema()
  }, [])

  const verifyDatabaseSchema = async () => {
    try {
      console.log('🔍 Checking database schema...')
      
      // Try to describe the checklist_items table
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .limit(0) // Just get structure, no data
      
      if (error) {
        console.error('❌ Database schema error:', error)
        console.log('❌ Error code:', error.code)
        console.log('❌ Error message:', error.message)
        
        if (error.code === 'PGRST106') {
          console.log('💡 Table does not exist - need to run database migration')
        } else if (error.code === 'PGRST204') {
          console.log('💡 Column missing - need to update table schema')
        }
      } else {
        console.log('✅ checklist_items table accessible')
      }
      
      // Also check if children table exists
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .limit(1)
        
      if (childrenError) {
        console.error('❌ Children table error:', childrenError)
      } else {
        console.log('✅ children table accessible')
      }
      
    } catch (error) {
      console.error('❌ Schema verification failed:', error)
    }
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user profile for state information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('state_territory')
        .eq('id', user.id)
        .single()
      
      if (profileData?.state_territory) {
        setUserState(profileData.state_territory)
      }

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: true })

      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData)
        setSelectedChild(childrenData[0])
        await loadChecklistForChild(childrenData[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to identify optional tasks by title
  const isOptionalTaskTitle = (title: string) => {
    const optionalTitles = [
      'Add baby to private health insurance',
      'Book baby chiropractor',
      'Book a lactation consultant',
      'Track milk supply',
      'Book baby massage',
      'Join mothers group',
      'Research childcare options'
    ]
    return optionalTitles.some(optTitle => 
      title.toLowerCase().includes(optTitle.toLowerCase())
    )
  }

  const loadChecklistForChild = async (childId: string) => {
    try {
      console.log('🔄 Loading checklist for child:', childId)
      
      // First, try to load existing saved items from database
      const { data: savedItems, error: savedError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('child_id', childId)
        .order('due_date', { ascending: true })

      if (savedError) {
        console.error('❌ Error loading saved checklist items:', savedError)
        console.log('❌ Database error details:', {
          message: savedError.message,
          details: savedError.details,
          hint: savedError.hint,
          code: savedError.code
        })
      }

      console.log('💾 Found saved items in database:', savedItems?.length || 0)
      if (savedItems && savedItems.length > 0) {
        console.log('💾 Sample saved items:', savedItems.slice(0, 3).map(i => ({ 
          id: i.id, 
          title: i.title, 
          category: i.category,
          is_completed: i.is_completed,
          metadata: i.metadata 
        })))
        
        // Check for optional tasks specifically
        const optionalTasks = savedItems.filter(item => 
          item.metadata?.source === 'optional_admin_checklist'
        )
        console.log('🌟 Optional tasks in database:', optionalTasks.length)
        if (optionalTasks.length > 0) {
          console.log('🌟 Optional tasks found:', optionalTasks.map(t => ({ 
            title: t.title, 
            category: t.category,
            metadata: t.metadata 
          })))
        }
      }

      // Get child data - if not in state, fetch from database
      let child = children.find(c => c.id === childId)
      
      if (!child) {
        console.log('Child not found in state, fetching from database...')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: childData } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .eq('user_id', user.id)
          .single()
        
        if (!childData) {
          console.error('Child not found in database:', childId)
          return
        }
        
        child = childData
      }
      
      console.log('Found child:', child.name, 'DOB:', child.date_of_birth)
      
      // Generate checklist items using the working method
      const birthDate = new Date(child.date_of_birth)
      const checklistData = getChecklistForChild(birthDate)
      
      // Transform to the format expected by the UI, preserving saved completion state
      const transformedItems = checklistData.map(item => {
        const dueDate = calculateDueDate(birthDate, item)
        const itemId = `${childId}-${item.id}` // Keep for UI consistency
        
        // Check if this item was previously saved (match by title and category)
        const savedItem = savedItems?.find(saved => 
          saved.title === item.title && saved.category === item.category
        )
        
        return {
          id: itemId,
          child_id: childId,
          title: item.title,
          description: item.description,
          due_date: dueDate.toISOString().split('T')[0],
          category: item.category,
          is_completed: savedItem?.is_completed || false,
          completed_date: savedItem?.completed_date || null,
          metadata: savedItem?.metadata || {}
        }
      })
      
      // IMPORTANT: Add any saved items that aren't in the default checklist (like optional tasks)
      const additionalSavedItems = savedItems?.filter(saved => {
        // Find items that don't match any default checklist item
        return !checklistData.some(defaultItem => 
          defaultItem.title === saved.title && defaultItem.category === saved.category
        )
      }) || []
      
      console.log('📋 Additional saved items (optional tasks, etc.):', additionalSavedItems.length)
      if (additionalSavedItems.length > 0) {
        console.log('📋 Additional items:', additionalSavedItems.map(i => ({ 
          title: i.title, 
          category: i.category,
          source: i.metadata?.source 
        })))
      }
      
      // Add additional saved items to the list
      const additionalItems = additionalSavedItems.map(saved => {
        // Fix metadata for optional tasks that might not have proper metadata
        let metadata = saved.metadata || {}
        if (!metadata.source && isOptionalTaskTitle(saved.title)) {
          metadata = { ...metadata, source: 'optional_admin_checklist' }
        }
        
        return {
          id: saved.id, // Use the actual database ID for deletion to work
          child_id: saved.child_id,
          title: saved.title,
          description: saved.description,
          due_date: saved.due_date,
          category: saved.category,
          is_completed: saved.is_completed,
          completed_date: saved.completed_date,
          metadata: metadata,
          _isSaved: true // Internal flag to identify saved items
        }
      })
      
      // Combine default checklist items with additional saved items
      const allItems = [...transformedItems, ...additionalItems]
      
      console.log('📋 Total checklist items (default + additional):', allItems.length)
      console.log('📋 Default items:', transformedItems.length)
      console.log('📋 Additional items:', additionalItems.length)
      
      // Check for duplicates
      const titleCounts = new Map<string, number>()
      allItems.forEach(item => {
        const key = `${item.title}-${item.due_date}`
        titleCounts.set(key, (titleCounts.get(key) || 0) + 1)
      })
      const duplicateCount = Array.from(titleCounts.values()).filter(count => count > 1).length
      setHasDuplicates(duplicateCount > 0)
      if (duplicateCount > 0) {
        console.log('⚠️ Found duplicate items:', duplicateCount)
      }
      
      setChecklistItems(allItems)
      
      // Auto-expand current week
      const currentWeek = getCurrentWeek(birthDate)
      setExpandedWeeks([`week-${currentWeek}`])
      
    } catch (error) {
      console.error('Error loading checklist:', error)
    }
  }

  const toggleItemCompletion = async (itemId: string) => {
    console.log('🔄 toggleItemCompletion called with itemId:', itemId)
    
    if (!selectedChild) {
      console.error('❌ No selected child')
      return
    }

    const item = checklistItems.find(item => item.id === itemId)
    if (!item) {
      console.error('❌ Item not found in checklistItems:', itemId)
      console.log('Available items:', checklistItems.map(i => ({ id: i.id, title: i.title })))
      return
    }

    console.log('📝 Item found:', { 
      id: item.id, 
      title: item.title, 
      currentState: item.is_completed,
      child_id: item.child_id 
    })

    try {
      const newCompletedState = !item.is_completed
      const now = new Date().toISOString()
      
      console.log('🔍 Checking if item exists in database...')
      
      // Check if this item already exists in database
      const { data: existingItem, error: selectError } = await supabase
        .from('checklist_items')
        .select('id')
        .eq('child_id', item.child_id)
        .eq('title', item.title)
        .eq('category', item.category)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Error checking existing item:', selectError)
        throw selectError
      }

      console.log('🔍 Existing item check result:', { existingItem, selectError })

      let error
      if (existingItem) {
        console.log('✏️ Updating existing item:', existingItem.id)
        // Update existing item
        const updateResult = await supabase
          .from('checklist_items')
          .update({
            is_completed: newCompletedState,
            completed_date: newCompletedState ? now : null
          })
          .eq('id', existingItem.id)
          
        error = updateResult.error
        console.log('✏️ Update result:', { error, newCompletedState })
      } else {
        console.log('➕ Inserting new item')
        // Insert new item (let database generate UUID)
        const insertData = {
          child_id: item.child_id,
          title: item.title,
          description: item.description,
          due_date: item.due_date,
          category: item.category,
          is_completed: newCompletedState,
          completed_date: newCompletedState ? now : null,
          metadata: item.metadata || {}
        }
        
        console.log('➕ Insert data:', insertData)
        
        const insertResult = await supabase
          .from('checklist_items')
          .insert(insertData)
          
        error = insertResult.error
        console.log('➕ Insert result:', { error, insertedData: insertResult.data })
      }

      if (error) {
        console.error('❌ Database operation failed:', error)
        alert(`Failed to save item: ${error.message}`)
        return
      }

      console.log('✅ Database operation successful, updating UI')

      // Update local state
      setChecklistItems(prev => prev.map(prevItem => 
        prevItem.id === itemId 
          ? { 
              ...prevItem, 
              is_completed: newCompletedState, 
              completed_date: newCompletedState ? now : null 
            }
          : prevItem
      ))

      console.log('✅ UI updated successfully')

    } catch (error) {
      console.error('❌ Unexpected error in toggleItemCompletion:', error)
      alert(`Unexpected error: ${error.message}`)
    }
  }

  const deleteItem = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent toggling completion
    
    console.log('🚀 DELETE ITEM CALLED - Starting debug trace')
    console.log('🔍 Item ID:', itemId)
    console.log('🔍 Selected Child:', selectedChild?.id, selectedChild?.name)
    console.log('🔍 All checklist items:', checklistItems.map(i => ({ 
      id: i.id, 
      title: i.title, 
      source: i.metadata?.source 
    })))
    
    if (!selectedChild) {
      console.error('❌ No selected child')
      alert('Error: No child selected')
      return
    }
    
    const item = checklistItems.find(item => item.id === itemId)
    if (!item) {
      console.error('❌ Item not found for ID:', itemId)
      console.log('❌ Available item IDs:', checklistItems.map(i => i.id))
      alert(`Error: Item not found (ID: ${itemId})`)
      return
    }
    
    console.log('📋 Found item:', {
      id: item.id,
      title: item.title,
      metadata: item.metadata
    })
    
    // Check if this is a deletable item (optional or custom task)
    const isDeletable = item.metadata?.source === 'optional_admin_checklist' || 
                       item.metadata?.source === 'custom' ||
                       isOptionalTaskTitle(item.title)
    
    console.log('🔍 Is deletable?', isDeletable, 'Source:', item.metadata?.source)
    
    if (!isDeletable) {
      console.log('❌ Item not deletable - showing alert')
      alert('Default checklist items cannot be deleted. Only optional tasks and custom items can be deleted.')
      return
    }
    
    console.log('✅ Item is deletable, showing confirmation')
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      console.log('❌ User cancelled deletion')
      return
    }
    
    console.log('✅ User confirmed deletion, proceeding...')
    
    try {
      console.log('🗑️ Deleting item:', item.id, item.title)
      
      // Use the item's ID directly (no prefix conversion needed anymore)
      const databaseId = item.id
      console.log('📋 Using database ID:', databaseId)
      
      // Delete by the exact ID
      let { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', databaseId)
        .eq('child_id', selectedChild.id) // Extra safety check
      
      // If that fails and we couldn't find by ID, try to find by title and category
      if (error && error.code === 'PGRST116') {
        console.log('🔍 Item not found by ID, trying to find by title and category...')
        
        const { error: deleteError } = await supabase
          .from('checklist_items')
          .delete()
          .eq('child_id', selectedChild.id)
          .eq('title', item.title)
          .eq('category', item.category)
        
        error = deleteError
      }
      
      if (error) {
        console.error('❌ Failed to delete item:', error)
        alert(`Failed to delete item: ${error.message}`)
        return
      }
      
      console.log('✅ Item deleted successfully')
      
      // Update local state
      setChecklistItems(prev => prev.filter(prevItem => prevItem.id !== itemId))
      
    } catch (error) {
      console.error('❌ Unexpected error deleting item:', error)
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(w => w !== weekId)
        : [...prev, weekId]
    )
  }

  const toggleOptionalTaskSelection = (taskId: string) => {
    setSelectedOptionalTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const addSelectedOptionalTasks = async () => {
    console.log('🌟 addSelectedOptionalTasks called')
    console.log('Selected child:', selectedChild?.id, selectedChild?.name)
    console.log('Selected tasks:', selectedOptionalTasks)
    
    if (!selectedChild || selectedOptionalTasks.length === 0) {
      console.error('❌ No selected child or no tasks selected')
      return
    }
    
    try {
      const birthDate = new Date(selectedChild.date_of_birth)
      const currentDate = new Date()
      
      console.log('📅 Birth date:', birthDate)
      console.log('📅 Current date:', currentDate)
      
      // Prepare checklist items from selected optional tasks
      const checklistItemsToAdd = selectedOptionalTasks.map(taskId => {
        const task = optionalAdminChecklist.find(t => t.id === taskId)
        if (!task) {
          console.error('❌ Task not found:', taskId)
          return null
        }
        
        console.log('📝 Processing task:', task.title)
        
        // Calculate due date based on suggested timing
        let dueDate = new Date(currentDate)
        
        // Parse suggested timing to calculate due date based on baby's age
        const timingLower = task.suggestedTiming.toLowerCase()
        console.log(`🔍 Parsing timing: "${task.suggestedTiming}"`)
        
        if (timingLower.includes('day')) {
          // "Within 30 days of birth", "7 days", etc.
          const days = parseInt(task.suggestedTiming.match(/(\d+)/)?.[0] || '30')
          dueDate = new Date(birthDate.getTime() + days * 24 * 60 * 60 * 1000)
          console.log(`📅 Calculated due date (${days} days from birth):`, dueDate)
        } else if (timingLower.includes('week')) {
          // "6-8 weeks", "2-6 weeks", "12 weeks", etc.
          const weekMatches = task.suggestedTiming.match(/(\d+)(?:-(\d+))?\s*week/i)
          let weeks = 4 // default
          if (weekMatches) {
            if (weekMatches[2]) {
              // Range like "6-8 weeks" - take the lower number for earlier intervention
              weeks = parseInt(weekMatches[1])
            } else {
              // Single number like "6 weeks"
              weeks = parseInt(weekMatches[1])
            }
          }
          dueDate = new Date(birthDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
          console.log(`📅 Calculated due date (${weeks} weeks from birth):`, dueDate)
        } else if (timingLower.includes('month')) {
          // "6 months", "3-6 months", "6 months or first tooth", etc.
          const monthMatches = task.suggestedTiming.match(/(\d+)(?:-(\d+))?\s*month/i)
          let months = 3 // default
          if (monthMatches) {
            if (monthMatches[2]) {
              // Range like "3-6 months" - take the lower number
              months = parseInt(monthMatches[1])
            } else {
              // Single number like "6 months"
              months = parseInt(monthMatches[1])
            }
          }
          dueDate = new Date(birthDate.getFullYear(), birthDate.getMonth() + months, birthDate.getDate())
          console.log(`📅 Calculated due date (${months} months from birth):`, dueDate)
        } else if (timingLower.includes('year')) {
          // "1 year", "first year", etc.
          const years = parseInt(task.suggestedTiming.match(/(\d+)/)?.[0] || '1')
          dueDate = new Date(birthDate.getFullYear() + years, birthDate.getMonth(), birthDate.getDate())
          console.log(`📅 Calculated due date (${years} years from birth):`, dueDate)
        } else {
          // Handle special cases
          if (timingLower.includes('birth') || timingLower.includes('soon') || timingLower.includes('immediately')) {
            // Set to first week
            dueDate = new Date(birthDate.getTime() + 1 * 7 * 24 * 60 * 60 * 1000)
            console.log(`📅 Calculated due date (immediately/at birth):`, dueDate)
          } else if (timingLower.includes('first') || timingLower.includes('early')) {
            // Set to first month
            dueDate = new Date(birthDate.getTime() + 4 * 7 * 24 * 60 * 60 * 1000)
            console.log(`📅 Calculated due date (first/early):`, dueDate)
          } else {
            // Default to 8 weeks for unknown timings
            dueDate = new Date(birthDate.getTime() + 8 * 7 * 24 * 60 * 60 * 1000)
            console.log(`📅 Default due date (8 weeks):`, dueDate)
          }
        }
        
        // For new parents: Don't move past due dates to current date, keep them in their original week
        // This preserves the timeline structure for new parents browsing tasks
        console.log(`📅 Final due date for "${task.title}":`, dueDate)
        
        // Calculate week number for proper timeline placement
        const weekNumber = Math.max(1, Math.ceil((dueDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)))
        console.log(`📅 Will appear in week ${weekNumber}`)
        
        const itemToAdd = {
          child_id: selectedChild.id,
          title: task.title,
          description: task.notes || `${task.type} - ${task.suggestedTiming}`,
          due_date: dueDate.toISOString().split('T')[0],
          category: 'milestone' as const, // Use milestone category for optional tasks
          week_number: weekNumber, // Ensure proper week placement
          is_completed: false,
          completed_date: null,
          metadata: {
            source: 'optional_admin_checklist',
            original_category: task.category,
            task_type: task.type,
            suggested_timing: task.suggestedTiming,
            link: task.link,
            optional_task_id: task.id // Store original task ID for reference
          }
        }
        
        console.log('📝 Item to add:', itemToAdd)
        return itemToAdd
      }).filter(Boolean)
      
      if (checklistItemsToAdd.length === 0) {
        console.error('❌ No valid items to add')
        return
      }
      
      console.log(`➕ Inserting ${checklistItemsToAdd.length} items into database...`)
      
      // Insert into database
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(checklistItemsToAdd)
        .select()
      
      if (error) {
        console.error('❌ Database insert error:', error)
        console.log('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('✅ Insert successful:', data)
      console.log(`✅ Added ${checklistItemsToAdd.length} optional tasks to timeline`)
      
      // Reload checklist to show new items
      console.log('🔄 Reloading checklist...')
      await loadChecklistForChild(selectedChild.id)
      
      // Reset state
      setSelectedOptionalTasks([])
      setShowOptionalTasks(false)
      setSelectedOptionalCategory(null)
      
      // Show success message
      alert(`✅ Successfully added ${checklistItemsToAdd.length} optional tasks to your timeline!`)
      
    } catch (error) {
      console.error('❌ Unexpected error adding optional tasks:', error)
      console.log('❌ Full error object:', error)
      alert(`Failed to add tasks: ${error.message || 'Unknown error'}`)
    }
  }

  const cleanupDuplicates = async () => {
    if (!selectedChild) return
    
    console.log('🧹 Starting duplicate cleanup...')
    
    try {
      const response = await fetch('/api/fix-duplicates')
      const result = await response.json()
      
      if (result.success) {
        alert(`Cleaned up ${result.duplicatesRemoved} duplicate items!`)
        await loadChecklistForChild(selectedChild.id)
      } else {
        alert(`Cleanup failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error)
      alert('Failed to clean up duplicates')
    }
  }

  const addCustomTask = async () => {
    console.log('➕ Adding custom task:', customTaskData)
    
    if (!selectedChild || !customTaskData.title || !customTaskData.dueDate) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      const customItem = {
        child_id: selectedChild.id,
        title: customTaskData.title,
        description: customTaskData.description || '',
        due_date: customTaskData.dueDate,
        category: customTaskData.category,
        is_completed: false,
        completed_date: null,
        metadata: {
          source: 'custom',
          created_by_user: true,
          created_at: new Date().toISOString()
        }
      }
      
      console.log('📝 Custom item to add:', customItem)
      
      // Insert into database
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(customItem)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Failed to add custom task:', error)
        alert(`Failed to add custom task: ${error.message}`)
        return
      }
      
      console.log('✅ Custom task added successfully:', data)
      
      // Reload checklist
      await loadChecklistForChild(selectedChild.id)
      
      // Reset form and close modal
      setCustomTaskData({
        title: '',
        description: '',
        category: 'milestone',
        dueDate: ''
      })
      setShowAddCustomTask(false)
      
      alert('Custom task added successfully!')
      
    } catch (error) {
      console.error('❌ Unexpected error adding custom task:', error)
      alert('Failed to add custom task. Please try again.')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immunization':
        return BeakerIcon
      case 'registration':
        return UserGroupIcon
      case 'milestone':
        return SparklesIcon
      case 'checkup':
        return CalendarDaysIcon
      case 'appointment':
        return ClockIcon
      default:
        return InformationCircleIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immunization':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'registration':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'milestone':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'checkup':
        return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'appointment':
        return 'bg-pink-50 text-pink-600 border-pink-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getWeekNumber = (birthDate: Date, targetDate: Date) => {
    const diffTime = targetDate.getTime() - birthDate.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(0, diffWeeks)
  }

  const getCurrentWeek = (birthDate: Date) => {
    return getWeekNumber(birthDate, new Date())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checklist</h1>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Children Added</h2>
            <p className="text-sm text-gray-600 mb-6">Add your child to see their personalised Australian immunisation and milestone checklist</p>
            <a href="/dashboard/children" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Your First Child
            </a>
          </div>
        </div>
      </div>
    )
  }

  const birthDate = selectedChild ? new Date(selectedChild.date_of_birth) : new Date()

  // Group items by week
  const weeklyItems = checklistItems.reduce((acc, item) => {
    const dueDate = new Date(item.due_date)
    const weekNumber = getWeekNumber(birthDate, dueDate)
    const weekKey = `week-${weekNumber}`
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        weekNumber,
        startDate: new Date(birthDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(birthDate.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000),
        items: []
      }
    }
    
    acc[weekKey].items.push({ 
      ...item, 
      isCompleted: item.is_completed, 
      dueDate: dueDate 
    })
    
    return acc
  }, {} as any)

  // Convert to sorted array
  const sortedWeeks = Object.values(weeklyItems)
    .sort((a: any, b: any) => a.weekNumber - b.weekNumber)
    .slice(0, 52) // First year only

  // Calculate stats
  const totalItems = checklistItems.length
  const completedCount = checklistItems.filter(item => item.is_completed).length
  const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
  const currentWeek = getCurrentWeek(birthDate)
  
  // Debug logging
  console.log('Render stats:', { 
    totalItems, 
    completedCount, 
    completionRate, 
    currentWeek, 
    checklistItemsLength: checklistItems.length,
    selectedChildName: selectedChild?.name,
    sortedWeeksLength: Object.values(weeklyItems).length
  })
  
  // Debug button visibility (keeping for troubleshooting)
  console.log('🔍 BUTTON DEBUG:', {
    hasChildren: children.length > 0,
    selectedChild: selectedChild?.name,
    isLoading,
    showAddCustomTask,
    showOptionalTasks
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Timeline <span className="text-xs text-gray-500">v3</span></h1>
            <button
              onClick={() => setShowAddCustomTask(true)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              + Add
            </button>
          </div>
          
          
          {/* Child Selector */}
          {children.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={async () => {
                    setSelectedChild(child)
                    await loadChecklistForChild(child.id)
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}

          {/* State Indicator */}
          {userState && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Australian timeline for</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {userState === 'NSW' ? 'New South Wales' :
                 userState === 'VIC' ? 'Victoria' :
                 userState === 'QLD' ? 'Queensland' :
                 userState === 'WA' ? 'Western Australia' :
                 userState === 'SA' ? 'South Australia' :
                 userState === 'TAS' ? 'Tasmania' :
                 userState === 'ACT' ? 'Australian Capital Territory' :
                 userState === 'NT' ? 'Northern Territory' : userState}
              </span>
            </div>
          )}

          {/* View Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {completedCount} of {totalItems} completed
              </div>
              <div className="text-lg font-semibold text-green-600">
                {completionRate}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowAddCustomTask(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Your Own
            </button>
            
            <button
              onClick={() => setShowOptionalTasks(!showOptionalTasks)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              {showOptionalTasks ? 'Close' : 'Add'} Optional
            </button>
          </div>
          
          {/* Duplicate Warning */}
          {hasDuplicates && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">Duplicate items found</span>
                </div>
                <button
                  onClick={cleanupDuplicates}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                >
                  Clean up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Optional Tasks Modal */}
        {showOptionalTasks && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 border border-blue-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optional Tasks for {selectedChild?.name}</h3>
                <p className="text-sm text-gray-600">Choose extra tasks to add to your timeline</p>
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {optionalAdminCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedOptionalCategory(
                    selectedOptionalCategory === category ? null : category
                  )}
                  className={`p-3 rounded-xl text-xs font-medium transition-colors text-left ${
                    selectedOptionalCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <FolderOpenIcon className="w-4 h-4 mb-1" />
                  {category}
                </button>
              ))}
            </div>
            
            {/* Selected Category Tasks */}
            {selectedOptionalCategory && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">{selectedOptionalCategory}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getOptionalTasksByCategory(selectedOptionalCategory).map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedOptionalTasks.includes(task.id)}
                        onChange={() => toggleOptionalTaskSelection(task.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          📅 {task.suggestedTiming} • {task.type}
                        </div>
                        {task.notes && (
                          <div className="text-xs text-gray-500 mt-1">{task.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Selected Tasks Button */}
            {selectedOptionalTasks.length > 0 && (
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                <div>
                  <span className="font-medium text-gray-900">
                    {selectedOptionalTasks.length} task{selectedOptionalTasks.length !== 1 ? 's' : ''} selected
                  </span>
                  <p className="text-sm text-gray-600">Will be added to your timeline</p>
                </div>
                <button
                  onClick={addSelectedOptionalTasks}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Add to Timeline
                </button>
              </div>
            )}
          </div>
        )}
        {viewMode === 'calendar' ? (
          <TimelineCalendar
            checklistItems={checklistItems}
            birthDate={birthDate}
            onItemClick={toggleItemCompletion}
            onItemDelete={deleteItem}
            selectedChild={selectedChild}
          />
        ) : (
          <>
            {/* Current Week Highlight */}
            <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-4 border border-pink-200 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">📅 Week {currentWeek}</h3>
              <p className="text-sm text-gray-700">
                {selectedChild?.name} is {currentWeek} week{currentWeek !== 1 ? 's' : ''} old
              </p>
            </div>

        {/* What to Expect - Milestone Bubble */}
        {(() => {
          const currentMilestone = getMilestoneForWeek(currentWeek);
          const upcomingMilestones = getUpcomingMilestones(currentWeek, 3);
          
          if (!currentMilestone && upcomingMilestones.length === 0) return null;
          
          const milestoneToShow = currentMilestone || upcomingMilestones[0];
          const isUpcoming = !currentMilestone;
          
          return (
            <div className={`rounded-2xl p-4 border mb-6 ${
              isUpcoming 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{milestoneToShow.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {isUpcoming ? 'Coming Up' : 'What to Expect'}: {milestoneToShow.title}
                    </h3>
                    {isUpcoming && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Week {milestoneToShow.weekNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{milestoneToShow.description}</p>
                  <p className="text-xs text-gray-600 italic">💝 {milestoneToShow.encouragement}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Weekly Timeline */}
        {sortedWeeks.map((week: any) => {
          const weekKey = `week-${week.weekNumber}`
          const isCurrentWeek = week.weekNumber === currentWeek
          const isPastWeek = week.weekNumber < currentWeek
          const completedInWeek = week.items.filter((item: any) => item.isCompleted).length
          const totalInWeek = week.items.length
          const weekMilestone = getMilestoneForWeek(week.weekNumber)
          
          if (totalInWeek === 0 && !weekMilestone) return null
          
          return (
            <div 
              key={weekKey} 
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                isCurrentWeek 
                  ? 'border-pink-300 shadow-md' 
                  : isPastWeek
                    ? 'border-green-200'
                    : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => toggleWeek(weekKey)}
                className={`w-full px-4 py-4 flex items-center justify-between text-left transition-all ${
                  isCurrentWeek 
                    ? 'bg-gradient-to-r from-pink-50 to-orange-50' 
                    : isPastWeek && completedInWeek === totalInWeek
                      ? 'bg-green-50'
                      : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCurrentWeek 
                      ? 'bg-pink-600 text-white' 
                      : isPastWeek && completedInWeek === totalInWeek
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {week.weekNumber}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Week {week.weekNumber}
                      {isCurrentWeek && <span className="ml-2 text-pink-600">• Current</span>}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {week.startDate.toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })} - {week.endDate.toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {completedInWeek}/{totalInWeek}
                    </div>
                    <div className={`w-16 h-1.5 rounded-full ${
                      isPastWeek && completedInWeek === totalInWeek 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCurrentWeek ? 'bg-pink-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${totalInWeek > 0 ? (completedInWeek / totalInWeek) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedWeeks.includes(weekKey) ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              
              {expandedWeeks.includes(weekKey) && (
                <div className="p-4 space-y-3 bg-gray-50">
                  {/* Milestone Information */}
                  {weekMilestone && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{weekMilestone.emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 mb-1">
                            Development Milestone: {weekMilestone.title}
                          </h4>
                          <p className="text-sm text-purple-700 mb-2">{weekMilestone.description}</p>
                          <p className="text-xs text-purple-600 italic">💝 {weekMilestone.encouragement}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {week.items.map((item: any) => {
                    const Icon = getCategoryIcon(item.category)
                    const now = new Date()
                    const daysPastDue = Math.floor((now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysPastDue > 0 && !item.isCompleted
                    
                    const isDeletable = item.metadata?.source === 'optional_admin_checklist' || 
                                       item.metadata?.source === 'custom' ||
                                       isOptionalTaskTitle(item.title)
                    
                    // Debug: Log all items to see which ones should be deletable
                    if (item.metadata?.source || item.title.toLowerCase().includes('optional')) {
                      console.log('🔍 OPTIONAL/CUSTOM ITEM FOUND:', {
                        id: item.id,
                        title: item.title,
                        metadata: item.metadata,
                        isDeletable,
                        source: item.metadata?.source,
                        hasMetadata: !!item.metadata
                      })
                    }
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemCompletion(item.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          item.isCompleted 
                            ? 'bg-white border-green-200 opacity-75' 
                            : isOverdue
                              ? 'bg-red-50 border-red-200 hover:bg-red-100'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border ${getCategoryColor(item.category)} ${
                          item.isCompleted ? 'opacity-50' : ''
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 ${
                            item.isCompleted ? 'line-through' : ''
                          }`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className={`text-xs font-medium ${
                              isOverdue 
                                ? 'text-red-600' 
                                : item.isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                            }`}>
                              {item.isCompleted ? 'Completed' : 
                               isOverdue ? `${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue` :
                               `Due: ${item.dueDate.toLocaleDateString('en-AU', { 
                                 day: 'numeric', 
                                 month: 'short' 
                               })}`}
                            </p>
                            {isDeletable && (
                              <span className="text-xs text-purple-600 font-medium">• Optional/Custom</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDeletable && (
                            <button
                              onClick={(e) => deleteItem(item.id, e)}
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200 text-red-600 transition-colors"
                              title="Delete optional/custom task"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                          <div className="flex-shrink-0">
                            {item.isCompleted ? (
                              <CheckCircleSolid className="w-6 h-6 text-green-600" />
                            ) : (
                              <div className={`w-6 h-6 border-2 rounded-full ${
                                isOverdue ? 'border-red-400' : 'border-gray-300'
                              }`}></div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        
            {sortedWeeks.length === 0 && (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No timeline items found for {selectedChild?.name}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Task Modal */}
      {showAddCustomTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Custom Task</h3>
              <button
                onClick={() => {
                  setShowAddCustomTask(false)
                  setCustomTaskData({
                    title: '',
                    description: '',
                    category: 'milestone',
                    dueDate: ''
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={customTaskData.title}
                  onChange={(e) => setCustomTaskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., First swimming lesson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={customTaskData.description}
                  onChange={(e) => setCustomTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description or notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={customTaskData.category}
                  onChange={(e) => setCustomTaskData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="milestone">Milestone</option>
                  <option value="immunization">Immunisation</option>
                  <option value="registration">Registration</option>
                  <option value="checkup">Check-up</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={customTaskData.dueDate}
                  onChange={(e) => setCustomTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddCustomTask(false)
                  setCustomTaskData({
                    title: '',
                    description: '',
                    category: 'milestone',
                    dueDate: ''
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomTask}
                disabled={!customTaskData.title || !customTaskData.dueDate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}