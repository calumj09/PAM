import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google-calendar/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=oauth_error`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`)
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=config_error`)
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Google')
    }

    const googleUser = await userResponse.json()

    // Get primary calendar
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    let calendarName = 'Primary Calendar'
    if (calendarResponse.ok) {
      const calendar = await calendarResponse.json()
      calendarName = calendar.summary || 'Primary Calendar'
    }

    // Get current user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=auth_error`)
    }

    // Store calendar sync settings
    const { error: saveError } = await supabase
      .from('calendar_sync_settings')
      .upsert({
        user_id: user.id,
        provider_id: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        calendar_id: 'primary',
        sync_enabled: true,
        categories: {
          immunizations: true,
          checkups: true,
          milestones: true,
          appointments: true,
          me_time: false
        },
        sync_direction: 'to_external'
      }, {
        onConflict: 'user_id,provider_id'
      })

    if (saveError) {
      console.error('Error saving calendar settings:', saveError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=save_error`)
    }

    // Success - close popup window
    return new NextResponse(
      `
      <html>
        <head><title>Calendar Connected</title></head>
        <body>
          <script>
            window.opener?.postMessage({ success: true, provider: 'google' }, '*');
            window.close();
          </script>
          <p>Google Calendar connected successfully! You can close this window.</p>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Error in Google Calendar callback:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=callback_error`)
  }
}