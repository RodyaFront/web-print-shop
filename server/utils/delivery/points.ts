import {
  isDeliveryMethod,
  type DeliveryCity,
  type DeliveryMethod,
  type DeliveryPoint,
} from '../../../shared/delivery'
import { searchMeestPoints } from './meest'
import { sortPointsNearest } from './nearest'
import { searchNovaPoints } from './nova'
import { searchUkrposhtaPoints } from './ukrposhta'

export async function searchDeliveryPoints(options: {
  method: string
  city: Pick<DeliveryCity, 'npCityRef' | 'label' | 'area' | 'lat' | 'lon'>
  query?: string
}): Promise<DeliveryPoint[]> {
  if (!isDeliveryMethod(options.method)) {
    throw createError({ statusCode: 400, message: 'Невідомий метод доставки' })
  }

  const method = options.method as DeliveryMethod
  const query = options.query?.trim() || ''
  let points: DeliveryPoint[] = []

  if (method === 'nova_warehouse' || method === 'nova_postomat') {
    if (!options.city.npCityRef) {
      throw createError({ statusCode: 400, message: 'Оберіть місто' })
    }
    points = await searchNovaPoints({
      cityRef: options.city.npCityRef,
      postomat: method === 'nova_postomat',
      query,
    })
  } else if (method === 'meest_warehouse') {
    points = await searchMeestPoints({
      cityLabel: options.city.label,
      cityArea: options.city.area,
      query,
    })
  } else if (method === 'ukrposhta_warehouse') {
    points = await searchUkrposhtaPoints({
      cityLabel: options.city.label,
      cityArea: options.city.area,
      query,
    })
  }

  return sortPointsNearest(points, options.city.lat, options.city.lon)
}
