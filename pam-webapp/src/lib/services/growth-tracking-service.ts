import { createClient } from '@/lib/supabase/client'
import { differenceInWeeks, format, parseISO } from 'date-fns'

export type MeasurementType = 'height' | 'weight' | 'head_circumference' | 'weight_for_height'
export type MilestoneType = 'physical' | 'cognitive' | 'social' | 'motor'
export type MilestoneStatus = 'pending' | 'achieved' | 'delayed' | 'not_applicable'
export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'urgent'

export interface GrowthMeasurement {
  id: string
  child_id: string
  measurement_date: string
  age_weeks: number
  height_cm?: number
  weight_kg?: number
  head_circumference_cm?: number
  height_percentile?: number
  weight_percentile?: number
  head_circumference_percentile?: number
  weight_for_height_percentile?: number
  measured_by: string
  measurement_location?: string
  notes?: string
  is_estimated: boolean
  measurement_method?: string
  created_at: string
  updated_at: string
}

export interface GrowthMilestone {
  id: string
  child_id: string
  milestone_type: MilestoneType
  milestone_name: string
  description?: string
  achieved_date?: string
  expected_age_weeks: number
  age_achieved_weeks?: number
  status: MilestoneStatus
  nhmrc_guideline_reference?: string
  severity_if_delayed?: 'mild' | 'moderate' | 'significant'
  recorded_by: string
  verified_by_professional: boolean
  professional_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GrowthAlert {
  id: string
  child_id: string
  alert_type: 'low_percentile' | 'high_percentile' | 'rapid_change' | 'no_growth' | 'milestone_delay'
  severity: AlertSeverity
  measurement_type?: MeasurementType
  current_percentile?: number
  previous_percentile?: number
  percentile_change?: number
  title: string
  message: string
  recommendation?: string
  gp_consultation_recommended: boolean
  urgent_medical_attention: boolean
  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  triggered_by_measurement_id?: string
  created_at: string
}

export interface GrowthReferenceData {
  sex: 'male' | 'female'
  age_weeks: number
  measurement_type: MeasurementType
  p3: number
  p5: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p95: number
  p97: number
}

export interface GrowthChartData {
  age_weeks: number
  age_label: string
  height?: number
  weight?: number
  head_circumference?: number
  height_percentile?: number
  weight_percentile?: number
  head_circumference_percentile?: number
  reference_curves?: {
    p3: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p97: number
  }
}

export interface GrowthStats {
  latest_measurements: {
    height?: { value: number; percentile: number; date: string }
    weight?: { value: number; percentile: number; date: string }
    head_circumference?: { value: number; percentile: number; date: string }
  }
  growth_velocity: {
    height_cm_per_month?: number
    weight_kg_per_month?: number
  }
  milestones: {
    achieved: number
    pending: number
    delayed: number
  }
  alerts: {
    active: number
    high_priority: number
  }
}

export class GrowthTrackingService {
  
