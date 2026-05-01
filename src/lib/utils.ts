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

export function buildWhatsAppUrl(number: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encoded}`
}
