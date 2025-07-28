import { createClient } from '@/lib/supabase/client'
import { differenceInMonths, format, addHours, startOfDay, endOfDay } from 'date-fns'
import { GrowthTrackingService } from './growth-tracking-service'

export type MedicationType = 'paracetamol' | 'ibuprofen' | 'antibiotic' | 'prescription' | 'vitamin' | 'other'
export type MedicationForm = 'liquid' | 'tablet' | 'suppository' | 'drops' | 'spray' | 'cream'
export type AdministrationMethod = 'oral' | 'rectal' | 'topical' | 'nasal'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface MedicationDatabase {
  id: string
  name: string
  generic_name?: string
  brand_names: string[]
  medication_type: MedicationType
  active_ingredient: string
  strength_mg?: number
  forms: MedicationForm[]
  age_restriction_months: number
  dosing_guidelines: any
  max_daily_dose_mg?: number
  dosing_interval_hours: number
  contraindications: string[]
  interactions: string[]
  side_effects: string[]
  tga_approved: boolean
  schedule_classification?: string
}

export interface ChildMedication {
  id: string
  child_id: string
  medication_id?: string
  custom_name?: string
  custom_strength_mg?: number
  custom_form?: string
  prescribed_by?: string
  prescription_date?: string
  prescription_number?: string
  pharmacy?: string
  dose_amount: number
  dose_unit: string
  frequency_per_day: number
  interval_hours: number
  start_date: string
  end_date?: string
  is_as_needed: boolean
  instructions?: string
  notes?: string
  food_instructions?: string
  is_active: boolean
  added_by: string
  created_at: string
  updated_at: string
  medication?: MedicationDatabase
}

export interface MedicationDose {
  id: string
  child_medication_id: string
  child_id: string
  dose_amount: number
  dose_unit: string
  administered_at: string
  administered_by: string
  administration_method: AdministrationMethod
  reason?: string
  child_weight_kg?: number
  temperature_celsius?: number
  was_scheduled: boolean
  reminder_id?: string
  notes?: string
  side_effects_noted?: string
  created_at: string
}

export interface MedicationReminder {
  id: string
  child_medication_id: string
  child_id: string
  reminder_time: string
  days_of_week: number[]
  advance_notice_minutes: number
  is_active: boolean
  next_reminder_at?: string
  last_sent_at?: string
  created_at: string
  updated_at: string
}

export interface MedicationAlert {
  id: string
  child_id: string
  alert_type: 'max_dose_exceeded' | 'interaction_warning' | 'allergy_warning' | 'age_restriction'
  severity: AlertSeverity
  medication_ids: string[]
  message: string
  recommendation?: string
  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
}

export interface DoseCalculation {
  recommended_dose_mg: number
  max_daily_dose_mg: number
  dosing_interval_hours: number
  medication_name: string
  strength_mg?: number
  error?: string
  min_age_months?: number
}

export interface SafetyCheck {
  safe: boolean
  warning?: string
  current_daily_total: number
  max_daily_dose?: number
  last_dose_time?: string
  minimum_interval_hours?: number
  next_safe_time?: string
}

export class MedicationService {
  
