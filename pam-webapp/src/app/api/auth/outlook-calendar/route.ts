import { NextRequest, NextResponse } from 'next/server'

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/outlook-calendar/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scopes = searchParams.get('scopes') || 'https://graph.microsoft.com/calendars.readwrite'
    const state = searchParams.get('state') || 'default'

    if (!MICROSOFT_CLIENT_ID) {
      return NextResponse.json({ error: 'Microsoft OAuth not configured' }, { status: 500 })
    }

    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    authUrl.searchParams.append('client_id', MICROSOFT_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', scopes)
    authUrl.searchParams.append('response_mode', 'query')
    authUrl.searchParams.append('state', state)

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}