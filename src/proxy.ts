import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isAdminApiRoute =
    pathname.startsWith('/api/admin') && !pathname.includes('/api/admin/auth')

  if (isAdminRoute || isAdminApiRoute) {
    const session = req.cookies.get(SESSION_COOKIE)
    if (!session || session.value !== 'authenticated') {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
