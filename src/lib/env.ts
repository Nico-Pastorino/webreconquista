export function hasUsableDatabaseUrl(url = process.env.DATABASE_URL): boolean {
  if (!url || !url.trim()) return false

  try {
    const parsed = new URL(url)
    return !(
      parsed.hostname === 'host' ||
      parsed.username === 'user' ||
      parsed.password === 'password' ||
      parsed.pathname === '/dbname'
    )
  } catch {
    return false
  }
}
