import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated'

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}

export async function requireAdminSession(): Promise<void> {
  const isAuth = await getAdminSession()
  if (!isAuth) redirect('/admin/login')
}

export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD
}
