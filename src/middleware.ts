import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Admin sayfalarına erişim kontrolü
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!token || !["ADMIN", "FOUNDER"].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Auth kontrolü
  if (
    !token &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/api/admin'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*']
} 