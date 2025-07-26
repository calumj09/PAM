'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChecklistService, ChecklistItemRecord } from '@/lib/services/checklist-service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDateAustralian } from '@/lib/utils'
import { 
  CheckCircleIcon, 
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Child {
  id: string
  name: string
}

export default function ChecklistPage() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItemRecord[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name')
        .eq('user_id', user.id)

      setChildren(childrenData || [])

      // Load checklist items
      const items = await ChecklistService.getAllChecklistItems()
      setChecklistItems(items)
    } catch (error) {
      console.error('Error loading checklist data:', error)
      setError('Failed to load checklist data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleComplete = async (itemId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await ChecklistService.markItemIncomplete(itemId)
      } else {
        await ChecklistService.markItemCompleted(itemId)
      }
      
      // Update local state
      setChecklistItems(items => 
        items.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                is_completed: !isCompleted, 
                completed_date: !isCompleted ? new Date().toISOString() : null 
              }
            : item
        )
      )
    } catch (error) {
      console.error('Error toggling item completion:', error)
      setError('Failed to update item status')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immunization': return <HeartIcon className="w-5 h-5 text-red-500" />
      case 'registration': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />
      case 'milestone': return <UserGroupIcon className="w-5 h-5 text-purple-500" />
      case 'checkup': return <CalendarDaysIcon className="w-5 h-5 text-green-500" />
      default: return <CheckCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immunization': return 'border-red-200 bg-red-50'
      case 'registration': return 'border-blue-200 bg-blue-50'
      case 'milestone': return 'border-purple-200 bg-purple-50'
      case 'checkup': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getItemStatus = (item: ChecklistItemRecord) => {
    if (item.is_completed) return 'completed'
    
    const dueDate = new Date(item.due_date)
    const now = new Date()
    
    if (dueDate < now) return 'overdue'
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue <= 7) return 'upcoming'
    
    return 'future'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Completed</span>
      case 'overdue':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Overdue</span>
      case 'upcoming':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Due Soon</span>
      case 'future':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Upcoming</span>
      default:
        return null
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? checklistItems 
    : checklistItems.filter(item => item.category === selectedCategory)

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId)
    return child ? child.name : 'Unknown Child'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Checklist & Reminders
          </h1>
          <p className="text-gray-600 mt-1">
            Keep track of important appointments and milestones
          </p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first child to see their personalized checklist with immunizations, registrations, and milestones
            </p>
            <Link href="/dashboard/children">
              <Button>Add Your First Child</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">
          Checklist & Reminders
        </h1>
        <p className="text-gray-600 mt-1">
          Keep track of important appointments and milestones
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Items', icon: CheckCircleIcon },
          { key: 'immunization', label: 'Immunizations', icon: HeartIcon },
          { key: 'registration', label: 'Registration', icon: DocumentTextIcon },
          { key: 'milestone', label: 'Milestones', icon: UserGroupIcon },
          { key: 'checkup', label: 'Health Checks', icon: CalendarDaysIcon }
        ].map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'bg-pam-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Checklist Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No items in this category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const status = getItemStatus(item)
            const childName = getChildName(item.child_id)
            
            return (
              <Card 
                key={item.id} 
                className={`border-l-4 transition-all ${getCategoryColor(item.category)} ${
                  item.is_completed ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleComplete(item.id, item.is_completed)}
                          className="mt-1 flex-shrink-0 transition-colors"
                        >
                          {item.is_completed ? (
                            <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-pam-red transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(item.category)}
                            <h3 className={`font-semibold ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </h3>
                          </div>
                          
                          <p className={`text-sm mb-2 ${item.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <UserGroupIcon className="w-4 h-4" />
                              {childName}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              Due: {formatDateAustralian(new Date(item.due_date))}
                            </span>
                          </div>

                          {item.metadata?.vaccines && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Vaccines:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.metadata.vaccines.map((vaccine: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                                    {vaccine}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.metadata?.requirements && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Required documents:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {item.metadata.requirements.map((req: string, index: number) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(status)}
                      
                      {item.completed_date && (
                        <span className="text-xs text-green-600">
                          ✓ {formatDateAustralian(new Date(item.completed_date))}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}