  /**
   * Initialize WHO/Australian growth reference data
   */
  static async initializeReferenceData(): Promise<void> {
    const supabase = createClient()
    
    // Sample WHO 2006 reference data for key age points (in production, would have complete dataset)
    const sampleReferenceData: Omit<GrowthReferenceData, 'id'>[] = [
      // Birth (0 weeks) - Male Height (cm)
      { sex: 'male', age_weeks: 0, measurement_type: 'height', p3: 46.1, p5: 46.8, p10: 47.9, p25: 49.0, p50: 49.9, p75: 50.8, p90: 51.8, p95: 52.3, p97: 52.7 },
      // Birth (0 weeks) - Male Weight (kg)
      { sex: 'male', age_weeks: 0, measurement_type: 'weight', p3: 2.5, p5: 2.6, p10: 2.8, p25: 3.0, p50: 3.3, p75: 3.6, p90: 3.9, p95: 4.1, p97: 4.2 },
      // Birth (0 weeks) - Male Head Circumference (cm)
      { sex: 'male', age_weeks: 0, measurement_type: 'head_circumference', p3: 32.6, p5: 33.0, p10: 33.6, p25: 34.3, p50: 34.9, p75: 35.6, p90: 36.2, p95: 36.6, p97: 36.9 },
      
      // 6 months (26 weeks) - Male
      { sex: 'male', age_weeks: 26, measurement_type: 'height', p3: 63.3, p5: 64.1, p10: 65.2, p25: 66.4, p50: 67.6, p75: 68.9, p90: 70.1, p95: 70.9, p97: 71.4 },
      { sex: 'male', age_weeks: 26, measurement_type: 'weight', p3: 6.4, p5: 6.7, p10: 7.1, p25: 7.5, p50: 7.9, p75: 8.4, p90: 9.0, p95: 9.4, p97: 9.7 },
      { sex: 'male', age_weeks: 26, measurement_type: 'head_circumference', p3: 41.5, p5: 42.0, p10: 42.6, p25: 43.3, p50: 43.9, p75: 44.6, p90: 45.2, p95: 45.6, p97: 45.9 },
      
      // 12 months (52 weeks) - Male
      { sex: 'male', age_weeks: 52, measurement_type: 'height', p3: 71.0, p5: 71.9, p10: 73.1, p25: 74.5, p50: 75.7, p75: 77.1, p90: 78.4, p95: 79.2, p97: 79.8 },
      { sex: 'male', age_weeks: 52, measurement_type: 'weight', p3: 7.7, p5: 8.1, p10: 8.6, p25: 9.2, p50: 9.6, p75: 10.2, p90: 10.9, p95: 11.3, p97: 11.7 },
      { sex: 'male', age_weeks: 52, measurement_type: 'head_circumference', p3: 44.6, p5: 45.1, p10: 45.7, p25: 46.4, p50: 47.0, p75: 47.7, p90: 48.3, p95: 48.7, p97: 49.0 },
      
      // 24 months (104 weeks) - Male
      { sex: 'male', age_weeks: 104, measurement_type: 'height', p3: 82.3, p5: 83.5, p10: 85.1, p25: 86.9, p50: 87.8, p75: 89.2, p90: 90.9, p95: 92.2, p97: 93.0 },
      { sex: 'male', age_weeks: 104, measurement_type: 'weight', p3: 9.7, p5: 10.2, p10: 10.8, p25: 11.5, p50: 12.2, p75: 13.0, p90: 13.9, p95: 14.5, p97: 15.0 },
      { sex: 'male', age_weeks: 104, measurement_type: 'head_circumference', p3: 46.0, p5: 46.5, p10: 47.1, p25: 47.8, p50: 48.4, p75: 49.1, p90: 49.7, p95: 50.1, p97: 50.4 },
      
      // Birth (0 weeks) - Female
      { sex: 'female', age_weeks: 0, measurement_type: 'height', p3: 45.4, p5: 46.1, p10: 47.1, p25: 48.2, p50: 49.1, p75: 50.0, p90: 50.9, p95: 51.4, p97: 51.7 },
      { sex: 'female', age_weeks: 0, measurement_type: 'weight', p3: 2.4, p5: 2.5, p10: 2.7, p25: 2.8, p50: 3.2, p75: 3.4, p90: 3.7, p95: 3.9, p97: 4.0 },
      { sex: 'female', age_weeks: 0, measurement_type: 'head_circumference', p3: 32.0, p5: 32.4, p10: 33.0, p25: 33.7, p50: 34.3, p75: 34.9, p90: 35.5, p95: 35.9, p97: 36.2 },
      
      // 6 months (26 weeks) - Female
      { sex: 'female', age_weeks: 26, measurement_type: 'height', p3: 61.8, p5: 62.6, p10: 63.8, p25: 65.0, p50: 66.1, p75: 67.3, p90: 68.5, p95: 69.2, p97: 69.8 },
      { sex: 'female', age_weeks: 26, measurement_type: 'weight', p3: 5.8, p5: 6.1, p10: 6.5, p25: 6.9, p50: 7.3, p75: 7.8, p90: 8.3, p95: 8.7, p97: 9.0 },
      { sex: 'female', age_weeks: 26, measurement_type: 'head_circumference', p3: 40.2, p5: 40.7, p10: 41.3, p25: 42.0, p50: 42.6, p75: 43.2, p90: 43.8, p95: 44.2, p97: 44.5 },
      
      // 12 months (52 weeks) - Female
      { sex: 'female', age_weeks: 52, measurement_type: 'height', p3: 68.9, p5: 69.8, p10: 71.0, p25: 72.4, p50: 74.0, p75: 75.3, p90: 76.6, p95: 77.5, p97: 78.0 },
      { sex: 'female', age_weeks: 52, measurement_type: 'weight', p3: 7.0, p5: 7.4, p10: 7.8, p25: 8.4, p50: 8.9, p75: 9.5, p90: 10.1, p95: 10.5, p97: 10.9 },
      { sex: 'female', age_weeks: 52, measurement_type: 'head_circumference', p3: 43.2, p5: 43.7, p10: 44.3, p25: 45.0, p50: 45.6, p75: 46.3, p90: 46.9, p95: 47.3, p97: 47.6 },
      
      // 24 months (104 weeks) - Female
      { sex: 'female', age_weeks: 104, measurement_type: 'height', p3: 80.0, p5: 81.2, p10: 82.8, p25: 84.6, p50: 86.4, p75: 88.1, p90: 89.8, p95: 91.0, p97: 91.9 },
      { sex: 'female', age_weeks: 104, measurement_type: 'weight', p3: 9.0, p5: 9.4, p10: 10.0, p25: 10.7, p50: 11.5, p75: 12.3, p90: 13.2, p95: 13.8, p97: 14.3 },
      { sex: 'female', age_weeks: 104, measurement_type: 'head_circumference', p3: 44.7, p5: 45.2, p10: 45.8, p25: 46.5, p50: 47.1, p75: 47.8, p90: 48.4, p95: 48.8, p97: 49.1 }
    ]
    
    // Insert reference data if it doesn't exist
    for (const refData of sampleReferenceData) {
      const { data: existing } = await supabase
        .from('growth_reference_data')
        .select('id')
        .eq('sex', refData.sex)
        .eq('age_weeks', refData.age_weeks)
        .eq('measurement_type', refData.measurement_type)
        .single()
      
      if (!existing) {
        const { error } = await supabase
          .from('growth_reference_data')
          .insert(refData)
        
        if (error) {
          console.error('Error inserting reference data:', error)
        }
      }
    }
  }

