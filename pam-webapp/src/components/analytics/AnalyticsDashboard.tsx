'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  TrackerAnalyticsService, 
  DailyAnalytics, 
  SleepPattern, 
  FeedingPattern, 
  NappyPattern,
  WeeklyInsight,
  HealthcareReport
} from '@/lib/services/tracker-analytics-service'
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
  CalendarIcon,
  DocumentArrowDownIcon,
  UserIcon
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
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { format, subDays } from 'date-fns'

interface AnalyticsDashboardProps {
  childId: string
  childName: string
}

export function AnalyticsDashboard({ childId, childName }: AnalyticsDashboardProps) {
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([])
  const [sleepPattern, setSleepPattern] = useState<SleepPattern | null>(null)
  const [feedingPattern, setFeedingPattern] = useState<FeedingPattern | null>(null)
  const [nappyPattern, setNappyPattern] = useState<NappyPattern | null>(null)
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsight[]>([])
  const [healthcareReport, setHealthcareReport] = useState<HealthcareReport | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'insights' | 'reports'>('overview')
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [childId, timeRange])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError('')

      const endDate = new Date()
      const startDate = subDays(endDate, timeRange)

      const [
        dailyData,
        sleepData,
        feedingData,
        nappyData,
        insights,
        report
      ] = await Promise.all([
        TrackerAnalyticsService.getDailyAnalytics(childId, startDate, endDate),
        TrackerAnalyticsService.analyzeSleepPatterns(childId, timeRange),
        TrackerAnalyticsService.analyzeFeedingPatterns(childId, timeRange),
        TrackerAnalyticsService.analyzeNappyPatterns(childId, timeRange),
        TrackerAnalyticsService.generateWeeklyInsights(childId, 0),
        TrackerAnalyticsService.generateHealthcareReport(childId, childName, timeRange)
      ])

      setDailyAnalytics(dailyData)
      setSleepPattern(sleepData)
      setFeedingPattern(feedingData)
      setNappyPattern(nappyData)
      setWeeklyInsights(insights)
      setHealthcareReport(report)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const exportHealthcareReport = async () => {
    if (!healthcareReport) return

    try {
      const reportText = generateReportText(healthcareReport)
      const blob = new Blob([reportText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${childName}-tracker-report-${format(new Date(), 'yyyy-MM-dd')}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const generateReportText = (report: HealthcareReport): string => {
    return `
TRACKER ANALYTICS REPORT
Child: ${report.childName}
Period: ${format(report.dateRange.start, 'dd/MM/yyyy')} - ${format(report.dateRange.end, 'dd/MM/yyyy')}
Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

SUMMARY
-------
Total Days Tracked: ${report.summary.totalDays}
Average Feedings per Day: ${report.summary.avgFeedingsPerDay}
Average Sleep Hours per Day: ${report.summary.avgSleepHoursPerDay.toFixed(1)}
Average Nappies per Day: ${report.summary.avgNappiesPerDay}

SLEEP PATTERNS
--------------
Average Sleep Duration: ${report.patterns.sleep.averageSleepDuration} minutes
Average Naps per Day: ${report.patterns.sleep.averageNapsPerDay}
Longest Sleep Stretch: ${report.patterns.sleep.longestSleepStretch} minutes
Total Sleep per Day: ${report.patterns.sleep.totalSleepPerDay} minutes
Night Sleep Start: ${report.patterns.sleep.nightSleepStart || 'Not established'}
Morning Wake Time: ${report.patterns.sleep.morningWakeTime || 'Not established'}
Sleep Efficiency: ${report.patterns.sleep.sleepEfficiency}%

FEEDING PATTERNS
----------------
Average Feeding Interval: ${report.patterns.feeding.averageFeedingInterval} minutes
Average Feeding Duration: ${report.patterns.feeding.averageFeedingDuration} minutes
Average Bottle Amount: ${report.patterns.feeding.averageBottleAmount}ml
Feedings per Day: ${report.patterns.feeding.feedingsPerDay}
Preferred Feeding Times: ${report.patterns.feeding.preferredFeedingTimes.join(', ')}
Breast vs Bottle Ratio: ${report.patterns.feeding.breastVsBottleRatio}

NAPPY PATTERNS
--------------
Average Nappies per Day: ${report.patterns.nappy.averageNappiesPerDay}
Wet vs Dirty Ratio: ${report.patterns.nappy.wetVsDirtyRatio}
Longest Dry Stretch: ${report.patterns.nappy.longestDryStretch} hours
Typical Change Hours: ${report.patterns.nappy.typicalChangeHours.join(', ')}

GROWTH NOTES
------------
${report.summary.growthNotes.map(note => `• ${note}`).join('\n')}

MILESTONES
----------
${report.milestones.map(milestone => `• ${milestone}`).join('\n')}

CONCERNS TO DISCUSS WITH HEALTHCARE PROVIDER
-------------------------------------------
${report.concerns.length > 0 ? report.concerns.map(concern => `• ${concern}`).join('\n') : 'No concerns identified'}

This report was generated using the PAM Tracker Analytics system.
Please discuss any concerns with your healthcare provider.
    `.trim()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportHealthcareReport}
            variant="outline"
            size="sm"
            disabled={!healthcareReport}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Child Info & Time Range */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pam-red/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-pam-red" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{childName}</h2>
                <p className="text-sm text-gray-600">
                  Showing data for the last {timeRange} days
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <Button
                  key={days}
                  onClick={() => setTimeRange(days as 7 | 14 | 30)}
                  variant={timeRange === days ? 'default' : 'outline'}
                  size="sm"
                  className={timeRange === days ? 'bg-pam-red hover:bg-pam-red/90' : ''}
                >
                  {days}d
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'patterns', label: 'Patterns', icon: ArrowTrendingUpIcon },
            { key: 'insights', label: 'Insights', icon: LightBulbIcon },
            { key: 'reports', label: 'Reports', icon: DocumentArrowDownIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-pam-red text-pam-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          dailyAnalytics={dailyAnalytics}
          sleepPattern={sleepPattern}
          feedingPattern={feedingPattern}
          nappyPattern={nappyPattern}
        />
      )}

      {activeTab === 'patterns' && (
        <PatternsTab 
          sleepPattern={sleepPattern}
          feedingPattern={feedingPattern}
          nappyPattern={nappyPattern}
          dailyAnalytics={dailyAnalytics}
        />
      )}

      {activeTab === 'insights' && (
        <InsightsTab 
          weeklyInsights={weeklyInsights}
          sleepPattern={sleepPattern}
          feedingPattern={feedingPattern}
          nappyPattern={nappyPattern}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsTab 
          healthcareReport={healthcareReport}
          onExport={exportHealthcareReport}
        />
      )}
    </div>
  )
}

