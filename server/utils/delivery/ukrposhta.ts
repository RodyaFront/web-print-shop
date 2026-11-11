import type { DeliveryPoint } from '../../../shared/delivery'
import { cacheWrap } from './cache'
import { deliveryCredentials } from './config'

/**
 * Address classifier search flow from Ukrposhta guide:
 * https://dev.ukrposhta.ua/uploads/Search-offices-and-indexes-v3-11022026.pdf
 *
 * Region → (District optional) → City → Post offices by city_id / koatuu / katottg
 */
const UP_BASE = 'https://www.ukrposhta.ua/address-classifier-ws'

type UpRegion = {
  REGION_ID?: number | string
  REGION_UA?: string
}

type UpDistrict = {
  DISTRICT_ID?: number | string
  DISTRICT_UA?: string
  REGION_ID?: number | string
}

type UpCity = {
  CITY_ID?: number | string
  CITY_UA?: string
  REGION_ID?: number | string
  REGION_UA?: string
  DISTRICT_ID?: number | string
  DISTRICT_UA?: string
  CITY_KOATUU?: string
  CITY_KATOTTG?: string
  POPULATION?: number | string
  LATTITUDE?: number | string
  LATITUDE?: number | string
  LONGITUDE?: number | string
}

type UpOffice = {
  POSTOFFICE_ID?: number | string
  ID?: number | string
  POSTCODE?: number | string
  POSTOFFICE_UA?: string
  STREET_UA_VPZ?: string
  HOUSENUMBER?: number | string
  PO_LONG?: string
  PO_SHORT?: string
  ADDRESS?: string
  LATTITUDE?: number | string
  LATITUDE?: number | string
  LONGITUDE?: number | string
  LOCK_CODE?: number | string
  TYPE_LONG?: string
}

function asString(value: unknown) {
  return value == null ? '' : String(value).trim()
}

function parseCoord(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function normalizeRegionQuery(area: string) {
  return area
    .replace(/\s*область\s*/gi, ' ')
    .replace(/\s*обл\.?\s*/gi, ' ')
    .replace(/^м\.\s*/i, '')
    .trim()
}

async function upGet(path: string, query: Record<string, string>): Promise<unknown> {
  const { ukrposhtaBearer } = deliveryCredentials()
  if (!ukrposhtaBearer) {
    throw createError({ statusCode: 503, message: 'Укрпошта не налаштована' })
  }

  return $fetch(`${UP_BASE}/${path}`, {
    method: 'GET',
    query,
    headers: {
      Authorization: `Bearer ${ukrposhtaBearer}`,
      Accept: 'application/json',
    },
  })
}

/** Guide responses: { Entries: { Entry: T | T[] } } */
function unwrapEntries<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== 'object') return []

  const root = payload as Record<string, unknown>
  const entries = root.Entries ?? root.entries
  if (!entries || typeof entries !== 'object') {
    // Fallback: some payloads nest differently
    for (const value of Object.values(root)) {
      if (Array.isArray(value)) return value as T[]
    }
    return []
  }

  const entry = (entries as Record<string, unknown>).Entry
    ?? (entries as Record<string, unknown>).entry
  if (Array.isArray(entry)) return entry as T[]
  if (entry && typeof entry === 'object') return [entry as T]
  return []
}

async function resolveRegionId(cityArea: string): Promise<string | null> {
  const regionName = normalizeRegionQuery(cityArea)
  if (!regionName) return null

  const payload = await cacheWrap(
    `ukrposhta:region:${regionName.toLowerCase()}`,
    async () => upGet('get_regions_by_region_ua', { region_name: regionName }),
  )

  const rows = unwrapEntries<UpRegion>(payload)
  if (!rows.length) return null

  const exact = rows.find(
    (row) => asString(row.REGION_UA).toLowerCase() === regionName.toLowerCase(),
  )
  const region = exact || rows[0]
  return region.REGION_ID == null ? null : String(region.REGION_ID)
}

async function resolveCity(options: {
  cityLabel: string
  cityArea: string
}): Promise<UpCity | null> {
  const label = options.cityLabel.trim()
  if (!label) return null

  const regionId = await resolveRegionId(options.cityArea)
  const cacheKey = `ukrposhta:city-resolved:${label.toLowerCase()}:${options.cityArea.toLowerCase()}`

  return cacheWrap(cacheKey, async () => {
    const query: Record<string, string> = { city_ua: label }
    if (regionId) query.region_id = regionId

    // Guide step 3: get_city_by_region_id_and_district_id_and_city_ua
    let rows = unwrapEntries<UpCity>(
      await upGet('get_city_by_region_id_and_district_id_and_city_ua', query),
    )

    // If area looks like a district name and we have region, try district → city
    if ((!rows.length || rows.length > 1) && regionId) {
      const districtName = normalizeRegionQuery(options.cityArea)
      if (districtName) {
        const districts = unwrapEntries<UpDistrict>(
          await upGet('get_districts_by_region_id_and_district_ua', {
            region_id: regionId,
            district_ua: districtName,
          }),
        )
        const district = districts[0]
        if (district?.DISTRICT_ID != null) {
          rows = unwrapEntries<UpCity>(
            await upGet('get_city_by_region_id_and_district_id_and_city_ua', {
              district_id: String(district.DISTRICT_ID),
              city_ua: label,
            }),
          )
        }
      }
    }

    if (!rows.length) return null

    const exact = rows.filter(
      (row) => asString(row.CITY_UA).toLowerCase() === label.toLowerCase(),
    )
    const pool = exact.length ? exact : rows

    // Prefer larger settlement when duplicates exist (guide appendix)
    pool.sort((a, b) => Number(b.POPULATION || 0) - Number(a.POPULATION || 0))
    return pool[0] || null
  })
}

function mapOffice(row: UpOffice): DeliveryPoint {
  const postcode = asString(row.POSTCODE)
  const street = asString(row.STREET_UA_VPZ)
  const house = asString(row.HOUSENUMBER)
  const streetLine = [street, house].filter(Boolean).join(', ')
  const name = asString(row.POSTOFFICE_UA || row.PO_LONG || row.PO_SHORT)
  const address = streetLine || asString(row.ADDRESS)
  const label = [postcode, name || address].filter(Boolean).join(', ')

  return {
    id: asString(row.POSTOFFICE_ID || row.ID) || postcode || label,
    label: label || postcode,
    address,
    lat: parseCoord(row.LATTITUDE ?? row.LATITUDE),
    lon: parseCoord(row.LONGITUDE),
  }
}

export async function searchUkrposhtaPoints(options: {
  cityLabel: string
  cityArea: string
  query?: string
}): Promise<DeliveryPoint[]> {
  const { cityLabel, cityArea, query = '' } = options
  const city = await resolveCity({ cityLabel, cityArea })
  if (!city?.CITY_ID) return []

  const cityId = String(city.CITY_ID)
  const q = query.trim().toLowerCase()
  const cacheKey = `ukrposhta:points:${cityId}:${q}`

  return cacheWrap(cacheKey, async () => {
    // Guide step 4: get_postoffices_by_postcode_cityid_cityvpzid?city_id=
    const payload = await upGet(
      'get_postoffices_by_postcode_cityid_cityvpzid',
      { city_id: cityId },
    )
    const rows = unwrapEntries<UpOffice>(payload)

    const points = rows
      .filter((row) => Number(row.LOCK_CODE || 0) === 0)
      .map(mapOffice)

    if (!q) return points
    return points.filter((point) =>
      `${point.label} ${point.address || ''}`.toLowerCase().includes(q),
    )
  })
}
