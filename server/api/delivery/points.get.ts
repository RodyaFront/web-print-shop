import { deliveryCarrierOf, isDeliveryMethod } from '../../../shared/delivery'
import { isCarrierConfigured } from '../../utils/delivery/config'
import { searchDeliveryPoints } from '../../utils/delivery/points'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const method = String(query.method || '')
  if (!isDeliveryMethod(method)) {
    throw createError({ statusCode: 400, message: 'Невідомий метод доставки' })
  }

  const carrier = deliveryCarrierOf(method)
  if (!isCarrierConfigured(carrier)) {
    throw createError({
      statusCode: 503,
      message: 'Цей спосіб доставки зараз недоступний',
    })
  }

  const cityRef = String(query.cityRef || '').trim()
  const cityLabel = String(query.cityLabel || '').trim()
  const cityArea = String(query.cityArea || '').trim()
  const q = String(query.q || '').trim()
  const latRaw = query.lat
  const lonRaw = query.lon
  const lat = latRaw == null || latRaw === '' ? null : Number(latRaw)
  const lon = lonRaw == null || lonRaw === '' ? null : Number(lonRaw)

  if (!cityLabel && !cityRef) {
    throw createError({ statusCode: 400, message: 'Спочатку оберіть місто' })
  }

  return await searchDeliveryPoints({
    method,
    city: {
      npCityRef: cityRef,
      label: cityLabel,
      area: cityArea,
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
    },
    query: q,
  })
})
