// Voice Recognition Service for Baby Tracking

import { VoiceCommand, VoiceRecognitionResult } from '@/types/tracker'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

export class VoiceService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static recognition: any = null
  private static isListening = false

  /**
   * Check if speech recognition is supported
   */
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * Initialize speech recognition
   */
  static initialize(): void {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported in this browser')
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    
    // Configure recognition settings
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-AU' // Australian English
    this.recognition.maxAlternatives = 1
  }

  /**
   * Start listening for voice commands
   */
  static async startListening(): Promise<VoiceRecognitionResult> {
    if (!this.recognition) {
      this.initialize()
    }

    if (this.isListening) {
      return { success: false, error: 'Already listening' }
    }

    return new Promise((resolve) => {
      this.isListening = true

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim()
        const confidence = event.results[0][0].confidence

        console.log('Voice input received:', transcript, 'Confidence:', confidence)

        const command = this.parseCommand(transcript, confidence)
        
        if (command) {
          resolve({ success: true, command })
        } else {
          resolve({ 
            success: false, 
            error: 'Could not understand command',
            suggestions: this.getSuggestions()
          })
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        resolve({ 
          success: false, 
          error: `Speech recognition error: ${event.error}`,
          suggestions: this.getSuggestions()
        })
      }

      this.recognition.onend = () => {
        this.isListening = false
      }

      try {
        this.recognition.start()
      } catch {
        this.isListening = false
        resolve({ success: false, error: 'Failed to start listening' })
      }
    })
  }

  /**
   * Stop listening
   */
  static stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * Parse voice command into structured data
   */
  private static parseCommand(transcript: string, confidence: number): VoiceCommand | null {
    // Minimum confidence threshold
    if (confidence < 0.6) {
      return null
    }

    const command: VoiceCommand = {
      text: transcript,
      confidence,
      time: new Date()
    }

    // Feeding commands
    if (this.matchesPattern(transcript, ['breastfeed', 'breast feed', 'nursing', 'nurse'])) {
      command.activity_type = 'breastfeeding'
      command.duration = this.extractDuration(transcript) || 15
      const side = this.extractBreastSide(transcript)
      if (side) command.details = { breast_side: side }
      return command
    }

    if (this.matchesPattern(transcript, ['bottle', 'bottle feed', 'formula'])) {
      command.activity_type = 'bottle'
      command.duration = this.extractDuration(transcript) || 10
      const amount = this.extractAmount(transcript)
      if (amount) command.details = { amount_ml: amount }
      return command
    }

    if (this.matchesPattern(transcript, ['solid food', 'solids', 'eating', 'food'])) {
      command.activity_type = 'solid'
      const foods = this.extractFoodItems(transcript)
      if (foods.length > 0) command.details = { food_items: foods }
      return command
    }

    // Diaper commands
    if (this.matchesPattern(transcript, ['wet diaper', 'wet nappy', 'pee', 'wee'])) {
      command.activity_type = 'diaper-wet'
      return command
    }

    if (this.matchesPattern(transcript, ['dirty diaper', 'dirty nappy', 'poo', 'poop', 'soil'])) {
      command.activity_type = 'diaper-dirty'
      const consistency = this.extractConsistency(transcript)
      if (consistency) command.details = { consistency }
      return command
    }

    // Sleep commands
    if (this.matchesPattern(transcript, ['sleep', 'nap', 'sleeping', 'bedtime', 'bed time'])) {
      if (this.matchesPattern(transcript, ['start', 'begin', 'going to'])) {
        command.activity_type = 'sleep-start'
      } else if (this.matchesPattern(transcript, ['end', 'finish', 'wake', 'woke'])) {
        command.activity_type = 'sleep-end'
      } else {
        command.activity_type = 'sleep-start' // Default to start
      }
      
      const duration = this.extractDuration(transcript)
      if (duration) command.duration = duration
      
      const quality = this.extractSleepQuality(transcript)
      if (quality) command.details = { sleep_quality: quality }
      
      return command
    }

    // Other activities
    if (this.matchesPattern(transcript, ['tummy time', 'tummy'])) {
      command.activity_type = 'tummy-time'
      command.duration = this.extractDuration(transcript) || 10
      return command
    }

    if (this.matchesPattern(transcript, ['bath', 'bath time', 'bathing'])) {
      command.activity_type = 'bath'
      command.duration = this.extractDuration(transcript) || 15
      return command
    }

    // If no specific pattern matched, return null
    return null
  }

  /**
   * Check if transcript matches any of the given patterns
   */
  private static matchesPattern(transcript: string, patterns: string[]): boolean {
    return patterns.some(pattern => transcript.includes(pattern))
  }

  /**
   * Extract duration from transcript (e.g., "15 minutes", "half hour")
   */
  private static extractDuration(transcript: string): number | null {
    // Look for "X minutes" or "X mins"
    const minuteMatch = transcript.match(/(\d+)\s*(?:minute|min)/i)
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10)
    }

    // Look for "X hours"
    const hourMatch = transcript.match(/(\d+)\s*(?:hour|hr)/i)
    if (hourMatch) {
      return parseInt(hourMatch[1], 10) * 60
    }

    // Look for "half hour" or "30 minutes"
    if (transcript.includes('half hour') || transcript.includes('30 minutes')) {
      return 30
    }

    // Look for "quarter hour" or "15 minutes"
    if (transcript.includes('quarter hour') || transcript.includes('15 minutes')) {
      return 15
    }

    return null
  }

  /**
   * Extract bottle amount from transcript
   */
  private static extractAmount(transcript: string): number | null {
    const match = transcript.match(/(\d+)\s*(?:ml|millilitre|ounce|oz)/i)
    if (match) {
      let amount = parseInt(match[1], 10)
      // Convert ounces to ml if needed
      if (transcript.includes('ounce') || transcript.includes('oz')) {
        amount = Math.round(amount * 29.5735)
      }
      return amount
    }
    return null
  }

  /**
   * Extract breast side from transcript
   */
  private static extractBreastSide(transcript: string): string | null {
    if (transcript.includes('left')) return 'left'
    if (transcript.includes('right')) return 'right'
    if (transcript.includes('both')) return 'both'
    return null
  }

  /**
   * Extract food items from transcript
   */
  private static extractFoodItems(transcript: string): string[] {
    const commonFoods = [
      'banana', 'apple', 'pear', 'avocado', 'sweet potato', 'carrot',
      'broccoli', 'pumpkin', 'rice', 'oats', 'bread', 'pasta',
      'chicken', 'beef', 'fish', 'egg', 'cheese', 'yogurt'
    ]

    return commonFoods.filter(food => transcript.includes(food))
  }

  /**
   * Extract diaper consistency from transcript
   */
  private static extractConsistency(transcript: string): string | null {
    if (transcript.includes('liquid') || transcript.includes('runny')) return 'liquid'
    if (transcript.includes('soft')) return 'soft'
    if (transcript.includes('normal')) return 'normal'
    if (transcript.includes('hard') || transcript.includes('firm')) return 'hard'
    return null
  }

  /**
   * Extract sleep quality from transcript
   */
  private static extractSleepQuality(transcript: string): string | null {
    if (transcript.includes('excellent') || transcript.includes('great')) return 'excellent'
    if (transcript.includes('good') || transcript.includes('well')) return 'good'
    if (transcript.includes('fair') || transcript.includes('okay')) return 'fair'
    if (transcript.includes('poor') || transcript.includes('bad') || transcript.includes('restless')) return 'poor'
    return null
  }

  /**
   * Get command suggestions for users
   */
  private static getSuggestions(): string[] {
    return [
      'Try saying: "Breastfeed for 15 minutes"',
      'Try saying: "Bottle feed 120ml"',
      'Try saying: "Wet diaper change"',
      'Try saying: "Start sleep" or "End sleep"',
      'Try saying: "Tummy time for 10 minutes"',
      'Try saying: "Solid food banana and rice"'
    ]
  }

  /**
   * Get current listening status
   */
  static getListeningStatus(): boolean {
    return this.isListening
  }
}