import {
  DELIVERY_METHOD_META,
  DELIVERY_METHODS,
  type DeliveryMethod,
  type DeliveryMethodInfo,
} from '../../../shared/delivery'

export function deliveryCredentials() {
  const config = useRuntimeConfig()
  return {
    npApiKey: String(config.npApiKey || '').trim(),
    meestLogin: String(config.meestLogin || '').trim(),
    meestPassword: String(config.meestPassword || '').trim(),
    ukrposhtaBearer: String(config.ukrposhtaBearer || '').trim(),
  }
}

export function isCarrierConfigured(carrier: 'nova' | 'meest' | 'ukrposhta') {
  const creds = deliveryCredentials()
  if (carrier === 'nova') return Boolean(creds.npApiKey)
  // Meest / Ukrposhta: office is entered manually, no carrier API required.
  if (carrier === 'meest' || carrier === 'ukrposhta') return true
  return false
}

export function listDeliveryMethods(): DeliveryMethodInfo[] {
  return DELIVERY_METHODS.map((method: DeliveryMethod) => {
    const meta = DELIVERY_METHOD_META[method]
    return {
      method,
      carrier: meta.carrier,
      label: meta.label,
      available: isCarrierConfigured(meta.carrier),
    }
  })
}
