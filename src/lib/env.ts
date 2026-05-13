import type { SiteSettings } from '@/types'

export const DEFAULT_DOLLAR_RATE = 1200

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp_number: '5491100000000',
  whatsapp_message: 'Hola! Me interesa: ',
  store_name: 'Store RQTA',
  store_tagline: '',
  trade_in_enabled: true,
  show_usd_price: true,
  show_installments: true,
}

type DatabaseEnvValidation = {
  ok: boolean
  reason?: 'missing' | 'invalid_url' | 'placeholder'
  url?: string
}

function isPlaceholderDatabaseUrl(parsed: URL): boolean {
  return (
    parsed.hostname === 'host' ||
    parsed.username === 'user' ||
    parsed.password === 'password' ||
    parsed.pathname === '/dbname' ||
    parsed.hostname.includes('tu_proyecto')
  )
}

export function validateDatabaseEnv(url = process.env.DATABASE_URL): DatabaseEnvValidation {
  if (!url || !url.trim()) {
    return { ok: false, reason: 'missing' }
  }

  try {
    const parsed = new URL(url)
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      return { ok: false, reason: 'invalid_url' }
    }
    if (isPlaceholderDatabaseUrl(parsed)) {
      return { ok: false, reason: 'placeholder' }
    }
    return { ok: true, url }
  } catch {
    return { ok: false, reason: 'invalid_url' }
  }
}

export function hasUsableDatabaseUrl(url = process.env.DATABASE_URL): boolean {
  return validateDatabaseEnv(url).ok
}

export function logDatabaseEnvError(context: string, validation = validateDatabaseEnv()): void {
  if (validation.ok) return
  console.error('[Database/env]', {
    context,
    reason: validation.reason,
    message:
      validation.reason === 'missing'
        ? 'DATABASE_URL is missing in this environment.'
        : validation.reason === 'placeholder'
          ? 'DATABASE_URL still looks like an example/placeholder value.'
          : 'DATABASE_URL is not a valid PostgreSQL connection string.',
  })
}

export function logDatabaseError(context: string, error: unknown): void {
  const pgError = error as { code?: string; message?: string; severity_local?: string; severity?: string }
  const code = pgError?.code ?? 'unknown'
  const knownMessage =
    code === '28P01'
      ? 'PostgreSQL authentication failed. Check DATABASE_URL password/connection string in Vercel Production.'
      : code === '42P01'
        ? 'PostgreSQL table/relation does not exist. Run database/schema.sql or the required migration.'
        : code === '42703'
          ? 'PostgreSQL column does not exist. Run the required migration.'
          : pgError?.message ?? 'Unknown database error.'

  console.error('[Database/query]', {
    context,
    code,
    severity: pgError?.severity_local ?? pgError?.severity,
    message: knownMessage,
  })
}
