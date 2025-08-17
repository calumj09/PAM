import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname === '/onboarding')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user has completed onboarding
  if (user) {
    // Allow access to onboarding page itself
    if (request.nextUrl.pathname === '/onboarding') {
      return response
    }

    // Check if user has children (completed onboarding)
    try {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      const hasCompletedOnboarding = children && children.length > 0

      // Redirect to onboarding if not completed and trying to access dashboard
      if (!hasCompletedOnboarding && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Redirect to dashboard if completed onboarding and trying to access auth pages
      if (hasCompletedOnboarding && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard/today', request.url))
      }

      // Redirect completed users away from onboarding
      if (hasCompletedOnboarding && request.nextUrl.pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard/today', request.url))
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // Continue with original logic if database check fails
    }

    // Redirect old dashboard to new Today page
    if (request.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard/today', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}