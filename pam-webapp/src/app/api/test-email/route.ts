import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the Supabase instance info
    const { data: { user } } = await supabase.auth.getUser()
    
    // Test creating a user to see what happens
    const testEmail = `test-${Date.now()}@example.com`
    const { data: testData, error: testError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        emailRedirectTo: 'https://pam-7xeo.onrender.com/auth/callback'
      }
    })
    
    return NextResponse.json({
      currentUser: user,
      testSignup: {
        data: testData,
        error: testError
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      renderUrl: process.env.RENDER_EXTERNAL_URL || 'Not set',
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}