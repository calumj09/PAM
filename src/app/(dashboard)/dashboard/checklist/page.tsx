'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
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
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface CompletedItem {
  id: string;
  child_id: string;
  checklist_item_id: string;
  completed_at: string;
}

export default function ChecklistPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['due', 'upcoming'])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: true })

      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData)
        setSelectedChild(childrenData[0])
        
        // Load completed items
        const { data: completedData } = await supabase
          .from('checklist_completions')
          .select('*')
          .in('child_id', childrenData.map(c => c.id))

        setCompletedItems(completedData || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemCompletion = async (itemId: string) => {
    if (!selectedChild) return

    const existingCompletion = completedItems.find(
      ci => ci.child_id === selectedChild.id && ci.checklist_item_id === itemId
    )

    if (existingCompletion) {
      // Remove completion
      await supabase
        .from('checklist_completions')
        .delete()
        .eq('id', existingCompletion.id)

      setCompletedItems(prev => prev.filter(ci => ci.id !== existingCompletion.id))
    } else {
      // Add completion
      const { data } = await supabase
        .from('checklist_completions')
        .insert({
          child_id: selectedChild.id,
          checklist_item_id: itemId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (data) {
        setCompletedItems(prev => [...prev, data])
      }
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
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

  const getItemStatus = (item: any, birthDate: Date) => {
    const dueDate = calculateDueDate(birthDate, item)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < -30) return 'overdue'
    if (daysUntilDue < 0) return 'due'
    if (daysUntilDue <= 7) return 'upcoming'
    return 'future'
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
            <p className="text-sm text-gray-600 mb-6">Add your child to see their personalized Australian immunization and milestone checklist</p>
            <a href="/dashboard/children" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Your First Child
            </a>
          </div>
        </div>
      </div>
    )
  }

  const checklistItems = selectedChild ? getChecklistForChild(new Date(selectedChild.date_of_birth)) : []
  const birthDate = selectedChild ? new Date(selectedChild.date_of_birth) : new Date()

  // Group items by status
  const groupedItems = checklistItems.reduce((acc, item) => {
    const isCompleted = completedItems.some(
      ci => ci.child_id === selectedChild?.id && ci.checklist_item_id === item.id
    )
    
    if (isCompleted) {
      acc.completed.push(item)
    } else {
      const status = getItemStatus(item, birthDate)
      if (status === 'overdue' || status === 'due') {
        acc.due.push(item)
      } else if (status === 'upcoming') {
        acc.upcoming.push(item)
      } else {
        acc.future.push(item)
      }
    }
    
    return acc
  }, { due: [], upcoming: [], future: [], completed: [] } as any)

  // Calculate stats
  const totalItems = checklistItems.length
  const completedCount = groupedItems.completed.length
  const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Australian Checklist</h1>
          
          {/* Child Selector */}
          {children.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
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

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{completedCount} of {totalItems} completed</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Due/Overdue Items */}
        {groupedItems.due.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('due')}
              className="w-full px-4 py-3 flex items-center justify-between bg-red-50 text-left"
            >
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <h2 className="font-semibold text-gray-900">Action Required</h2>
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  {groupedItems.due.length}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('due') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('due') && (
              <div className="p-4 space-y-3">
                {groupedItems.due.map((item: any) => {
                  const dueDate = calculateDueDate(birthDate, item)
                  const Icon = getCategoryIcon(item.category)
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(item.id)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <div className={`p-2 rounded-xl border ${getCategoryColor(item.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-red-600 font-medium mt-2">
                          Due: {dueDate.toLocaleDateString('en-AU', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Items */}
        {groupedItems.upcoming.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('upcoming')}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
                <h2 className="font-semibold text-gray-900">Coming Soon</h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                  {groupedItems.upcoming.length}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('upcoming') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('upcoming') && (
              <div className="p-4 space-y-3">
                {groupedItems.upcoming.map((item: any) => {
                  const dueDate = calculateDueDate(birthDate, item)
                  const Icon = getCategoryIcon(item.category)
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(item.id)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <div className={`p-2 rounded-xl border ${getCategoryColor(item.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {dueDate.toLocaleDateString('en-AU', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Future Items */}
        {groupedItems.future.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('future')}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Upcoming</h2>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {groupedItems.future.length}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('future') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('future') && (
              <div className="p-4 space-y-3">
                {groupedItems.future.map((item: any) => {
                  const dueDate = calculateDueDate(birthDate, item)
                  const Icon = getCategoryIcon(item.category)
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(item.id)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all opacity-75"
                    >
                      <div className={`p-2 rounded-xl border ${getCategoryColor(item.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {dueDate.toLocaleDateString('en-AU', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Completed Items */}
        {groupedItems.completed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('completed')}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Completed</h2>
                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                  {groupedItems.completed.length}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('completed') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('completed') && (
              <div className="p-4 space-y-3">
                {groupedItems.completed.map((item: any) => {
                  const Icon = getCategoryIcon(item.category)
                  const completion = completedItems.find(
                    ci => ci.child_id === selectedChild?.id && ci.checklist_item_id === item.id
                  )
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(item.id)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all opacity-60"
                    >
                      <div className={`p-2 rounded-xl border opacity-50 ${getCategoryColor(item.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-through">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {completion && (
                          <p className="text-xs text-gray-500 mt-2">
                            Completed: {new Date(completion.completed_at).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                      <CheckCircleSolid className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}