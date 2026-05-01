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

const DOLAR_API_OFFICIAL_URL = 'https://dolarapi.com/v1/dolares/oficial'

export async function fetchOfficialDollarQuote(): Promise<PublicDollarQuote> {
  const response = await fetch(DOLAR_API_OFFICIAL_URL, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error consultando DolarApi: ${response.status}`)
  }

  const data = (await response.json()) as DolarApiOfficialResponse

  if (!data?.venta || Number.isNaN(Number(data.venta))) {
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
