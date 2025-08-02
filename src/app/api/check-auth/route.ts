import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = await createClient()
    
    // Try to resend confirmation email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (resendError) {
      console.error('Resend error:', resendError)
      return NextResponse.json({ 
        error: resendError.message,
        details: resendError
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Confirmation email resent successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}