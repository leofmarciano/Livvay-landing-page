import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { findMatchingRoute, getDefaultDashboard } from '@/lib/rbac/config'
import { hasRoleAccess, parseRole } from '@/lib/rbac/types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const matchedRoute = findMatchingRoute(pathname)
  const isAuthPage = pathname.startsWith('/auth')

  // Only check auth for protected routes or auth pages
  if (!matchedRoute && !isAuthPage) {
    return supabaseResponse // Public route - no auth needed
  }

  // Get user with error handling
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // On error, treat as unauthenticated
  }

  const isAuthenticated = !!user
  const userRole = isAuthenticated
    ? parseRole(user?.app_metadata?.role) || 'afiliado'
    : undefined

  // Protected routes - require auth
  if (matchedRoute) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    if (!hasRoleAccess(userRole, matchedRoute.requiredRole)) {
      return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.nextUrl.origin))
    }
  }

  // Auth pages - redirect if already authenticated
  if (
    isAuthenticated &&
    isAuthPage &&
    !pathname.startsWith('/auth/confirm') &&
    !pathname.startsWith('/auth/error')
  ) {
    const next = request.nextUrl.searchParams.get('next')
    const dest = next?.startsWith('/') && !next.startsWith('//') ? next : getDefaultDashboard(userRole)
    return NextResponse.redirect(new URL(dest, request.nextUrl.origin))
  }

  return supabaseResponse
}
