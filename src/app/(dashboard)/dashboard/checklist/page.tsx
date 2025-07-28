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
  FolderOpenIcon
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
  category: 'immunization' | 'registration' | 'milestone' | 'checkup';
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
          is_completed: i.is_completed 
        })))
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
      
      console.log('Generated checklist items with saved state:', transformedItems.length)
      setChecklistItems(transformedItems)
      
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
        
        // Parse suggested timing to calculate due date
        if (task.suggestedTiming.includes('week')) {
          const weeks = parseInt(task.suggestedTiming.match(/(\d+)/)?.[0] || '0')
          dueDate = new Date(birthDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
          console.log(`📅 Calculated due date (${weeks} weeks):`, dueDate)
        } else if (task.suggestedTiming.includes('month')) {
          const months = parseInt(task.suggestedTiming.match(/(\d+)/)?.[0] || '0')
          dueDate = new Date(birthDate.getFullYear(), birthDate.getMonth() + months, birthDate.getDate())
          console.log(`📅 Calculated due date (${months} months):`, dueDate)
        } else if (task.suggestedTiming.includes('day')) {
          const days = parseInt(task.suggestedTiming.match(/(\d+)/)?.[0] || '0')
          dueDate = new Date(birthDate.getTime() + days * 24 * 60 * 60 * 1000)
          console.log(`📅 Calculated due date (${days} days):`, dueDate)
        }
        
        // If due date is in the past, set it to current date
        if (dueDate < currentDate) {
          console.log('⚠️ Due date in past, setting to current date')
          dueDate = currentDate
        }
        
        const itemToAdd = {
          child_id: selectedChild.id,
          title: task.title,
          description: task.notes || `${task.type} - ${task.suggestedTiming}`,
          due_date: dueDate.toISOString().split('T')[0],
          category: 'milestone' as const, // Use milestone category for optional tasks
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Timeline</h1>
          
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

          {/* Add Optional Tasks Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowOptionalTasks(!showOptionalTasks)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
            >
              <SparklesIcon className="w-5 h-5" />
              {showOptionalTasks ? 'Close Optional Tasks' : 'Add Optional Tasks'}
            </button>
          </div>
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
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {item.isCompleted ? (
                            <CheckCircleSolid className="w-6 h-6 text-green-600" />
                          ) : (
                            <div className={`w-6 h-6 border-2 rounded-full ${
                              isOverdue ? 'border-red-400' : 'border-gray-300'
                            }`}></div>
                          )}
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
    </div>
  )
}