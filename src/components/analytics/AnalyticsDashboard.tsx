'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AnalyticsService, WeeklyInsights, MonthlyReport } from '@/lib/services/analytics-service'
import { 
  ChartBarIcon, 
  ClockIcon,
  HeartIcon,
  MoonIcon,
  SwatchIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface AnalyticsDashboardProps {
  childId: string
  childName: string
}

export function AnalyticsDashboard({ childId, childName }: AnalyticsDashboardProps) {
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsights | null>(null)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null)
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [childId])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [weekly, monthly] = await Promise.all([
        AnalyticsService.generateWeeklyInsights(childId),
        AnalyticsService.generateMonthlyReport(childId)
      ])

      setWeeklyInsights(weekly)
      setMonthlyReport(monthly)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-pam-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadAnalytics} className="bg-pam-red hover:bg-pam-red/90">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentInsights = activeTab === 'weekly' ? weeklyInsights : monthlyReport

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics for {childName}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('weekly')}
            variant={activeTab === 'weekly' ? 'primary' : 'outline'}
            size="sm"
            className={activeTab === 'weekly' ? 'bg-pam-red hover:bg-pam-red/90' : ''}
          >
            This Week
          </Button>
          <Button
            onClick={() => setActiveTab('monthly')}
            variant={activeTab === 'monthly' ? 'primary' : 'outline'}
            size="sm"
            className={activeTab === 'monthly' ? 'bg-pam-red hover:bg-pam-red/90' : ''}
          >
            This Month
          </Button>
        </div>
      </div>

      {activeTab === 'weekly' && weeklyInsights && (
        <WeeklyInsightsView insights={weeklyInsights} childName={childName} />
      )}

      {activeTab === 'monthly' && monthlyReport && (
        <MonthlyReportView report={monthlyReport} childName={childName} />
      )}
    </div>
  )
}

function WeeklyInsightsView({ insights, childName }: { insights: WeeklyInsights, childName: string }) {
  const { feeding, sleep, diaper, growth } = insights

  // Prepare chart data
  const feedingData = [
    { name: 'Breast', value: feeding.breastVsBottleRatio.breast, fill: '#10B981' },
    { name: 'Bottle', value: feeding.breastVsBottleRatio.bottle, fill: '#3B82F6' }
  ]

  const sleepData = [
    { name: 'Night Sleep', hours: Math.round(sleep.averageNightSleep / 60 * 10) / 10 },
    { name: 'Day Sleep', hours: Math.round(sleep.averageDaySleep / 60 * 10) / 10 }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<HeartIcon className="w-5 h-5" />}
          title="Daily Feeds"
          value={Math.round(feeding.totalFeeds / 7)}
          subtitle={`${feeding.totalFeeds} this week`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={<MoonIcon className="w-5 h-5" />}
          title="Sleep per Day"
          value={`${Math.round(sleep.totalSleepPerDay / 60)}h`}
          subtitle={`${Math.round(sleep.longestSleepStretch / 60)}h longest`}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          icon={<SwatchIcon className="w-5 h-5" />}
          title="Diaper Changes"
          value={diaper.averageChangesPerDay}
          subtitle={`${diaper.wetToDirtyRatio.wet}% wet`}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <MetricCard
          icon={<ClockIcon className="w-5 h-5" />}
          title="Feed Interval"
          value={`${Math.round(feeding.averageInterval / 60 * 10) / 10}h`}
          subtitle={`${feeding.averageDuration}min avg`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Feeding Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-green-600" />
              Feeding Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeding.totalFeeds > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feedingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {feedingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No feeding data this week
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoonIcon className="w-5 h-5 text-purple-600" />
              Sleep Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sleep.totalSleepPerDay > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} hours`, 'Duration']} />
                    <Bar dataKey="hours" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No sleep data this week
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-blue-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <LightBulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concerns */}
        {insights.concerns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                Things to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.concerns.map((concern, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-orange-800">{concern}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Growth Information */}
      {growth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              Growth Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {growth.latestMeasurements.weight ? 
                    `${Math.round(growth.latestMeasurements.weight / 1000 * 10) / 10}kg` : 
                    'No data'
                  }
                </div>
                <div className="text-sm text-gray-500">Weight</div>
                <div className={`text-xs font-medium ${
                  growth.weightTrend === 'gaining' ? 'text-green-600' : 
                  growth.weightTrend === 'losing' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {growth.weightTrend}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {growth.latestMeasurements.height ? 
                    `${growth.latestMeasurements.height}cm` : 
                    'No data'
                  }
                </div>
                <div className="text-sm text-gray-500">Height</div>
                <div className={`text-xs font-medium ${
                  growth.heightTrend === 'growing' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {growth.heightTrend}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {growth.latestMeasurements.headCircumference ? 
                    `${growth.latestMeasurements.headCircumference}cm` : 
                    'No data'
                  }
                </div>
                <div className="text-sm text-gray-500">Head Circumference</div>
                <div className="text-xs text-gray-600">Latest measurement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MonthlyReportView({ report, childName }: { report: MonthlyReport, childName: string }) {
  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pam-red" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{report.summary.totalFeeds}</div>
              <div className="text-sm text-gray-500">Total Feeds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{report.summary.totalSleepHours}h</div>
              <div className="text-sm text-gray-500">Total Sleep</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{report.summary.totalDiaperChanges}</div>
              <div className="text-sm text-gray-500">Diaper Changes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{report.summary.growthProgress}</div>
              <div className="text-sm text-gray-500">Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {trend.direction === 'improving' && <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />}
                  {trend.direction === 'concerning' && <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />}
                  {trend.direction === 'stable' && <ClockIcon className="w-5 h-5 text-gray-600" />}
                  <div>
                    <div className="font-medium">{trend.metric}</div>
                    <div className="text-sm text-gray-600">{trend.description}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  trend.direction === 'improving' ? 'bg-green-100 text-green-800' :
                  trend.direction === 'concerning' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {trend.direction}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5 text-blue-600" />
              Monthly Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <LightBulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  bgColor 
}: { 
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: string
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}