  /**
   * Add a growth measurement
   */
  static async addMeasurement(measurement: Omit<GrowthMeasurement, 'id' | 'created_at' | 'updated_at'>): Promise<GrowthMeasurement> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('growth_measurements')
      .insert({
        ...measurement,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
    
    if (error) {
      console.error('Error adding measurement:', error)
      throw error
    }
    
    return data
  }

  /**
   * Update a growth measurement
   */
  static async updateMeasurement(
    measurementId: string, 
    measurementData: Partial<Omit<GrowthMeasurement, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<GrowthMeasurement> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('growth_measurements')
      .update({
        ...measurementData,
        updated_at: new Date().toISOString()
      })
      .eq('id', measurementId)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating measurement:', error)
      throw error
    }
    
    return data
  }

  /**
   * Delete a growth measurement
   */
  static async deleteMeasurement(measurementId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('growth_measurements')
      .delete()
      .eq('id', measurementId)
    
    if (error) {
      console.error('Error deleting measurement:', error)
      throw error
    }
  }

  /**
   * Get growth measurements for a child
   */
  static async getChildMeasurements(childId: string, limit?: number): Promise<GrowthMeasurement[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('growth_measurements')
      .select('*')
      .eq('child_id', childId)
      .order('measurement_date', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching measurements:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Calculate percentile for a measurement
   */
  static async calculatePercentile(
    childSex: 'male' | 'female',
    ageWeeks: number,
    measurementType: MeasurementType,
    value: number
  ): Promise<number | null> {
    const supabase = createClient()
    
    // Get reference data for this age/sex/measurement type
    const { data: refData, error } = await supabase
      .from('growth_reference_data')
      .select('*')
      .eq('sex', childSex)
      .eq('measurement_type', measurementType)
      .eq('age_weeks', ageWeeks)
      .single()
    
    if (error || !refData) {
      // If exact age not found, find nearest ages and interpolate
      const { data: nearestData } = await supabase
        .from('growth_reference_data')
        .select('*')
        .eq('sex', childSex)
        .eq('measurement_type', measurementType)
        .order('age_weeks', { ascending: true })
        .limit(2)
      
      if (!nearestData || nearestData.length === 0) {
        return null
      }
      
      // Use the closest age for now (in production, would interpolate)
      const closest = nearestData.reduce((prev, curr) => 
        Math.abs(curr.age_weeks - ageWeeks) < Math.abs(prev.age_weeks - ageWeeks) ? curr : prev
      )
      
      return this.calculatePercentileFromReference(value, closest)
    }
    
    return this.calculatePercentileFromReference(value, refData)
  }

  /**
   * Calculate percentile from reference data
   */
  private static calculatePercentileFromReference(value: number, refData: GrowthReferenceData): number {
    if (value <= refData.p3) return 3
    if (value <= refData.p5) return 5
    if (value <= refData.p10) return 10
    if (value <= refData.p25) return 25
    if (value <= refData.p50) return 50
    if (value <= refData.p75) return 75
    if (value <= refData.p90) return 90
    if (value <= refData.p95) return 95
    if (value <= refData.p97) return 97
    return 99
  }

  /**
   * Generate chart data for visualization
   */
  static async generateChartData(
    childId: string,
    measurementType: MeasurementType,
    maxAge?: number
  ): Promise<GrowthChartData[]> {
    const supabase = createClient()
    
    // Get child details for sex
    const { data: child } = await supabase
      .from('children')
      .select('date_of_birth, sex')
      .eq('id', childId)
      .single()
    
    if (!child) {
      throw new Error('Child not found')
    }
    
    const childSex = child.sex || 'male' // Default to male if not specified
    
    // Get measurements
    const measurements = await this.getChildMeasurements(childId)
    
    // Get reference data for chart curves
    const ageLimit = maxAge || 156 // 3 years in weeks
    const { data: referenceData } = await supabase
      .from('growth_reference_data')
      .select('*')
      .eq('sex', childSex)
      .eq('measurement_type', measurementType)
      .lte('age_weeks', ageLimit)
      .order('age_weeks')
    
    const chartData: GrowthChartData[] = []
    
    // Create data points for reference curves
    referenceData?.forEach(ref => {
      const existingMeasurement = measurements.find(m => m.age_weeks === ref.age_weeks)
      const measurementValue = existingMeasurement ? this.getMeasurementValue(existingMeasurement, measurementType) : undefined
      const percentile = existingMeasurement ? this.getMeasurementPercentile(existingMeasurement, measurementType) : undefined
      
      chartData.push({
        age_weeks: ref.age_weeks,
        age_label: this.formatAgeLabel(ref.age_weeks),
        [measurementType]: measurementValue,
        [`${measurementType}_percentile`]: percentile,
        reference_curves: {
          p3: ref.p3,
          p10: ref.p10,
          p25: ref.p25,
          p50: ref.p50,
          p75: ref.p75,
          p90: ref.p90,
          p97: ref.p97
        }
      })
    })
    
    // Add actual measurements that don't align with reference points
    measurements.forEach(measurement => {
      if (!chartData.find(d => d.age_weeks === measurement.age_weeks)) {
        const measurementValue = this.getMeasurementValue(measurement, measurementType)
        const percentile = this.getMeasurementPercentile(measurement, measurementType)
        
        if (measurementValue) {
          chartData.push({
            age_weeks: measurement.age_weeks,
            age_label: this.formatAgeLabel(measurement.age_weeks),
            [measurementType]: measurementValue,
            [`${measurementType}_percentile`]: percentile
          })
        }
      }
    })
    
    return chartData.sort((a, b) => a.age_weeks - b.age_weeks)
  }

  /**
   * Get growth statistics for a child
   */
  static async getGrowthStats(childId: string): Promise<GrowthStats> {
    const measurements = await this.getChildMeasurements(childId, 10)
    const latest = measurements[0]
    
    // Calculate growth velocity from last two measurements
    let heightVelocity: number | undefined
    let weightVelocity: number | undefined
    
    if (measurements.length >= 2) {
      const current = measurements[0]
      const previous = measurements[1]
      const weeksDiff = current.age_weeks - previous.age_weeks
      const monthsDiff = weeksDiff / 4.33 // Average weeks per month
      
      if (current.height_cm && previous.height_cm && monthsDiff > 0) {
        heightVelocity = (current.height_cm - previous.height_cm) / monthsDiff
      }
      if (current.weight_kg && previous.weight_kg && monthsDiff > 0) {
        weightVelocity = (current.weight_kg - previous.weight_kg) / monthsDiff
      }
    }
    
    // Get milestones (would implement this)
    const milestones = { achieved: 0, pending: 0, delayed: 0 }
    
    // Get alerts
    const alerts = await this.getChildAlerts(childId)
    const highPriorityAlerts = alerts.filter(a => ['high', 'urgent'].includes(a.severity))
    
    return {
      latest_measurements: {
        height: latest?.height_cm ? {
          value: latest.height_cm,
          percentile: latest.height_percentile || 0,
          date: latest.measurement_date
        } : undefined,
        weight: latest?.weight_kg ? {
          value: latest.weight_kg,
          percentile: latest.weight_percentile || 0,
          date: latest.measurement_date
        } : undefined,
        head_circumference: latest?.head_circumference_cm ? {
          value: latest.head_circumference_cm,
          percentile: latest.head_circumference_percentile || 0,
          date: latest.measurement_date
        } : undefined
      },
      growth_velocity: {
        height_cm_per_month: heightVelocity,
        weight_kg_per_month: weightVelocity
      },
      milestones,
      alerts: {
        active: alerts.length,
        high_priority: highPriorityAlerts.length
      }
    }
  }

  /**
   * Get growth alerts for a child
   */
  static async getChildAlerts(childId: string): Promise<GrowthAlert[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('growth_alerts')
      .select('*')
      .eq('child_id', childId)
      .eq('is_acknowledged', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching growth alerts:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Acknowledge a growth alert
   */
  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('growth_alerts')
      .update({
        is_acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
    
    if (error) {
      console.error('Error acknowledging alert:', error)
      throw error
    }
  }

  /**
   * Generate growth report for healthcare provider
   */
  static async generateHealthcareReport(childId: string): Promise<string> {
    const measurements = await this.getChildMeasurements(childId)
    const stats = await this.getGrowthStats(childId)
    const alerts = await this.getChildAlerts(childId)
    
    // Get child details
    const supabase = createClient()
    const { data: child } = await supabase
      .from('children')
      .select('name, date_of_birth')
      .eq('id', childId)
      .single()
    
    let report = `GROWTH TRACKING REPORT\n`
    report += `========================\n\n`
    report += `Child: ${child?.name}\n`
    report += `Date of Birth: ${child ? format(parseISO(child.date_of_birth), 'dd/MM/yyyy') : 'Unknown'}\n`
    report += `Report Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n\n`
    
    report += `CURRENT MEASUREMENTS\n`
    report += `-------------------\n`
    if (stats.latest_measurements.height) {
      report += `Height: ${stats.latest_measurements.height.value}cm (${stats.latest_measurements.height.percentile}th percentile)\n`
    }
    if (stats.latest_measurements.weight) {
      report += `Weight: ${stats.latest_measurements.weight.value}kg (${stats.latest_measurements.weight.percentile}th percentile)\n`
    }
    if (stats.latest_measurements.head_circumference) {
      report += `Head Circumference: ${stats.latest_measurements.head_circumference.value}cm (${stats.latest_measurements.head_circumference.percentile}th percentile)\n`
    }
    
    report += `\nGROWTH VELOCITY\n`
    report += `--------------\n`
    if (stats.growth_velocity.height_cm_per_month) {
      report += `Height: ${stats.growth_velocity.height_cm_per_month.toFixed(1)}cm/month\n`
    }
    if (stats.growth_velocity.weight_kg_per_month) {
      report += `Weight: ${stats.growth_velocity.weight_kg_per_month.toFixed(2)}kg/month\n`
    }
    
    if (alerts.length > 0) {
      report += `\nCONCERNS/ALERTS\n`
      report += `--------------\n`
      alerts.forEach(alert => {
        report += `• ${alert.title} (${alert.severity.toUpperCase()})\n`
        report += `  ${alert.message}\n`
        if (alert.recommendation) {
          report += `  Recommendation: ${alert.recommendation}\n`
        }
      })
    }
    
    report += `\nMEASUREMENT HISTORY\n`
    report += `------------------\n`
    measurements.slice(0, 10).forEach(measurement => {
      report += `${format(parseISO(measurement.measurement_date), 'dd/MM/yyyy')}: `
      if (measurement.height_cm) report += `H: ${measurement.height_cm}cm `
      if (measurement.weight_kg) report += `W: ${measurement.weight_kg}kg `
      if (measurement.head_circumference_cm) report += `HC: ${measurement.head_circumference_cm}cm `
      report += `\n`
    })
    
    return report
  }

  /**
   * Helper methods
   */
  private static getMeasurementValue(measurement: GrowthMeasurement, type: MeasurementType): number | undefined {
    switch (type) {
      case 'height': return measurement.height_cm
      case 'weight': return measurement.weight_kg
      case 'head_circumference': return measurement.head_circumference_cm
      default: return undefined
    }
  }

  private static getMeasurementPercentile(measurement: GrowthMeasurement, type: MeasurementType): number | undefined {
    switch (type) {
      case 'height': return measurement.height_percentile
      case 'weight': return measurement.weight_percentile
      case 'head_circumference': return measurement.head_circumference_percentile
      default: return undefined
    }
  }

  private static formatAgeLabel(weeks: number): string {
    if (weeks < 4) {
      return `${weeks}w`
    } else if (weeks < 52) {
      const months = Math.floor(weeks / 4.33)
      return `${months}m`
    } else {
      const years = Math.floor(weeks / 52)
      const remainingMonths = Math.floor((weeks - years * 52) / 4.33)
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`
    }
  }

  /**
   * Format measurement for display
   */
  static formatMeasurement(value: number, type: MeasurementType): string {
    switch (type) {
      case 'height':
      case 'head_circumference':
        return `${value.toFixed(1)}cm`
      case 'weight':
        return `${value.toFixed(2)}kg`
      default:
        return value.toString()
    }
  }

  /**
   * Get percentile color for UI
   */
  static getPercentileColor(percentile: number): string {
    if (percentile < 3) return 'text-red-600'
    if (percentile < 10) return 'text-orange-600'
    if (percentile > 97) return 'text-red-600'
    if (percentile > 90) return 'text-orange-600'
    return 'text-green-600'
  }

  /**
   * Get percentile description
   */
  static getPercentileDescription(percentile: number): string {
    if (percentile < 3) return 'Below normal range - consider GP consultation'
    if (percentile < 10) return 'Lower than average'
    if (percentile <= 25) return 'Below average'
    if (percentile <= 75) return 'Average range'
    if (percentile <= 90) return 'Above average'
    if (percentile <= 97) return 'Higher than average'
    return 'Above normal range - consider GP consultation'
  }
}