  /**
   * Initialize Australian medication database with common pediatric medications
   */
  static async initializeMedicationDatabase(): Promise<void> {
    const supabase = createClient()
    
    const australianMedications: Omit<MedicationDatabase, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Panadol (Paracetamol)',
        generic_name: 'Paracetamol',
        brand_names: ['Panadol', 'Dymadon', 'Panamax', 'Chemists Own'],
        medication_type: 'paracetamol',
        active_ingredient: 'Paracetamol',
        strength_mg: 160,
        forms: ['liquid', 'tablet', 'suppository'],
        age_restriction_months: 1,
        dosing_guidelines: {
          weight_based: '15mg/kg every 4-6 hours',
          max_daily: '60mg/kg/day',
          age_based: {
            '1-3months': '40-80mg every 4-6 hours',
            '3-6months': '80mg every 4-6 hours',
            '6-12months': '80-120mg every 4-6 hours',
            '1-2years': '120-180mg every 4-6 hours',
            '2-4years': '180-240mg every 4-6 hours'
          }
        },
        max_daily_dose_mg: 4000,
        dosing_interval_hours: 4,
        contraindications: ['Severe liver disease'],
        interactions: ['Warfarin', 'Alcohol'],
        side_effects: ['Rare allergic reactions', 'Liver damage with overdose'],
        tga_approved: true,
        schedule_classification: 'S2'
      },
      {
        name: 'Nurofen (Ibuprofen)',
        generic_name: 'Ibuprofen',
        brand_names: ['Nurofen', 'Advil', 'Brufen'],
        medication_type: 'ibuprofen',
        active_ingredient: 'Ibuprofen',
        strength_mg: 100,
        forms: ['liquid', 'tablet'],
        age_restriction_months: 3,
        dosing_guidelines: {
          weight_based: '5-10mg/kg every 6-8 hours',
          max_daily: '30mg/kg/day',
          age_based: {
            '3-6months': '50mg every 8 hours',
            '6-12months': '50-100mg every 6-8 hours',
            '1-2years': '100mg every 6-8 hours',
            '2-4years': '150mg every 6-8 hours',
            '4-7years': '200mg every 6-8 hours'
          }
        },
        max_daily_dose_mg: 1200,
        dosing_interval_hours: 6,
        contraindications: ['Asthma', 'Under 3 months', 'Dehydration', 'Kidney problems'],
        interactions: ['Aspirin', 'Blood thinners', 'ACE inhibitors'],
        side_effects: ['Stomach upset', 'Allergic reactions', 'Kidney problems'],
        tga_approved: true,
        schedule_classification: 'S2'
      },
      {
        name: 'Amoxicillin',
        generic_name: 'Amoxicillin',
        brand_names: ['Amoxil', 'Moxacin'],
        medication_type: 'antibiotic',
        active_ingredient: 'Amoxicillin',
        strength_mg: 250,
        forms: ['liquid', 'tablet'],
        age_restriction_months: 0,
        dosing_guidelines: {
          weight_based: '20-40mg/kg/day divided into 2-3 doses',
          duration: '7-10 days typically'
        },
        dosing_interval_hours: 8,
        contraindications: ['Penicillin allergy', 'Mononucleosis'],
        interactions: ['Methotrexate', 'Warfarin'],
        side_effects: ['Diarrhea', 'Nausea', 'Rash', 'Allergic reactions'],
        tga_approved: true,
        schedule_classification: 'S4'
      },
      {
        name: 'Vitamin D3 Drops',
        generic_name: 'Cholecalciferol',
        brand_names: ['Ostelin', 'Bio Island', 'Pentavite'],
        medication_type: 'vitamin',
        active_ingredient: 'Cholecalciferol',
        strength_mg: 0.4, // 400 IU = ~0.01mg, but using IU equivalent
        forms: ['drops'],
        age_restriction_months: 0,
        dosing_guidelines: {
          daily_dose: '400 IU (10 micrograms) daily for infants'
        },
        dosing_interval_hours: 24,
        contraindications: ['Hypercalcemia'],
        interactions: ['Thiazide diuretics'],
        side_effects: ['Rare: excessive calcium levels'],
        tga_approved: true,
        schedule_classification: 'S2'
      }
    ]
    
    // Insert medications if they don't exist
    for (const med of australianMedications) {
      const { data: existing } = await supabase
        .from('medication_database')
        .select('id')
        .eq('name', med.name)
        .single()
      
      if (!existing) {
        const { error } = await supabase
          .from('medication_database')
          .insert(med)
        
        if (error) {
          console.error('Error inserting medication:', med.name, error)
        }
      }
    }
  }

  /**
   * Get all medications from database
   */
  static async getMedicationDatabase(): Promise<MedicationDatabase[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('medication_database')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching medication database:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Search medications by name or type
   */
  static async searchMedications(query: string, type?: MedicationType): Promise<MedicationDatabase[]> {
    const supabase = createClient()
    
    let queryBuilder = supabase
      .from('medication_database')
      .select('*')
    
    if (type) {
      queryBuilder = queryBuilder.eq('medication_type', type)
    }
    
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,generic_name.ilike.%${query}%,brand_names.cs.{${query}}`)
    
    const { data, error } = await queryBuilder.order('name')
    
    if (error) {
      console.error('Error searching medications:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Add medication for a child
   */
  static async addChildMedication(medication: Omit<ChildMedication, 'id' | 'created_at' | 'updated_at'>): Promise<ChildMedication> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('child_medications')
      .insert({
        ...medication,
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        medication:medication_id (*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding child medication:', error)
      throw error
    }
    
    return data
  }

  /**
   * Get active medications for a child
   */
  static async getChildMedications(childId: string, includeInactive = false): Promise<ChildMedication[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('child_medications')
      .select(`
        *,
        medication:medication_id (*)
      `)
      .eq('child_id', childId)
    
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching child medications:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Calculate recommended dose for a child
   */
  static async calculateRecommendedDose(
    medicationId: string, 
    childId: string
  ): Promise<DoseCalculation> {
    const supabase = createClient()
    
    // Get child details for age calculation
    const { data: child } = await supabase
      .from('children')
      .select('date_of_birth')
      .eq('id', childId)
      .single()
    
    if (!child) {
      throw new Error('Child not found')
    }
    
    const ageInMonths = differenceInMonths(new Date(), new Date(child.date_of_birth))
    
    // Get latest weight from growth tracking
    let childWeightKg: number | null = null
    try {
      const measurements = await GrowthTrackingService.getChildMeasurements(childId, 1)
      if (measurements.length > 0 && measurements[0].weight_kg) {
        childWeightKg = measurements[0].weight_kg
        console.log(`Using latest weight for medication dosing: ${childWeightKg}kg`)
      } else {
        console.warn('No weight measurements found for child - using age-based dosing only')
      }
    } catch (error) {
      console.warn('Could not retrieve weight from growth tracking:', error)
    }
    
    // Call database function for dose calculation
    const { data, error } = await supabase
      .rpc('calculate_recommended_dose', {
        medication_id: medicationId,
        child_age_months: ageInMonths,
        child_weight_kg: childWeightKg
      })
    
    if (error) {
      console.error('Error calculating dose:', error)
      throw error
    }
    
    return data as DoseCalculation
  }

  /**
   * Check if a dose is safe to administer
   */
  static async checkDoseSafety(
    childId: string,
    medicationId: string,
    doseAmount: number,
    doseUnit: string
  ): Promise<SafetyCheck> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .rpc('check_dose_safety', {
        p_child_id: childId,
        p_medication_id: medicationId,
        p_dose_amount: doseAmount,
        p_dose_unit: doseUnit
      })
    
    if (error) {
      console.error('Error checking dose safety:', error)
      throw error
    }
    
    return data as SafetyCheck
  }

  /**
   * Get current weight for medication dosing
   */
  static async getCurrentWeightForDosing(childId: string): Promise<number | null> {
    try {
      const measurements = await GrowthTrackingService.getChildMeasurements(childId, 1)
      if (measurements.length > 0 && measurements[0].weight_kg) {
        return measurements[0].weight_kg
      }
      return null
    } catch (error) {
      console.error('Error retrieving weight for dosing:', error)
      return null
    }
  }

  /**
   * Log a medication dose with current weight
   */
  static async logMedicationDose(dose: Omit<MedicationDose, 'id' | 'created_at'>): Promise<MedicationDose> {
    const supabase = createClient()
    
    // Get current weight if not provided
    let enhancedDose = { ...dose }
    if (!dose.child_weight_kg) {
      const currentWeight = await this.getCurrentWeightForDosing(dose.child_id)
      if (currentWeight) {
        enhancedDose.child_weight_kg = currentWeight
      }
    }
    
    const { data, error } = await supabase
      .from('medication_doses')
      .insert(enhancedDose)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error logging dose:', error)
      throw error
    }
    
    // Check for any safety issues after logging
    await this.checkForAlerts(dose.child_id)
    
    return data
  }

  /**
   * Get medication history for a child
   */
  static async getMedicationHistory(
    childId: string,
    medicationId?: string,
    days = 7
  ): Promise<MedicationDose[]> {
    const supabase = createClient()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    let query = supabase
      .from('medication_doses')
      .select(`
        *,
        child_medication:child_medication_id (
          *,
          medication:medication_id (*)
        )
      `)
      .eq('child_id', childId)
      .gte('administered_at', startDate.toISOString())
    
    if (medicationId) {
      query = query.eq('child_medication.medication_id', medicationId)
    }
    
    const { data, error } = await query.order('administered_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching medication history:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Set up medication reminders
   */
  static async createMedicationReminder(
    reminder: Omit<MedicationReminder, 'id' | 'created_at' | 'updated_at' | 'next_reminder_at'>
  ): Promise<MedicationReminder> {
    const supabase = createClient()
    
    // Calculate next reminder time
    const now = new Date()
    const reminderTime = reminder.reminder_time
    const [hours, minutes] = reminderTime.split(':').map(Number)
    
    let nextReminder = new Date()
    nextReminder.setHours(hours, minutes, 0, 0)
    
    // If time has passed today, set for tomorrow
    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1)
    }
    
    const { data, error } = await supabase
      .from('medication_reminders')
      .insert({
        ...reminder,
        next_reminder_at: nextReminder.toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating reminder:', error)
      throw error
    }
    
    return data
  }

  /**
   * Get active reminders for a child
   */
  static async getChildReminders(childId: string): Promise<MedicationReminder[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('medication_reminders')
      .select(`
        *,
        child_medication:child_medication_id (
          *,
          medication:medication_id (*)
        )
      `)
      .eq('child_id', childId)
      .eq('is_active', true)
      .order('reminder_time')
    
    if (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Update medication status (active/inactive)
   */
  static async updateMedicationStatus(medicationId: string, isActive: boolean): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('child_medications')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', medicationId)
    
    if (error) {
      console.error('Error updating medication status:', error)
      throw error
    }
    
    // Also deactivate reminders if medication is deactivated
    if (!isActive) {
      await supabase
        .from('medication_reminders')
        .update({ is_active: false })
        .eq('child_medication_id', medicationId)
    }
  }

  /**
   * Check for medication safety alerts
   */
  static async checkForAlerts(childId: string): Promise<MedicationAlert[]> {
    const supabase = createClient()
    
    // Get all doses from today
    const todayStart = startOfDay(new Date()).toISOString()
    const todayEnd = endOfDay(new Date()).toISOString()
    
    const { data: todayDoses } = await supabase
      .from('medication_doses')
      .select(`
        *,
        child_medication:child_medication_id (
          *,
          medication:medication_id (*)
        )
      `)
      .eq('child_id', childId)
      .gte('administered_at', todayStart)
      .lte('administered_at', todayEnd)
    
    const alerts: Omit<MedicationAlert, 'id' | 'created_at'>[] = []
    
    // Check for maximum daily dose exceeded
    const medicationTotals = new Map<string, number>()
    
    todayDoses?.forEach(dose => {
      const medId = dose.child_medication?.medication_id
      if (medId) {
        const current = medicationTotals.get(medId) || 0
        medicationTotals.set(medId, current + dose.dose_amount)
      }
    })
    
    for (const [medId, totalDose] of medicationTotals) {
      const { data: medication } = await supabase
        .from('medication_database')
        .select('*')
        .eq('id', medId)
        .single()
      
      if (medication?.max_daily_dose_mg && totalDose > medication.max_daily_dose_mg) {
        alerts.push({
          child_id: childId,
          alert_type: 'max_dose_exceeded',
          severity: 'high',
          medication_ids: [medId],
          message: `Maximum daily dose exceeded for ${medication.name}. Given: ${totalDose}mg, Max: ${medication.max_daily_dose_mg}mg`,
          recommendation: 'Contact healthcare provider immediately. Do not give additional doses.',
          is_acknowledged: false
        })
      }
    }
    
    // Insert new alerts
    if (alerts.length > 0) {
      const { data: insertedAlerts, error } = await supabase
        .from('medication_alerts')
        .insert(alerts)
        .select('*')
      
      if (error) {
        console.error('Error creating alerts:', error)
        return []
      }
      
      return insertedAlerts || []
    }
    
    return []
  }

  /**
   * Get active alerts for a child
   */
  static async getChildAlerts(childId: string): Promise<MedicationAlert[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('medication_alerts')
      .select('*')
      .eq('child_id', childId)
      .eq('is_acknowledged', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching alerts:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('medication_alerts')
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
   * Get medication statistics for a child
   */
  static async getMedicationStats(childId: string, days = 30): Promise<any> {
    const supabase = createClient()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data: doses } = await supabase
      .from('medication_doses')
      .select(`
        *,
        child_medication:child_medication_id (
          *,
          medication:medication_id (*)
        )
      `)
      .eq('child_id', childId)
      .gte('administered_at', startDate.toISOString())
    
    const stats = {
      total_doses: doses?.length || 0,
      medications_used: new Set(doses?.map(d => d.child_medication?.medication_id).filter(Boolean)).size,
      most_common_reason: 'fever', // Would calculate from dose reasons
      adherence_rate: 85, // Would calculate from scheduled vs actual doses
      safety_alerts: 0
    }
    
    return stats
  }

  /**
   * Format dose for display
   */
  static formatDose(amount: number, unit: string): string {
    if (unit === 'ml') {
      return `${amount}ml`
    } else if (unit === 'mg') {
      return `${amount}mg`
    } else if (unit === 'tablets') {
      return amount === 1 ? '1 tablet' : `${amount} tablets`
    }
    return `${amount} ${unit}`
  }

  /**
   * Get next dose time for a medication
   */
  static getNextDoseTime(lastDoseTime: string, intervalHours: number): Date {
    return addHours(new Date(lastDoseTime), intervalHours)
  }

  /**
   * Format time until next dose
   */
  static formatTimeUntilNextDose(nextDoseTime: Date): string {
    const now = new Date()
    const diff = nextDoseTime.getTime() - now.getTime()
    
    if (diff <= 0) {
      return 'Due now'
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }
}