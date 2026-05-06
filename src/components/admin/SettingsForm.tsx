'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from '@/types'
import { Check } from 'lucide-react'

interface Props { initialSettings: SiteSettings }

const inputCls = 'w-full rounded-[22px] border border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card rounded-[2rem] p-6 sm:p-8">
      <p className="admin-section-heading mb-6">{title}</p>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#111111]">{label}</label>
      {children}
      {note && <p className="text-xs text-[#666666]">{note}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-[#111111]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-black' : 'bg-[#d6d6d6]'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}

export default function SettingsForm({ initialSettings }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field: keyof SiteSettings, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const payload: Record<string, string> = {
        whatsapp_number: form.whatsapp_number,
        whatsapp_message: form.whatsapp_message,
        store_name: form.store_name,
        store_tagline: form.store_tagline,
        trade_in_enabled: String(form.trade_in_enabled),
        show_usd_price: String(form.show_usd_price),
        show_installments: String(form.show_installments),
      }
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <Section title="Tienda">
        <Field label="Nombre">
          <input value={form.store_name} onChange={(e) => set('store_name', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tagline">
          <input value={form.store_tagline} onChange={(e) => set('store_tagline', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="WhatsApp">
        <Field label="Número (con código de país, sin +)" note="Ejemplo: 5491100000000">
          <input placeholder="5491100000000" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Mensaje inicial" note="El nombre del producto se agrega al final automáticamente.">
          <textarea
            value={form.whatsapp_message}
            onChange={(e) => set('whatsapp_message', e.target.value)}
            rows={2}
            className={inputCls + ' resize-none'}
          />
        </Field>
      </Section>

      <Section title="Features">
        <Toggle checked={form.trade_in_enabled} onChange={(v) => set('trade_in_enabled', v)} label="Activar Plan Canje" />
        <Toggle checked={form.show_usd_price} onChange={(v) => set('show_usd_price', v)} label="Mostrar precio en USD" />
        <Toggle checked={form.show_installments} onChange={(v) => set('show_installments', v)} label="Mostrar cuotas" />
      </Section>

      <button
        onClick={handleSave}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
      >
        {saved ? (
          <><Check className="h-4 w-4" /> Guardado</>
        ) : loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Guardando
          </>
        ) : 'Guardar configuración'}
      </button>
    </div>
  )
}
