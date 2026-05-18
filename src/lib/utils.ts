import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORY_LABELS: Record<string, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  mac: 'Mac',
  watch: 'Apple Watch',
  airpods: 'AirPods',
  accesorios: 'Accesorios',
}

export function hasRenderableImage(imageUrl?: string | null): boolean {
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0
}

/** Strips all non-digit characters so any format (+54 9 11…, 5491…, etc.) works. */
export function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(number)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}
