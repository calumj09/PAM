'use client'

import { MilestoneBubble } from '@/lib/data/milestone-bubbles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { XMarkIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline'

interface MilestoneModalProps {
  milestone: MilestoneBubble
  onClose: () => void
}

export function MilestoneModal({ milestone, onClose }: MilestoneModalProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'development': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'physical': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'social': return 'bg-green-100 text-green-800 border-green-200'
      case 'cognitive': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'care': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              Milestone Details
            </CardTitle>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Milestone Header */}
          <div className="text-center">
            <div className="text-4xl mb-3">{milestone.emoji}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {milestone.title}
            </h2>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getTypeColor(milestone.type)}`}>
              <span className="capitalize">{milestone.type}</span>
            </div>
          </div>

          {/* Age Information */}
          <div className="flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">Week {milestone.weekNumber}</div>
              <div className="text-xs text-gray-600">Age</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {milestone.monthsOld === 0 ? 'Newborn' : `${milestone.monthsOld} month${milestone.monthsOld > 1 ? 's' : ''}`}
              </div>
              <div className="text-xs text-gray-600">Months</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">What to Expect</h3>
            <p className="text-gray-700 leading-relaxed">
              {milestone.description}
            </p>
          </div>

          {/* Encouragement */}
          <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg border border-pink-200">
            <div className="flex items-start gap-2">
              <span className="text-lg">♥</span>
              <div>
                <h4 className="font-medium text-pink-900 mb-1">For You, Parent</h4>
                <p className="text-sm text-pink-800 italic">
                  {milestone.encouragement}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Context */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <ClockIcon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Remember:</strong> Every baby develops at their own pace. These milestones are guidelines, not deadlines. If you have concerns, chat with your maternal child health nurse or GP.
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-pam-red hover:bg-pam-red/90"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}