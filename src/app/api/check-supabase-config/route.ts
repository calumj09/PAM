import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.split('.')[0].replace('https://', '')
  
  return NextResponse.json({
    message: 'Supabase Configuration Check',
    projectRef,
    dashboardLinks: {
      authSettings: `https://app.supabase.com/project/${projectRef}/auth/users`,
      emailTemplates: `https://app.supabase.com/project/${projectRef}/auth/templates`,
      urlConfiguration: `https://app.supabase.com/project/${projectRef}/auth/url-configuration`
    },
    currentConfiguration: {
      siteUrl: 'https://pam-7xeo.onrender.com',
      redirectUrls: [
        'https://pam-7xeo.onrender.com/auth/callback'
      ]
    },
    requiredEmailTemplateSettings: {
      confirmSignup: {
        subject: 'Confirm Your Signup',
        redirectTo: '{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email'
      },
      resetPassword: {
        subject: 'Reset Your Password', 
        redirectTo: '{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery'
      }
    },
    authProviderSettings: {
      email: {
        enableSignup: true,
        enableEmailConfirmation: true,
        doubleConfirmChanges: false
      }
    },
    troubleshooting: [
      '1. Go to the Email Templates link above',
      '2. Check "Confirm signup" template',
      '3. Ensure redirect URL includes: /auth/callback?token_hash={{ .TokenHash }}&type=email',
      '4. Check "Reset password" template',
      '5. Ensure redirect URL includes: /auth/callback?token_hash={{ .TokenHash }}&type=recovery',
      '6. Go to URL Configuration link',
      '7. Ensure Site URL is: https://pam-7xeo.onrender.com',
      '8. Add redirect URL: https://pam-7xeo.onrender.com/auth/callback'
    ]
  })
}