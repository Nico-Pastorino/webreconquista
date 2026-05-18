'use client'

import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { ToastProvider } from '@/components/ui/Toast'

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ConfirmProvider>
  )
}