function OverviewTab({ 
  dailyAnalytics, 
  sleepPattern, 
  feedingPattern, 
  nappyPattern 
}: {
  dailyAnalytics: DailyAnalytics[]
  sleepPattern: SleepPattern | null
  feedingPattern: FeedingPattern | null
  nappyPattern: NappyPattern | null
}) {
  const totalDays = dailyAnalytics.length
  const avgFeedingsPerDay = totalDays > 0 ? dailyAnalytics.reduce((sum, d) => sum + d.feedingCount, 0) / totalDays : 0
  const avgSleepPerDay = sleepPattern?.totalSleepPerDay || 0
  const avgNappiesPerDay = nappyPattern?.averageNappiesPerDay || 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<HeartIcon className="w-5 h-5" />}
          title="Daily Feeds"
          value={Math.round(avgFeedingsPerDay * 10) / 10}
          subtitle={feedingPattern ? `${Math.round(feedingPattern.averageFeedingInterval / 60 * 10) / 10}h intervals` : 'No data'}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={<MoonIcon className="w-5 h-5" />}
          title="Daily Sleep"
          value={`${Math.round(avgSleepPerDay / 60 * 10) / 10}h`}
          subtitle={sleepPattern ? `${Math.round(sleepPattern.averageNapsPerDay)} naps/day` : 'No data'}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          icon={<SwatchIcon className="w-5 h-5" />}
          title="Daily Nappies"
          value={Math.round(avgNappiesPerDay * 10) / 10}
          subtitle={nappyPattern ? `${Math.round(nappyPattern.longestDryStretch * 10) / 10}h longest dry` : 'No data'}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <MetricCard
          icon={<ClockIcon className="w-5 h-5" />}
          title="Sleep Efficiency"
          value={`${sleepPattern?.sleepEfficiency || 0}%`}
          subtitle={sleepPattern?.nightSleepStart ? `Bedtime: ${sleepPattern.nightSleepStart}` : 'No pattern'}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Daily Trends Chart */}
      {dailyAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="feedingCount" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Feedings"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sleepCount" 
                    stackId="1"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6}
                    name="Sleep Sessions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="nappyCount" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6}
                    name="Nappy Changes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {dailyAnalytics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600">Start tracking activities to see analytics and patterns.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PatternsTab({ 
  sleepPattern, 
  feedingPattern, 
  nappyPattern, 
  dailyAnalytics 
}: {
  sleepPattern: SleepPattern | null
  feedingPattern: FeedingPattern | null
  nappyPattern: NappyPattern | null
  dailyAnalytics: DailyAnalytics[]
}) {
  return (
    <div className="space-y-6">
      {/* Sleep Patterns */}
      {sleepPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoonIcon className="w-5 h-5 text-purple-600" />
              Sleep Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(sleepPattern.averageSleepDuration)} min
                </div>
                <div className="text-sm text-gray-600">Average Sleep Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sleepPattern.averageNapsPerDay}
                </div>
                <div className="text-sm text-gray-600">Naps per Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(sleepPattern.longestSleepStretch / 60 * 10) / 10}h
                </div>
                <div className="text-sm text-gray-600">Longest Stretch</div>
              </div>
            </div>
            
            {sleepPattern.nightSleepStart && sleepPattern.morningWakeTime && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Sleep Schedule</h4>
                <p className="text-purple-700">
                  Typical bedtime: {sleepPattern.nightSleepStart}
                  <br />
                  Typical wake time: {sleepPattern.morningWakeTime}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feeding Patterns */}
      {feedingPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-green-600" />
              Feeding Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(feedingPattern.averageFeedingInterval / 60 * 10) / 10}h
                </div>
                <div className="text-sm text-gray-600">Average Interval</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {feedingPattern.averageFeedingDuration} min
                </div>
                <div className="text-sm text-gray-600">Average Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {feedingPattern.feedingsPerDay}
                </div>
                <div className="text-sm text-gray-600">Feeds per Day</div>
              </div>
            </div>

            {feedingPattern.preferredFeedingTimes.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Preferred Feeding Times</h4>
                <p className="text-green-700">
                  {feedingPattern.preferredFeedingTimes.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nappy Patterns */}
      {nappyPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SwatchIcon className="w-5 h-5 text-yellow-600" />
              Nappy Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {nappyPattern.averageNappiesPerDay}
                </div>
                <div className="text-sm text-gray-600">Changes per Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {nappyPattern.wetVsDirtyRatio}:1
                </div>
                <div className="text-sm text-gray-600">Wet to Dirty Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {nappyPattern.longestDryStretch}h
                </div>
                <div className="text-sm text-gray-600">Longest Dry Stretch</div>
              </div>
            </div>

            {nappyPattern.typicalChangeHours.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Typical Change Times</h4>
                <p className="text-yellow-700">
                  {nappyPattern.typicalChangeHours.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InsightsTab({ 
  weeklyInsights, 
  sleepPattern, 
  feedingPattern, 
  nappyPattern 
}: {
  weeklyInsights: WeeklyInsight[]
  sleepPattern: SleepPattern | null
  feedingPattern: FeedingPattern | null
  nappyPattern: NappyPattern | null
}) {
  return (
    <div className="space-y-6">
      {/* Weekly Insights */}
      {weeklyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5 text-blue-600" />
              This Week's Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.isPositive ? 'bg-green-50' : 'bg-orange-50'
                  }`}
                >
                  <span className="text-lg">{insight.emoji}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      insight.isPositive ? 'text-green-900' : 'text-orange-900'
                    }`}>
                      {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Pattern
                    </div>
                    <p className={`text-sm ${
                      insight.isPositive ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {insight.insight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      <div className="grid md:grid-cols-3 gap-6">
        {sleepPattern && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sleep Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sleep Efficiency</span>
                  <span className="font-medium">{sleepPattern.sleepEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Sleep</span>
                  <span className="font-medium">{Math.round(sleepPattern.totalSleepPerDay / 60)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Longest Stretch</span>
                  <span className="font-medium">{Math.round(sleepPattern.longestSleepStretch / 60)}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {feedingPattern && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feeding Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Feeds per Day</span>
                  <span className="font-medium">{feedingPattern.feedingsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="font-medium">{feedingPattern.averageFeedingDuration}min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Interval</span>
                  <span className="font-medium">{Math.round(feedingPattern.averageFeedingInterval / 60 * 10) / 10}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {nappyPattern && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nappy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Changes per Day</span>
                  <span className="font-medium">{nappyPattern.averageNappiesPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wet:Dirty Ratio</span>
                  <span className="font-medium">{nappyPattern.wetVsDirtyRatio}:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Longest Dry</span>
                  <span className="font-medium">{nappyPattern.longestDryStretch}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ReportsTab({ 
  healthcareReport, 
  onExport 
}: {
  healthcareReport: HealthcareReport | null
  onExport: () => void
}) {
  if (!healthcareReport) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DocumentArrowDownIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-600">Track more activities to generate comprehensive reports.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DocumentArrowDownIcon className="w-5 h-5 text-pam-red" />
              Healthcare Report
            </CardTitle>
            <Button onClick={onExport} className="bg-pam-red hover:bg-pam-red/90">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{healthcareReport.summary.totalDays}</div>
              <div className="text-sm text-gray-600">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthcareReport.summary.avgFeedingsPerDay}</div>
              <div className="text-sm text-gray-600">Avg Feeds/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{healthcareReport.summary.avgSleepHoursPerDay.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Avg Sleep/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{healthcareReport.summary.avgNappiesPerDay}</div>
              <div className="text-sm text-gray-600">Avg Nappies/Day</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      {healthcareReport.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Milestones & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthcareReport.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <span className="text-green-800">{milestone}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Notes */}
      {healthcareReport.summary.growthNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Growth & Development Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthcareReport.summary.growthNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span className="text-blue-800">{note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concerns */}
      {healthcareReport.concerns.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Areas to Discuss with Healthcare Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthcareReport.concerns.map((concern, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800">{concern}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800">
                This report can be shared with your GP, pediatrician, or maternal child health nurse.
              </p>
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