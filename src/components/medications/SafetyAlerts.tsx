'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MedicationService, 
  MedicationAlert, 
  AlertSeverity 
} from '@/lib/services/medication-service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface SafetyAlertsProps {
  alerts: MedicationAlert[]
  onAcknowledge: () => void
}

export function SafetyAlerts({ alerts, onAcknowledge }: SafetyAlertsProps) {
  const [acknowledgingIds, setAcknowledgingIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setAcknowledgingIds(prev => new Set([...prev, alertId]))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await MedicationService.acknowledgeAlert(alertId, user.id)
      onAcknowledge()
      
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    } finally {
      setAcknowledgingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(alertId)
        return newSet
      })
    }
  }

  const getSeverityStyles = (severity: AlertSeverity) => {
    const styles = {
      low: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      medium: {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        icon: 'text-yellow-600',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      high: {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        icon: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      critical: {
        border: 'border-red-200',
        bg: 'bg-red-50',
        text: 'text-red-900',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    }
    return styles[severity]
  }

  const getAlertIcon = (alertType: string, severity: AlertSeverity) => {
    const style = getSeverityStyles(severity)
    
    switch (alertType) {
      case 'max_dose_exceeded':
        return <ExclamationTriangleIcon className={`w-6 h-6 ${style.icon}`} />
      case 'interaction_warning':
        return <ShieldExclamationIcon className={`w-6 h-6 ${style.icon}`} />
      case 'allergy_warning':
        return <XCircleIcon className={`w-6 h-6 ${style.icon}`} />
      case 'age_restriction':
        return <InformationCircleIcon className={`w-6 h-6 ${style.icon}`} />
      default:
        return <ExclamationTriangleIcon className={`w-6 h-6 ${style.icon}`} />
    }
  }

  const getAlertTitle = (alertType: string) => {
    const titles = {
      max_dose_exceeded: 'Maximum Dose Exceeded',
      interaction_warning: 'Drug Interaction Warning',
      allergy_warning: 'Allergy Warning', 
      age_restriction: 'Age Restriction Warning'
    }
    return titles[alertType as keyof typeof titles] || 'Safety Alert'
  }

  const getEmergencyInfo = (severity: AlertSeverity) => {
    if (severity === 'critical') {
      return (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Emergency Contact Required</h4>
              <p className="text-sm text-red-800 mt-1">
                This is a critical safety issue. Contact emergency services (000) or your child's doctor immediately.
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p><strong>Emergency:</strong> 000</p>
                <p><strong>Poisons Information:</strong> 13 11 26</p>
                <p><strong>Health Direct:</strong> 1800 022 222</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (severity === 'high') {
      return (
        <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Medical Advice Recommended</h4>
              <p className="text-sm text-orange-800 mt-1">
                Contact your GP, pharmacist, or Health Direct (1800 022 222) for guidance.
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-900 mb-2">All Clear!</h3>
          <p className="text-green-800">No safety alerts at this time. Great medication management!</p>
        </CardContent>
      </Card>
    )
  }

  // Sort alerts by severity and date
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }
    
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    if (severityDiff !== 0) return severityDiff
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedAlerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity)
        const isAcknowledging = acknowledgingIds.has(alert.id)
        
        return (
          <Card key={alert.id} className={`${styles.border} ${styles.bg}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.alert_type, alert.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${styles.text}`}>
                        {getAlertTitle(alert.alert_type)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                          {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${styles.text} space-y-3`}>
                    <div>
                      <h4 className="font-medium mb-1">Alert Details:</h4>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    
                    {alert.recommendation && (
                      <div>
                        <h4 className="font-medium mb-1">Recommendation:</h4>
                        <p className="text-sm">{alert.recommendation}</p>
                      </div>
                    )}
                  </div>
                  
                  {getEmergencyInfo(alert.severity)}
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-current border-opacity-20">
                    <div className="text-xs text-gray-600">
                      Alert ID: {alert.id.substring(0, 8)}
                    </div>
                    
                    <Button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={isAcknowledging}
                      size="sm"
                      className={`${styles.button} text-white`}
                    >
                      {isAcknowledging ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Acknowledging...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Acknowledge Alert
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {/* Summary Information */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">🛡️ About Safety Alerts</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Alerts are automatically generated based on Australian medication guidelines</p>
            <p>• Critical alerts require immediate action - contact emergency services</p>
            <p>• High alerts should be discussed with your GP or pharmacist</p>
            <p>• Acknowledging an alert confirms you've read and understood it</p>
            <p>• Keep medication packaging and patient information leaflets handy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}