'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CreditCard, DollarSign, LayoutDashboard, LogOut, Package, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import SiteLogo from '@/components/shared/SiteLogo'

const ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Productos', href: '/admin/productos', icon: Package },
  { label: 'Cuotas', href: '/admin/cuotas', icon: CreditCard },
  { label: 'Dólar', href: '/admin/dolar', icon: DollarSign },
  { label: 'Canje', href: '/admin/canje', icon: RefreshCw },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default function AdminTabs() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <SiteLogo className="rounded-xl" imageClassName="w-[110px]" />
          <div>
            <p className="text-sm font-semibold tracking-[-0.03em] text-[#111111]">Panel</p>
            <p className="text-xs text-[#6B7280]">Admin</p>
          </div>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-2 xl:flex">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F7] text-[#6B7280] hover:bg-[#ECECEF] hover:text-[#111111]',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="hidden rounded-full bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#ECECEF] md:inline-flex">
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#ECECEF]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
      </div>

      <div className="no-scrollbar overflow-x-auto border-t border-[#F3F4F6] xl:hidden">
        <div className="mx-auto flex w-max min-w-full gap-2 px-6 py-3 lg:px-8">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F7] text-[#6B7280] hover:bg-[#ECECEF] hover:text-[#111111]',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
