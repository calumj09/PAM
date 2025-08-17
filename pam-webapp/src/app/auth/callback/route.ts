import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Handle multiple Supabase URL parameter formats
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard/today'
  
  // For debugging
  console.log('Auth callback received:', {
    code,
    tokenHash,
    type,
    fullUrl: request.url
  })

  // Handle different Supabase callback formats
  if (code || tokenHash) {
    const supabase = await createClient()
    let error = null
    
    // Try different exchange methods based on parameters
    if (code) {
      // Standard OAuth code exchange
      const result = await supabase.auth.exchangeCodeForSession(code)
      error = result.error
    } else if (tokenHash && type === 'email') {
      // Email confirmation flow (uses token_hash)
      const result = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email'
      })
      error = result.error
    } else if (tokenHash && type === 'recovery') {
      // Password recovery flow (uses token_hash)
      const result = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      })
      error = result.error
    } else if (tokenHash && !type) {
      // Handle password reset without type parameter (legacy Supabase format)
      // Try recovery first since that's most likely for token_hash without type
      const result = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      })
      error = result.error
      
      // If recovery worked, redirect with session tokens
      if (!error) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const resetUrl = new URL(`${origin}/reset-password`)
          resetUrl.searchParams.set('access_token', session.access_token)
          resetUrl.searchParams.set('refresh_token', session.refresh_token)
          return NextResponse.redirect(resetUrl.toString())
        } else {
          return NextResponse.redirect(`${origin}/reset-password`)
        }
      }
    }
    
    if (!error) {
      // Handle password recovery flow
      if (type === 'recovery') {
        // Get the current session to pass tokens to reset password page
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const resetUrl = new URL(`${origin}/reset-password`)
          resetUrl.searchParams.set('access_token', session.access_token)
          resetUrl.searchParams.set('refresh_token', session.refresh_token)
          return NextResponse.redirect(resetUrl.toString())
        } else {
          return NextResponse.redirect(`${origin}/reset-password`)
        }
      }
      
      // Handle email confirmation flow
      if (type === 'email') {
        // After email confirmation, check if user needs onboarding
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()
          
          if (!profile) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
        
        // User confirmed email and has profile, go to dashboard
        return NextResponse.redirect(`${origin}/dashboard/today`)
      }
      
      // Handle normal auth flow
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        // If no profile, redirect to onboarding
        if (!profile) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      
      // Otherwise redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth callback error:', error)
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}