import { getAdminSession } from '@/lib/auth'
import AdminTabs from '@/components/admin/AdminTabs'
import AdminProviders from '@/components/admin/AdminProviders'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuth = await getAdminSession()

  return (
    <AdminProviders>
      <div className="min-h-screen bg-[#f7f7f8] text-[#111111]">
        {isAuth && <AdminTabs />}
        <main className={isAuth ? 'pb-14' : ''}>{children}</main>
      </div>
    </AdminProviders>
  )
}
