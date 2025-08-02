'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  nationalResources, 
  stateResources, 
  getStateFromCoordinates,
  getResourcesForState,
  type Resource,
  type StateResources
} from '@/lib/data/australian-resources'
import { 
  PhoneIcon, 
  LinkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  HomeIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  MapPinIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export default function InfoPage() {
  const [selectedState, setSelectedState] = useState<string>('NSW')
  const [expandedSections, setExpandedSections] = useState<string[]>(['emergency', 'registration'])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    loadUserState()
  }, [])

  const loadUserState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Load user's preferred state from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('state_territory')
        .eq('id', user.id)
        .single()
      
      if (profileData?.state_territory) {
        setSelectedState(profileData.state_territory)
        setIsLoading(false)
        return
      }

      // Fallback to geolocation if no state in profile
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const state = getStateFromCoordinates(
              position.coords.latitude,
              position.coords.longitude
            )
            setSelectedState(state)
            setIsLoading(false)
          },
          () => {
            // Location failed, use default NSW
            setIsLoading(false)
          }
        )
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error loading user state:', error)
      setIsLoading(false)
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
      case 'registration': return DocumentTextIcon
      case 'financial': return CurrencyDollarIcon
      case 'childcare': return HomeIcon
      case 'health': return HeartIcon
      case 'emergency': return ExclamationTriangleIcon
      case 'support': return UserGroupIcon
      default: return LinkIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'registration': return 'text-blue-600 bg-blue-50'
      case 'financial': return 'text-green-600 bg-green-50'
      case 'childcare': return 'text-purple-600 bg-purple-50'
      case 'health': return 'text-red-600 bg-red-50'
      case 'emergency': return 'text-orange-600 bg-orange-50'
      case 'support': return 'text-indigo-600 bg-indigo-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const resources = getResourcesForState(selectedState)
  const currentState = stateResources.find(s => s.stateCode === selectedState)

  // Group resources by category
  const groupedNational = nationalResources.reduce((acc, resource) => {
    if (!acc[resource.category]) acc[resource.category] = []
    acc[resource.category].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  const categoryTitles = {
    registration: 'Registration & Documentation',
    financial: 'Financial Support',
    childcare: 'Childcare Services',
    health: 'Health Services',
    support: 'Parenting Support',
    emergency: 'Emergency Contacts'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Australian Resources</h1>
          
          {/* State Selector */}
          <div className="mt-3">
            <label className="text-sm text-gray-600">Select your state/territory:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {stateResources.map((state) => (
                <option key={state.stateCode} value={state.stateCode}>
                  {state.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Emergency Contacts */}
        {currentState && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('emergency')}
              className="w-full px-4 py-3 flex items-center justify-between bg-red-50 text-left"
            >
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <h2 className="font-semibold text-gray-900">Emergency Contacts</h2>
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">24/7</span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('emergency') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('emergency') && (
              <div className="p-4 space-y-3">
                <a href="tel:000" className="block p-4 bg-red-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Emergency Services</h3>
                      <p className="text-sm text-gray-600">Police, Fire, Ambulance</p>
                    </div>
                    <div className="text-2xl font-bold text-red-600">000</div>
                  </div>
                </a>
                
                <a href="tel:131126" className="block p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Poisons Information</h3>
                      <p className="text-sm text-gray-600">24/7 advice on poisons</p>
                    </div>
                    <div className="text-lg font-bold text-orange-600">13 11 26</div>
                  </div>
                </a>
                
                {currentState.emergencyContacts.map((contact, idx) => (
                  <a key={idx} href={`tel:${contact.phone.replace(/\D/g, '')}`} className="block p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{contact.title}</h3>
                        <p className="text-sm text-gray-600">{contact.description}</p>
                      </div>
                      <PhoneIcon className="w-5 h-5 text-gray-400 ml-2" />
                    </div>
                    <p className="text-sm font-medium text-red-600 mt-1">{contact.phone}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* State-specific Resources */}
        {currentState && currentState.resources.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('state')}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">{currentState.state} Services</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {currentState.resources.length}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('state') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('state') && (
              <div className="p-4 space-y-3">
                {currentState.resources.map((resource) => {
                  const Icon = getCategoryIcon(resource.category)
                  return (
                    <div key={resource.id} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <div className="flex gap-3 mt-2">
                            <a 
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Visit Website
                            </a>
                            {resource.phone && (
                              <a 
                                href={`tel:${resource.phone.replace(/\D/g, '')}`}
                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <PhoneIcon className="w-4 h-4" />
                                {resource.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* National Resources by Category */}
        {Object.entries(groupedNational).map(([category, resources]) => {
          const Icon = getCategoryIcon(category)
          const title = categoryTitles[category as keyof typeof categoryTitles] || category
          
          return (
            <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(category)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">{title}</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {resources.length}
                  </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.includes(category) ? 'rotate-180' : ''
                }`} />
              </button>
              
              {expandedSections.includes(category) && (
                <div className="p-4 space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border border-gray-200 rounded-xl p-3">
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="flex gap-3 mt-2">
                        <a 
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Visit Website
                        </a>
                        {resource.phone && (
                          <a 
                            href={`tel:${resource.phone.replace(/\D/g, '')}`}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <PhoneIcon className="w-4 h-4" />
                            {resource.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Offline Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Available Offline</h3>
              <p className="text-sm text-gray-600 mt-1">
                Emergency contacts and important phone numbers are saved for offline access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}