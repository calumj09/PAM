'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  GrowthTrackingService,
  GrowthAlert,
  AlertSeverity
} from '@/lib/services/growth-tracking-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

interface GrowthAlertsProps {
  alerts: GrowthAlert[]
  onAcknowledge: () => void
}

export function GrowthAlerts({ alerts, onAcknowledge }: GrowthAlertsProps) {
  const [acknowledgingAlert, setAcknowledgingAlert] = useState<string | null>(null)

  const supabase = createClient()

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setAcknowledgingAlert(alertId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await GrowthTrackingService.acknowledgeAlert(alertId, user.id)
      onAcknowledge()
      
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    } finally {
      setAcknowledgingAlert(null)
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'urgent':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
      case 'high':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
      case 'medium':
        return <ExclamationCircleIcon className="w-6 h-6 text-orange-500" />
      case 'low':
        return <InformationCircleIcon className="w-6 h-6 text-yellow-500" />
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'urgent':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-orange-200 bg-orange-50'
      case 'low':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case 'urgent':
        return 'URGENT'
      case 'high':
        return 'HIGH'
      case 'medium':
        return 'MEDIUM'
      case 'low':
        return 'LOW'
      default:
        return 'INFO'
    }
  }

  const getAlertTypeDescription = (alertType: string) => {
    switch (alertType) {
      case 'low_percentile':
        return 'Growth measurement below expected range'
      case 'high_percentile':
        return 'Growth measurement above expected range'
      case 'rapid_change':
        return 'Rapid change in growth pattern'
      case 'no_growth':
        return 'Little to no growth detected'
      case 'milestone_delay':
        return 'Developmental milestone delay'
      default:
        return 'Growth pattern concern'
    }
  }

  const sortAlertsBySeverity = (alerts: GrowthAlert[]) => {
    const severityOrder: Record<AlertSeverity, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4
    }
    
    return [...alerts].sort((a, b) => {
      const aSeverity = severityOrder[a.severity] ?? 5
      const bSeverity = severityOrder[b.severity] ?? 5
      if (aSeverity !== bSeverity) {
        return aSeverity - bSeverity
      }
      // If same severity, sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-green-900 mb-2">All Clear! </h3>
          <p className="text-green-800">
            No growth alerts at this time. Your child's growth appears to be on track.
          </p>
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-700">
              Keep recording regular measurements to maintain a complete picture of your child's growth and development.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedAlerts = sortAlertsBySeverity(alerts)
  const urgentAlerts = alerts.filter(a => a.severity === 'urgent')
  const highAlerts = alerts.filter(a => a.severity === 'high')

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-900">
                {alerts.length} Active Growth Alert{alerts.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-orange-800">
                {urgentAlerts.length > 0 && `${urgentAlerts.length} urgent, `}
                {highAlerts.length > 0 && `${highAlerts.length} high priority, `}
                {alerts.length - urgentAlerts.length - highAlerts.length} other concerns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Action Required */}
      {(urgentAlerts.length > 0 || alerts.some(a => a.urgent_medical_attention)) && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts
                .filter(a => a.urgent_medical_attention || a.severity === 'urgent')
                .map(alert => (
                  <div key={alert.id} className="p-3 bg-white border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-red-800 mb-2">{alert.message}</p>
                    {alert.urgent_medical_attention && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                        <PhoneIcon className="w-4 h-4" />
                        <span className="font-medium">Contact your GP or pediatrician immediately</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert List */}
      <div className="space-y-4">
        {sortedAlerts.map((alert) => (
          <Card key={alert.id} className={getSeverityColor(alert.severity)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          alert.severity === 'urgent' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'low' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {getAlertTypeDescription(alert.alert_type)}
                      </p>
                      <p className="text-sm text-gray-800 mb-3">
                        {alert.message}
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {format(parseISO(alert.created_at), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>

                  {/* Percentile Information */}
                  {(alert.current_percentile || alert.previous_percentile) && (
                    <div className="p-3 bg-white/50 rounded border mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Measurement Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {alert.measurement_type && (
                          <p><strong>Measurement:</strong> {alert.measurement_type.replace('_', ' ')}</p>
                        )}
                        {alert.current_percentile && (
                          <p><strong>Current percentile:</strong> {alert.current_percentile}th</p>
                        )}
                        {alert.previous_percentile && (
                          <p><strong>Previous percentile:</strong> {alert.previous_percentile}th</p>
                        )}
                        {alert.percentile_change && (
                          <p><strong>Change:</strong> {alert.percentile_change > 0 ? '+' : ''}{alert.percentile_change} percentile points</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  {alert.recommendation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Recommendation</h4>
                      <p className="text-sm text-blue-800">{alert.recommendation}</p>
                    </div>
                  )}

                  {/* GP Consultation Recommended */}
                  {alert.gp_consultation_recommended && (
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-2 rounded mb-3">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Consider discussing with your GP or pediatrician</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={acknowledgingAlert === alert.id}
                      variant="outline"
                      size="sm"
                      className="text-gray-700 border-gray-300"
                    >
                      {acknowledgingAlert === alert.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          Acknowledging...
                        </div>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Acknowledge
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2"> Important Note</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Growth alerts are automated guidance based on WHO/Australian standards</p>
            <p>• They are not medical diagnoses and should not replace professional advice</p>
            <p>• Always consult your GP, pediatrician, or maternal child health nurse for concerns</p>
            <p>• Individual children grow at different rates - patterns matter more than single measurements</p>
            <p>• Acknowledging an alert marks it as reviewed but doesn't resolve the underlying concern</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}