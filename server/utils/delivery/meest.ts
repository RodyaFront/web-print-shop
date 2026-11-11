import type { DeliveryPoint } from '../../../shared/delivery'
import { cacheWrap } from './cache'
import { deliveryCredentials } from './config'

const MEEST_AUTH_URL = 'https://publicapi.meest.com/v3/auth'
const MEEST_SEARCH_URL = 'https://publicapi.meest.com/v3/search'

type MeestAuth = {
  status: string
  result?: { token?: string }
  info?: { message?: string }
}

type MeestSearch = {
  status: string
  result?: Array<Record<string, unknown>>
  info?: { message?: string }
}

let meestToken: string | null = null
let meestTokenExpiresAt = 0

async function meestAuthorize() {
  const { meestLogin, meestPassword } = deliveryCredentials()
  if (!meestLogin || !meestPassword) {
    throw createError({ statusCode: 503, message: 'Meest не налаштований' })
  }

  if (meestToken && Date.now() < meestTokenExpiresAt) {
    return meestToken
  }

  const body = await $fetch<MeestAuth>(MEEST_AUTH_URL, {
    method: 'POST',
    body: {
      username: meestLogin,
      password: meestPassword,
    },
  })

  const token = body?.result?.token
  if (!token) {
    throw createError({
      statusCode: 502,
      message: body?.info?.message || 'Не вдалося авторизуватись у Meest',
    })
  }

  meestToken = token
  // Token lifetime ~24h; refresh earlier.
  meestTokenExpiresAt = Date.now() + 20 * 60 * 60 * 1000
  return token
}

async function meestSearch(
  functionName: string,
  where: string,
): Promise<Array<Record<string, unknown>>> {
  const token = await meestAuthorize()
  const body = await $fetch<MeestSearch>(MEEST_SEARCH_URL, {
    method: 'POST',
    headers: {
      token,
      'Content-Type': 'application/json',
    },
    body: {
      function: functionName,
      where,
    },
  })

  if (body?.status !== 'OK') {
    throw createError({
      statusCode: 502,
      message: body?.info?.message || 'Помилка API Meest',
    })
  }

  return body.result ?? []
}

function asString(value: unknown) {
  return value == null ? '' : String(value)
}

function parseCoord(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

async function resolveMeestCityId(cityLabel: string, cityArea: string) {
  const label = cityLabel.trim()
  if (!label) return null

  const safe = label.replace(/'/g, "''")
  const rows = await cacheWrap(
    `meest:city:${label.toLowerCase()}:${cityArea.toLowerCase()}`,
    async () => meestSearch('city', `cityDescr='${safe}%'`),
  )

  if (!rows.length) return null

  const area = cityArea.trim().toLowerCase()
  const matched = area
    ? rows.find((row) => {
        const region = asString(row.regionDescr || row.RegionDescr || row.region).toLowerCase()
        return region.includes(area) || area.includes(region)
      })
    : null

  const city = matched || rows[0]
  return asString(city.cityID || city.cityId || city.id || city.uuid)
}

export async function searchMeestPoints(options: {
  cityLabel: string
  cityArea: string
  query?: string
}): Promise<DeliveryPoint[]> {
  const { cityLabel, cityArea, query = '' } = options
  const cityId = await resolveMeestCityId(cityLabel, cityArea)
  if (!cityId) return []

  const q = query.trim()
  const cacheKey = `meest:points:${cityId}:${q.toLowerCase()}`

  return cacheWrap(cacheKey, async () => {
    let where = `cityID='${cityId}'`
    if (q) {
      const safe = q.replace(/'/g, "''")
      where += ` AND branchDescr='${safe}%'`
    }

    const rows = await meestSearch('branch', where)
    return rows.map((row) => {
      const num = asString(row.branchNo || row.num)
      const descr = asString(row.branchDescr || row.name || row.address)
      const label = num ? `№${num}${descr ? `, ${descr}` : ''}` : descr || cityId
      return {
        id: asString(row.branchID || row.branchId || row.id || row.uuid) || label,
        label,
        address: asString(row.address || row.addressDescr),
        lat: parseCoord(row.latitude || row.lat),
        lon: parseCoord(row.longitude || row.lon || row.lng),
      }
    })
  })
}
