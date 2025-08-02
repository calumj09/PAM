import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check Supabase project configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const projectRef = supabaseUrl ? supabaseUrl.split('.')[0].replace('https://', '') : 'unknown'
    
    // Try to get auth settings (this might not work due to permissions)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      projectInfo: {
        url: supabaseUrl,
        projectRef: projectRef,
        dashboardUrl: `https://app.supabase.com/project/${projectRef}/auth/users`
      },
      currentUser: authData?.user || null,
      authError: authError?.message || null,
      emailSettings: {
        confirmationRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pam-7xeo.onrender.com'}/auth/callback`,
        passwordResetRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pam-7xeo.onrender.com'}/auth/callback?type=recovery`
      },
      instructions: [
        '1. Go to your Supabase Dashboard using the link above',
        '2. Check Authentication → Settings → Email Auth',
        '3. Ensure "Enable email confirmations" is ON if you want confirmations',
        '4. Check Authentication → Email Templates',
        '5. Make sure the Confirm signup template has the correct URL pattern',
        '6. The URL should include: {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email'
      ]
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}