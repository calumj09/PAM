import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No authenticated user',
        authError 
      }, { status: 401 })
    }
    
    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Check children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
    
    // Check all profiles (for debugging)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, email, state_territory, created_at')
      .limit(10)
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile || 'No profile found',
      profileError,
      children: children || [],
      childrenError,
      allProfiles: allProfiles || [],
      allProfilesError
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}