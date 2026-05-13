export interface PublicDollarQuote {
  source: 'dolarapi'
  kind: 'oficial'
  name: string
  buy: number
  sell: number
  updatedAt: string
}

interface DolarApiOfficialResponse {
  compra: number
  venta: number
  nombre: string
  fechaActualizacion: string
}

export const DEFAULT_DOLLAR_API_URL = 'https://dolarapi.com/v1/dolares/oficial'

export async function fetchOfficialDollarQuote(): Promise<PublicDollarQuote> {
  // Store RQTA uses DolarApi "Dólar Oficial" and applies the "venta" value.
  const response = await fetch(process.env.DOLLAR_API_URL || DEFAULT_DOLLAR_API_URL, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error consultando DolarApi: ${response.status}`)
  }

  const data = (await response.json()) as DolarApiOfficialResponse

  if (!data?.venta || Number.isNaN(Number(data.venta)) || Number(data.venta) <= 0) {
    throw new Error('Respuesta inválida de DolarApi')
  }

  return {
    source: 'dolarapi',
    kind: 'oficial',
    name: data.nombre || 'Dólar Oficial',
    buy: Number(data.compra ?? 0),
    sell: Number(data.venta),
    updatedAt: data.fechaActualizacion,
  }
}
