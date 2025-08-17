'use client'

import { useState, useEffect } from 'react'
import { 
  GrowthTrackingService,
  GrowthChartData,
  MeasurementType
} from '@/lib/services/growth-tracking-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { 
  ChartBarIcon,
  ArrowsPointingOutIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface GrowthChartProps {
  childId: string
  measurementType: MeasurementType
  childSex: 'male' | 'female'
}

export function GrowthChart({ childId, measurementType, childSex }: GrowthChartProps) {
  const [chartData, setChartData] = useState<GrowthChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'full' | 'recent'>('recent')
  const [showPercentiles, setShowPercentiles] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [childId, measurementType, viewMode])

  const loadChartData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const maxAge = viewMode === 'recent' ? 52 : 156 // 1 year vs 3 years
      const data = await GrowthTrackingService.generateChartData(
        childId, 
        measurementType, 
        maxAge
      )
      setChartData(data)
      
    } catch (error: any) {
      console.error('Error loading chart data:', error)
      setError(error.message || 'Failed to load chart data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatXAxisLabel = (value: number) => {
    if (value < 4) return `${value}w`
    if (value < 52) return `${Math.floor(value / 4.33)}m`
    const years = Math.floor(value / 52)
    const months = Math.floor((value - years * 52) / 4.33)
    return months > 0 ? `${years}y${months}m` : `${years}y`
  }

  const formatYAxisLabel = (value: number) => {
    switch (measurementType) {
      case 'height':
      case 'head_circumference':
        return `${value}cm`
      case 'weight':
        return `${value}kg`
      default:
        return value.toString()
    }
  }

  const getYAxisDomain = () => {
    if (!chartData.length) return ['auto', 'auto']
    
    const values = chartData.map(d => d[measurementType]).filter(Boolean) as number[]
    const refValues = chartData.flatMap(d => 
      d.reference_curves ? Object.values(d.reference_curves) : []
    )
    
    const allValues = [...values, ...refValues]
    if (allValues.length === 0) return ['auto', 'auto']
    
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1
    
    return [Math.max(0, min - padding), max + padding]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    const ageLabel = formatXAxisLabel(label)
    
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">Age: {ageLabel}</p>
        {data[measurementType] && (
          <div className="text-sm space-y-1 mt-2">
            <p className="text-pam-red font-medium">
              {measurementType === 'height' ? 'Height' : 
               measurementType === 'weight' ? 'Weight' : 
               'Head Circumference'}: {formatYAxisLabel(data[measurementType])}
            </p>
            {data[`${measurementType}_percentile`] && (
              <p className="text-gray-600">
                {data[`${measurementType}_percentile`]}th percentile
              </p>
            )}
          </div>
        )}
        {showPercentiles && data.reference_curves && (
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>Reference curves:</p>
            <p>97th: {formatYAxisLabel(data.reference_curves.p97)}</p>
            <p>90th: {formatYAxisLabel(data.reference_curves.p90)}</p>
            <p>75th: {formatYAxisLabel(data.reference_curves.p75)}</p>
            <p>50th: {formatYAxisLabel(data.reference_curves.p50)}</p>
            <p>25th: {formatYAxisLabel(data.reference_curves.p25)}</p>
            <p>10th: {formatYAxisLabel(data.reference_curves.p10)}</p>
            <p>3rd: {formatYAxisLabel(data.reference_curves.p3)}</p>
          </div>
        )}
      </div>
    )
  }

  const getChartTitle = () => {
    const typeLabel = measurementType === 'height' ? 'Height' : 
                     measurementType === 'weight' ? 'Weight' : 
                     'Head Circumference'
    return `${typeLabel} Growth Chart - ${childSex === 'male' ? 'Male' : 'Female'}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chart Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadChartData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasData = chartData.some(d => d[measurementType])

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600">
            Add some {measurementType} measurements to see the growth chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getChartTitle()}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPercentiles(!showPercentiles)}
              variant="outline"
              size="sm"
            >
              {showPercentiles ? 'Hide' : 'Show'} Percentiles
            </Button>
            <Button
              onClick={() => setViewMode(viewMode === 'recent' ? 'full' : 'recent')}
              variant="outline"
              size="sm"
            >
              <ArrowsPointingOutIcon className="w-4 h-4 mr-1" />
              {viewMode === 'recent' ? 'Full View' : 'Recent'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="age_weeks"
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisLabel}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                domain={getYAxisDomain()}
                tickFormatter={formatYAxisLabel}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Percentile curves */}
              {showPercentiles && (
                <>
                  <Line
                    dataKey="reference_curves.p97"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="97th percentile"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p90"
                    stroke="#f97316"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="90th percentile"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p75"
                    stroke="#eab308"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    name="75th percentile"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p50"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="50th percentile (median)"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p25"
                    stroke="#eab308"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    name="25th percentile"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p10"
                    stroke="#f97316"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="10th percentile"
                    connectNulls={false}
                  />
                  <Line
                    dataKey="reference_curves.p3"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="3rd percentile"
                    connectNulls={false}
                  />
                </>
              )}

              {/* Child's actual measurements */}
              <Line
                dataKey={measurementType}
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
                name="Your child's measurements"
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to read this chart:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Red line:</strong> Your child's actual measurements</li>
                <li>• <strong>Colored curves:</strong> Australian/WHO growth percentiles</li>
                <li>• <strong>Green line (50th):</strong> Average for Australian children</li>
                <li>• <strong>Normal range:</strong> Between 3rd and 97th percentiles</li>
                <li>• <strong>Trend matters:</strong> Consistent growth along a percentile line is healthy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent measurements summary */}
        {hasData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Recent Trend</h4>
            <div className="text-sm text-gray-600">
              {(() => {
                const recentData = chartData
                  .filter(d => d[measurementType])
                  .slice(-3)
                
                if (recentData.length < 2) {
                  return <p>Not enough data to show trend. Add more measurements.</p>
                }

                const latest = recentData[recentData.length - 1]
                const previous = recentData[recentData.length - 2]
                const latestValue = latest[measurementType]!
                const previousValue = previous[measurementType]!
                const change = latestValue - previousValue
                const percentChange = ((change / previousValue) * 100)

                const isPositive = change > 0
                const changeText = isPositive ? 'increased' : 'decreased'
                const changeColor = isPositive ? 'text-green-600' : 'text-red-600'

                return (
                  <p>
                    Latest measurement has <span className={changeColor}>{changeText}</span> by{' '}
                    <strong>{Math.abs(change).toFixed(measurementType === 'weight' ? 2 : 1)}</strong>
                    {measurementType === 'weight' ? 'kg' : 'cm'} since last measurement
                    ({Math.abs(percentChange).toFixed(1)}% change).
                  </p>
                )
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}