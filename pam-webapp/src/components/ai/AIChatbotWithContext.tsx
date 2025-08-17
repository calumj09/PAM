'use client'

import { useState, useEffect } from 'react'
import { AIChatbot } from './AIChatbot'
import { useSelectedChild } from '@/lib/hooks/use-selected-child'
import { Button } from '@/components/ui/Button'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export function AIChatbotWithContext() {
  const { children, selectedChild, selectChild, hasMultipleChildren } = useSelectedChild()
  const [showChildSelector, setShowChildSelector] = useState(false)

  // If there's only one child, use it automatically
  const effectiveChild = hasMultipleChildren ? selectedChild : children[0]

  if (!effectiveChild) {
    // Just show the basic AI chatbot without child context
    return <AIChatbot />
  }

  return (
    <>
      <AIChatbot 
        childId={effectiveChild.id} 
        childName={effectiveChild.name} 
      />
      
      {/* Child selector for multiple children */}
      {hasMultipleChildren && showChildSelector && (
        <div className="fixed bottom-24 right-6 z-40 bg-white rounded-lg shadow-lg p-2 border">
          <p className="text-xs text-gray-600 mb-2 px-2">Select child for AI context:</p>
          {children.map(child => (
            <Button
              key={child.id}
              onClick={() => {
                selectChild(child)
                setShowChildSelector(false)
              }}
              variant={child.id === effectiveChild?.id ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start mb-1"
            >
              {child.name}
            </Button>
          ))}
        </div>
      )}
      
      {/* Child selector toggle */}
      {hasMultipleChildren && (
        <div className="fixed bottom-6 right-24 z-40">
          <Button
            onClick={() => setShowChildSelector(!showChildSelector)}
            size="sm"
            variant="outline"
            className="text-xs shadow-md"
          >
            <span className="truncate max-w-[80px]">{effectiveChild?.name}</span>
            <ChevronDownIcon className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </>
  )
}