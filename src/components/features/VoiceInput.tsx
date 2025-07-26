'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { VoiceService } from '@/lib/services/voice-service'
import { TrackerService } from '@/lib/services/tracker-service'
import { QuickFeedingEntry, QuickSleepEntry, QuickDiaperEntry } from '@/types/tracker'
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid'

interface VoiceInputProps {
  childId: string
  childName: string
  onActivityAdded: () => void
}

export function VoiceInput({ childId, childName, onActivityAdded }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    setIsSupported(VoiceService.isSupported())
  }, [])

  const startListening = async () => {
    if (isListening) return

    setIsListening(true)
    setTranscript('')
    setError('')
    setSuggestions([])

    try {
      const result = await VoiceService.startListening()
      
      if (result.success && result.command) {
        setTranscript(result.command.text)
        await processVoiceCommand(result.command)
      } else {
        setError(result.error || 'Could not understand command')
        if (result.suggestions) {
          setSuggestions(result.suggestions)
        }
      }
    } catch (error) {
      console.error('Voice recognition error:', error)
      setError('Failed to start voice recognition')
    } finally {
      setIsListening(false)
    }
  }

  const stopListening = () => {
    VoiceService.stopListening()
    setIsListening(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processVoiceCommand = async (command: any) => {
    setIsProcessing(true)
    
    try {
      switch (command.activity_type) {
        case 'breastfeeding':
          await TrackerService.recordFeeding({
            child_id: childId,
            feeding_type: 'breast',
            started_at: new Date(),
            duration_minutes: command.duration || 15,
            breast_side: command.details?.breast_side || 'left'
          } as QuickFeedingEntry)
          break

        case 'bottle':
          await TrackerService.recordFeeding({
            child_id: childId,
            feeding_type: 'bottle',
            started_at: new Date(),
            amount_ml: command.details?.amount_ml || 120,
            duration_minutes: command.duration || 10
          } as QuickFeedingEntry)
          break

        case 'solid':
          await TrackerService.recordFeeding({
            child_id: childId,
            feeding_type: 'solid',
            started_at: new Date(),
            food_items: command.details?.food_items || ['solid food']
          } as QuickFeedingEntry)
          break

        case 'diaper-wet':
          await TrackerService.recordDiaperChange({
            child_id: childId,
            diaper_type: 'wet',
            changed_at: new Date()
          } as QuickDiaperEntry)
          break

        case 'diaper-dirty':
          await TrackerService.recordDiaperChange({
            child_id: childId,
            diaper_type: 'dirty',
            changed_at: new Date(),
            consistency: command.details?.consistency || 'normal'
          } as QuickDiaperEntry)
          break

        case 'sleep-start':
          await TrackerService.recordSleep({
            child_id: childId,
            started_at: new Date(),
            sleep_quality: command.details?.sleep_quality || 'good'
          } as QuickSleepEntry)
          break

        case 'tummy-time':
        case 'bath':
          // These would need additional activity types in the database
          setError(`${command.activity_type} tracking coming soon!`)
          return

        default:
          setError('Unknown activity type')
          return
      }

      onActivityAdded()
      setError('')
      
      // Show success feedback
      setTranscript(`✅ Recorded: ${command.text}`)
      
    } catch (error) {
      console.error('Error processing voice command:', error)
      setError('Failed to record activity')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <MicrophoneIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Voice input not supported in this browser
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pam-pink/30 bg-gradient-to-r from-pam-pink/5 to-pam-cream">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MicrophoneIcon className="w-5 h-5 text-pam-red" />
          <h3 className="font-semibold text-gray-900">Voice Tracking</h3>
          <span className="px-2 py-1 bg-pam-pink/20 text-pam-red text-xs rounded-full font-medium">
            Hands-free
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {transcript && !error && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Heard:</strong> &quot;{transcript}&quot;
            </p>
          </div>
        )}

        <div className="flex items-center justify-center mb-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-pam-red hover:bg-pam-red/90'
            }`}
          >
            {isListening ? (
              <XMarkIcon className="w-8 h-8 text-white" />
            ) : isProcessing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MicrophoneSolidIcon className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600 mb-4">
          {isListening ? (
            <div>
              <p className="font-medium text-pam-red">Listening for {childName}...</p>
              <p className="text-xs mt-1">Tap the button or say your command</p>
            </div>
          ) : isProcessing ? (
            <p className="font-medium text-pam-red">Processing command...</p>
          ) : (
            <div>
              <p>Tap to record activity for {childName}</p>
              <p className="text-xs mt-1">Say things like: &quot;Breastfeed 15 minutes&quot; or &quot;Wet diaper&quot;</p>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Try saying:</p>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {!isListening && !isProcessing && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <div className="font-medium mb-1">Feeding:</div>
                <div>&quot;Breastfeed 20 minutes&quot;</div>
                <div>&quot;Bottle 150ml&quot;</div>
              </div>
              <div>
                <div className="font-medium mb-1">Care:</div>
                <div>&quot;Wet diaper&quot;</div>
                <div>&quot;Start sleep&quot;</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}