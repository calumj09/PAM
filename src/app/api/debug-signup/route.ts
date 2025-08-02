import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = await createClient()
    
    console.log('Testing signup for:', email)
    
    // Try to sign up a test user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'test123456789',
      options: {
        emailRedirectTo: 'https://pam-7xeo.onrender.com/auth/callback?type=email'
      }
    })
    
    console.log('Signup result:', { data, error })
    
    return NextResponse.json({
      success: !error,
      data: {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmedAt: data.user.email_confirmed_at,
          identities: data.user.identities?.length || 0
        } : null,
        session: data.session ? 'Session created' : 'No session'
      },
      error: error ? {
        message: error.message,
        status: error.status
      } : null,
      diagnostics: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        redirectUrl: 'https://pam-7xeo.onrender.com/auth/callback?type=email',
        possibleIssues: [
          'Email confirmations disabled in Supabase',
          'Rate limiting on email service',
          'Email templates misconfigured',
          'Site URL mismatch',
          'SMTP issues'
        ]
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}