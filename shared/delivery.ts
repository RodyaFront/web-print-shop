export const DELIVERY_CARRIERS = ['nova', 'meest', 'ukrposhta'] as const
export type DeliveryCarrier = (typeof DELIVERY_CARRIERS)[number]

export const DELIVERY_METHODS = [
  'nova_warehouse',
  'nova_postomat',
  'meest_warehouse',
  'ukrposhta_warehouse',
] as const
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

export const DELIVERY_METHOD_META: Record<
  DeliveryMethod,
  { carrier: DeliveryCarrier; label: string }
> = {
  nova_warehouse: {
    carrier: 'nova',
    label: 'Самовивіз з Нової Пошти',
  },
  nova_postomat: {
    carrier: 'nova',
    label: 'Самовивіз з поштоматів Нової Пошти',
  },
  meest_warehouse: {
    carrier: 'meest',
    label: 'Самовивіз з Meest',
  },
  ukrposhta_warehouse: {
    carrier: 'ukrposhta',
    label: 'Самовивіз з Укрпошти',
  },
}

export type DeliveryCity = {
  /** Nova Poshta city Ref - primary city id in our UX. */
  npCityRef: string
  label: string
  area: string
  lat?: number | null
  lon?: number | null
}

export type DeliveryPoint = {
  id: string
  label: string
  address?: string
  lat?: number | null
  lon?: number | null
}

export type DeliveryMethodInfo = {
  method: DeliveryMethod
  carrier: DeliveryCarrier
  label: string
  available: boolean
}

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return typeof value === 'string' && (DELIVERY_METHODS as readonly string[]).includes(value)
}

export function deliveryMethodLabel(method: DeliveryMethod) {
  return DELIVERY_METHOD_META[method].label
}

export function deliveryCarrierOf(method: DeliveryMethod): DeliveryCarrier {
  return DELIVERY_METHOD_META[method].carrier
}
