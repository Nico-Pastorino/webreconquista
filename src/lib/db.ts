import postgres from 'postgres'
import { logDatabaseEnvError, validateDatabaseEnv } from './env'

let sql: ReturnType<typeof postgres> | undefined

declare global {
  var _sql: ReturnType<typeof postgres> | undefined
}

function createClient(connectionString: string) {
  return postgres(connectionString, {
    ssl: 'require',
    max: process.env.NODE_ENV === 'production' ? 10 : 3,
    idle_timeout: process.env.NODE_ENV === 'production' ? 20 : 30,
    connect_timeout: 10,
    max_lifetime: process.env.NODE_ENV === 'production' ? 60 * 30 : 60 * 60,
  })
}

export function getSql(): ReturnType<typeof postgres> {
  const validation = validateDatabaseEnv()

  if (!validation.ok || !validation.url) {
    logDatabaseEnvError('getSql', validation)
    throw new Error('DATABASE_URL no configurada para PostgreSQL')
  }

  if (process.env.NODE_ENV === 'production') {
    if (!sql) {
      sql = createClient(validation.url)
    }
    return sql
  }

  if (!global._sql) {
    global._sql = createClient(validation.url)
  }

  return global._sql
}
