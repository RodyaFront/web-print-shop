import type { DeliveryCity, DeliveryPoint } from '../../../shared/delivery'
import { cacheWrap } from './cache'
import { deliveryCredentials } from './config'

const NP_URL = 'https://api.novaposhta.ua/v2.0/json/'

type NpResponse<T> = {
  success: boolean
  data: T[]
  errors?: unknown[]
  warnings?: unknown[]
}

type NpCity = {
  Ref: string
  Description: string
  AreaDescription?: string
  Latitude?: string | number
  Longitude?: string | number
}

type NpWarehouse = {
  Ref: string
  Description: string
  ShortAddress?: string
  Number?: string
  CategoryOfWarehouse?: string
  Latitude?: string | number
  Longitude?: string | number
}

function parseCoord(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

async function npCall<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>,
): Promise<T[]> {
  const { npApiKey } = deliveryCredentials()
  if (!npApiKey) {
    throw createError({ statusCode: 503, message: 'Нова Пошта не налаштована' })
  }

  const body = await $fetch<NpResponse<T>>(NP_URL, {
    method: 'POST',
    body: {
      apiKey: npApiKey,
      modelName,
      calledMethod,
      methodProperties,
    },
  })

  if (!body?.success) {
    const err = Array.isArray(body?.errors) && body.errors.length
      ? String(body.errors[0])
      : 'Помилка API Нової Пошти'
    throw createError({ statusCode: 502, message: err })
  }

  return body.data ?? []
}

export async function searchNovaCities(query: string): Promise<DeliveryCity[]> {
  const q = query.trim()
  if (q.length < 2) return []

  return cacheWrap(`nova:cities:${q.toLowerCase()}`, async () => {
    const rows = await npCall<NpCity>('AddressGeneral', 'getCities', {
      FindByString: q,
      Limit: '20',
    })

    return rows.map((row) => ({
      npCityRef: row.Ref,
      label: row.Description,
      area: row.AreaDescription || '',
      lat: parseCoord(row.Latitude),
      lon: parseCoord(row.Longitude),
    }))
  })
}

function isPostomat(row: NpWarehouse) {
  const cat = String(row.CategoryOfWarehouse || '').toLowerCase()
  const desc = String(row.Description || '').toLowerCase()
  return cat.includes('postomat') || desc.includes('поштомат')
}

export async function searchNovaPoints(options: {
  cityRef: string
  postomat: boolean
  query?: string
}): Promise<DeliveryPoint[]> {
  const { cityRef, postomat, query = '' } = options
  const q = query.trim()
  const cacheKey = `nova:points:${cityRef}:${postomat ? 'p' : 'w'}:${q.toLowerCase()}`

  return cacheWrap(cacheKey, async () => {
    const props: Record<string, unknown> = {
      CityRef: cityRef,
      Limit: '100',
    }
    if (q) props.FindByString = q

    const rows = await npCall<NpWarehouse>('AddressGeneral', 'getWarehouses', props)
    const filtered = rows.filter((row) => (postomat ? isPostomat(row) : !isPostomat(row)))

    return filtered.map((row) => ({
      id: row.Ref,
      label: row.Description,
      address: row.ShortAddress || '',
      lat: parseCoord(row.Latitude),
      lon: parseCoord(row.Longitude),
    }))
  })
}
