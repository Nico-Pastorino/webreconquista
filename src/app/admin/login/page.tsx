'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import SiteLogo from '@/components/shared/SiteLogo'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Contraseña incorrecta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <SiteLogo className="mb-6" imageClassName="mx-auto w-[128px]" />
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-[20px] border border-[#eaeaea] bg-[#f5f5f7]">
            <Lock className="h-5 w-5 text-[#111111]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Panel Admin</h1>
          <p className="mt-2 text-sm text-[#666666]">Ingresá tu contraseña para acceder</p>
        </div>

        <div className="rounded-[32px] border border-[#eaeaea] bg-white p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[#111111]">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="w-full rounded-[22px] border border-[#eaeaea] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] outline-none transition-colors focus:border-[#111111] focus:ring-4 focus:ring-black/5"
              />
              {error && <p className="text-xs text-[#666666]">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
