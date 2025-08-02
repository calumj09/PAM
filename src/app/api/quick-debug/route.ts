import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Quick Debug - Email Confirmation Issues',
    timestamp: new Date().toISOString(),
    
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      projectId: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.replace('https://', ''),
    },
    
    checkList: {
      step1: 'Go to https://app.supabase.com/project/phlyclrvbrxiszjxorza/auth/providers',
      step2: 'Click on Email provider',
      step3: 'Ensure "Enable signup" is ON',
      step4: 'Ensure "Enable email confirmations" is ON',
      step5: 'If confirmations are OFF, that explains why no emails are sent',
      step6: 'Save changes and try signup again'
    },
    
    urlConfig: {
      step1: 'Go to https://app.supabase.com/project/phlyclrvbrxiszjxorza/auth/url-configuration',
      step2: 'Site URL should be: https://pam-7xeo.onrender.com',
      step3: 'Add redirect URL: https://pam-7xeo.onrender.com/auth/callback',
      step4: 'Save changes'
    },
    
    emailTemplates: {
      step1: 'Go to https://app.supabase.com/project/phlyclrvbrxiszjxorza/auth/templates',
      step2: 'Click "Confirm signup" template',
      step3: 'Replace content with: <h2>Confirm your signup</h2><p>Follow this link to confirm your user:</p><p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>',
      step4: 'Save template'
    },
    
    mostLikelyIssue: 'Email confirmations are probably DISABLED in Supabase. Check step 4 in checkList above.',
    
    testAfterChanges: 'After making changes, try signing up with a new email address'
  })
}