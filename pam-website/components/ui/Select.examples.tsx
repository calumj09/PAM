"use client"

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select'

// Basic usage example
export function BasicSelectExample() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor="fruit-select" className="text-sm font-medium">
        Choose a fruit
      </label>
      <Select>
        <SelectTrigger id="fruit-select">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

// PAM themed examples
export function PAMSelectExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-heading text-pam-red">PAM Select Component Examples</h2>
      
      {/* PAM Primary Variant */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-pam-red">PAM Primary</h3>
        <Select>
          <SelectTrigger variant="pam" className="w-full max-w-sm">
            <SelectValue placeholder="Select your child's milestone" />
          </SelectTrigger>
          <SelectContent variant="pam">
            <SelectGroup>
              <SelectLabel>Physical Development</SelectLabel>
              <SelectItem variant="pam" value="sitting">First time sitting</SelectItem>
              <SelectItem variant="pam" value="crawling">Started crawling</SelectItem>
              <SelectItem variant="pam" value="walking">First steps</SelectItem>
              <SelectSeparator />
              <SelectLabel>Social Development</SelectLabel>
              <SelectItem variant="pam" value="smiling">First smile</SelectItem>
              <SelectItem variant="pam" value="laughing">First laugh</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* PAM Secondary Variant */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-pam-red">PAM Secondary</h3>
        <Select>
          <SelectTrigger variant="pam-secondary" className="w-full max-w-sm">
            <SelectValue placeholder="Select feeding type" />
          </SelectTrigger>
          <SelectContent variant="pam-secondary">
            <SelectItem variant="pam-secondary" value="breastfeeding">Breastfeeding</SelectItem>
            <SelectItem variant="pam-secondary" value="bottle">Bottle feeding</SelectItem>
            <SelectItem variant="pam-secondary" value="solid">Solid foods</SelectItem>
            <SelectItem variant="pam-secondary" value="mixed">Mixed feeding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PAM Outline Variant */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-pam-red">PAM Outline</h3>
        <Select>
          <SelectTrigger variant="outline" className="w-full max-w-sm">
            <SelectValue placeholder="Select priority level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent"> Urgent</SelectItem>
            <SelectItem value="high"> High Priority</SelectItem>
            <SelectItem value="medium"> Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Size variants example
export function SelectSizeExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-heading text-pam-red">Select Size Variants</h2>
      
      {/* Small Size */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Small (36px min-height)</h3>
        <Select>
          <SelectTrigger size="sm" variant="pam" className="w-full max-w-xs">
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Default Size */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Default (44px min-height - Mobile optimized)</h3>
        <Select>
          <SelectTrigger variant="pam" className="w-full max-w-sm">
            <SelectValue placeholder="Default select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Large Size */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Large (48px min-height)</h3>
        <Select>
          <SelectTrigger size="lg" variant="pam" className="w-full max-w-md">
            <SelectValue placeholder="Large select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Real-world PAM app examples
export function PAMAppExamples() {
  const [selectedChild, setSelectedChild] = React.useState<string>('')
  const [selectedTask, setSelectedTask] = React.useState<string>('')

  return (
    <div className="space-y-8 p-6 bg-pam-cream min-h-screen">
      <h2 className="text-2xl font-heading text-pam-red">PAM App Integration Examples</h2>
      
      {/* Child Selection */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-pam-pink/20">
        <h3 className="text-lg font-semibold text-pam-red mb-4">Select Child</h3>
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger variant="pam" className="w-full">
            <SelectValue placeholder="Choose which child this is for" />
          </SelectTrigger>
          <SelectContent variant="pam">
            <SelectGroup>
              <SelectLabel>Your Children</SelectLabel>
              <SelectItem variant="pam" value="emma"> Emma (6 months)</SelectItem>
              <SelectItem variant="pam" value="liam"> Liam (3 years)</SelectItem>
              <SelectItem variant="pam" value="sophie"> Sophie (5 years)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedChild && (
          <p className="mt-2 text-sm text-pam-red">
            Selected: {selectedChild === 'emma' ? 'Emma (6 months)' : 
                      selectedChild === 'liam' ? 'Liam (3 years)' : 'Sophie (5 years)'}
          </p>
        )}
      </div>

      {/* Task Category Selection */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-pam-pink/20">
        <h3 className="text-lg font-semibold text-pam-red mb-4">Add New Task</h3>
        <Select value={selectedTask} onValueChange={setSelectedTask}>
          <SelectTrigger variant="pam-secondary" className="w-full">
            <SelectValue placeholder="What type of task?" />
          </SelectTrigger>
          <SelectContent variant="pam-secondary">
            <SelectGroup>
              <SelectLabel>Health & Medical</SelectLabel>
              <SelectItem variant="pam-secondary" value="checkup"> Doctor Checkup</SelectItem>
              <SelectItem variant="pam-secondary" value="vaccination"> Vaccination</SelectItem>
              <SelectItem variant="pam-secondary" value="dental"> Dental Visit</SelectItem>
              <SelectSeparator />
              <SelectLabel>Development</SelectLabel>
              <SelectItem variant="pam-secondary" value="milestone"> Milestone Tracking</SelectItem>
              <SelectItem variant="pam-secondary" value="assessment"> Development Assessment</SelectItem>
              <SelectSeparator />
              <SelectLabel>Education</SelectLabel>
              <SelectItem variant="pam-secondary" value="enrollment"> School Enrollment</SelectItem>
              <SelectItem variant="pam-secondary" value="meeting">Parent-Teacher Meeting</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedTask && (
          <p className="mt-2 text-sm text-pam-red">
            Selected task type: {selectedTask}
          </p>
        )}
      </div>

      {/* Medication Time Selection */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-pam-pink/20">
        <h3 className="text-lg font-semibold text-pam-red mb-4">Medication Reminder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-pam-red mb-2">
              Medication
            </label>
            <Select>
              <SelectTrigger variant="outline" className="w-full">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paracetamol">Paracetamol (Infant drops)</SelectItem>
                <SelectItem value="ibuprofen">Ibuprofen (Children's)</SelectItem>
                <SelectItem value="vitamin-d">Vitamin D drops</SelectItem>
                <SelectItem value="antibiotic">Antibiotic (Prescribed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-pam-red mb-2">
              Frequency
            </label>
            <Select>
              <SelectTrigger variant="outline" className="w-full">
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once daily</SelectItem>
                <SelectItem value="twice">Twice daily</SelectItem>
                <SelectItem value="three">Three times daily</SelectItem>
                <SelectItem value="four">Four times daily</SelectItem>
                <SelectItem value="as-needed">As needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Disabled state example */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-pam-pink/20">
        <h3 className="text-lg font-semibold text-pam-red mb-4">Disabled State</h3>
        <Select disabled>
          <SelectTrigger variant="pam" className="w-full max-w-sm">
            <SelectValue placeholder="This select is disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-gray-600">
          Disabled selects have reduced opacity and cannot be interacted with.
        </p>
      </div>
    </div>
  )
}

// Performance and accessibility notes
export function AccessibilityDemoSelect() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-heading text-pam-red">Accessibility Features</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Keyboard Navigation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use Tab to focus, Enter/Space to open, Arrow keys to navigate, Enter to select, Escape to close.
          </p>
          <Select>
            <SelectTrigger variant="pam" className="w-full max-w-sm">
              <SelectValue placeholder="Try keyboard navigation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">First option</SelectItem>
              <SelectItem value="option2">Second option</SelectItem>
              <SelectItem value="option3">Third option</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Screen Reader Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Includes proper ARIA labels, roles, and state management for screen readers.
          </p>
          <Select>
            <SelectTrigger 
              variant="pam" 
              className="w-full max-w-sm"
              aria-label="Choose your preferred language"
            >
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Mobile Touch Targets</h3>
          <p className="text-sm text-gray-600 mb-4">
            Minimum 44px touch targets for mobile accessibility (WCAG AA compliance).
          </p>
          <Select>
            <SelectTrigger variant="pam" className="w-full max-w-sm">
              <SelectValue placeholder="Mobile-optimized select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Touch-friendly option 1</SelectItem>
              <SelectItem value="option2">Touch-friendly option 2</SelectItem>
              <SelectItem value="option3">Touch-friendly option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}