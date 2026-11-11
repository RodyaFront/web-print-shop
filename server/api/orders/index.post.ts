import {
  deliveryCarrierOf,
  deliveryMethodLabel,
  isDeliveryMethod,
  type DeliveryCarrier,
  type DeliveryMethod,
} from '../../../shared/delivery'
import { getFigurineById } from '../../../shared/figurky-catalog'
import {
  isPaymentMethod,
  isValidUaPhone,
  normalizeUaPhone,
  type PaymentMethod,
  type ReadyOrderItem,
} from '../../../shared/shop'
import { isOrderType, createOrder } from '../../utils/storage'

function asText(value: unknown) {
  return String(value ?? '').trim()
}

function asBool(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1'
}

function parseProductIds(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string' && Boolean(id))
  } catch {
    return raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }
}

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, message: 'Очікується multipart-форма' })
  }

  const fields = new Map<string, string>()
  const uploads: Array<{ filename: string; data: Buffer; type: string }> = []

  for (const part of form) {
    if (part.name === 'files' && part.filename && part.data) {
      uploads.push({
        filename: part.filename,
        data: part.data,
        type: part.type || 'application/octet-stream',
      })
      continue
    }
    if (part.name && part.data) {
      fields.set(part.name, part.data.toString('utf8'))
    }
  }

  const type = fields.get('type')
  if (!isOrderType(type)) {
    throw createError({ statusCode: 400, message: 'Невідомий тип замовлення' })
  }

  const name = asText(fields.get('name'))
  const phoneRaw = asText(fields.get('phone'))
  const size = asText(fields.get('size'))
  const comment = asText(fields.get('comment'))

  const deliveryMethodRaw = asText(fields.get('deliveryMethod'))
  const deliveryCityLabel = asText(fields.get('deliveryCityLabel'))
  const deliveryCityArea = asText(fields.get('deliveryCityArea'))
  const deliveryCityRef = asText(fields.get('deliveryCityRef'))
  const deliveryPointId = asText(fields.get('deliveryPointId'))
  const deliveryPointLabel = asText(fields.get('deliveryPointLabel'))
  const paymentMethodRaw = asText(fields.get('paymentMethod'))
  const paymentMethod: PaymentMethod = isPaymentMethod(paymentMethodRaw)
    ? paymentMethodRaw
    : 'cod'

  let deliveryMethod: DeliveryMethod | null = null
  let deliveryCarrier: DeliveryCarrier | null = null
  let city = asText(fields.get('city'))
  let deliveryAddress = asText(fields.get('deliveryAddress'))

  if (deliveryMethodRaw || deliveryCityLabel || deliveryPointId) {
    if (!isDeliveryMethod(deliveryMethodRaw)) {
      throw createError({ statusCode: 400, message: 'Оберіть спосіб доставки' })
    }
    if (!deliveryCityLabel || !deliveryPointId || !deliveryPointLabel) {
      throw createError({
        statusCode: 400,
        message: 'Оберіть місто та відділення доставки',
      })
    }
    deliveryMethod = deliveryMethodRaw
    deliveryCarrier = deliveryCarrierOf(deliveryMethod)
    city = deliveryCityArea
      ? `${deliveryCityLabel}, ${deliveryCityArea}`
      : deliveryCityLabel
    deliveryAddress = `${deliveryMethodLabel(deliveryMethod)}: ${deliveryPointLabel}`
  }

  if (!name || !phoneRaw || !city || !deliveryAddress) {
    throw createError({
      statusCode: 400,
      message: 'Заповніть ім’я, телефон, місто та доставку',
    })
  }

  if (!isValidUaPhone(phoneRaw)) {
    throw createError({
      statusCode: 400,
      message: 'Вкажіть український мобільний у форматі +380 і 9 цифр',
    })
  }

  const phone = normalizeUaPhone(phoneRaw)

  let description = asText(fields.get('description'))
  let items: ReadyOrderItem[] = []
  let totalUah: number | null = null

  if (type === 'ready') {
    const productIds = [...new Set(parseProductIds(fields.get('productIds')))]
    if (!productIds.length) {
      throw createError({
        statusCode: 400,
        message: 'Кошик порожній або позиції недоступні',
      })
    }

    for (const productId of productIds) {
      const product = getFigurineById(productId)
      if (!product || product.status !== 'in_stock') {
        throw createError({
          statusCode: 400,
          message: `Позиція «${productId}» недоступна для замовлення`,
        })
      }
      items.push({
        id: product.id,
        title: product.title,
        priceUah: product.priceUah,
      })
    }

    totalUah = items.reduce((sum, item) => sum + item.priceUah, 0)
    description = items.map((item) => item.title).join(', ')
  } else if (!description) {
    throw createError({
      statusCode: 400,
      message: 'Заповніть ім’я, телефон, місто, доставку та опис роботи',
    })
  }

  let needsPainting: boolean | null = null
  if (type === 'parts') {
    needsPainting = asBool(fields.get('needsPainting'))
  } else if (type === 'figurine' || type === 'ready') {
    needsPainting = true
  }

  let isAdultContent = false
  let characterAdultConfirmed: boolean | null = null
  if (type === 'figurine') {
    isAdultContent = asBool(fields.get('isAdultContent'))
    if (isAdultContent) {
      characterAdultConfirmed = asBool(fields.get('characterAdultConfirmed'))
      if (!characterAdultConfirmed) {
        throw createError({
          statusCode: 400,
          message: 'Для опції 18+ потрібне підтвердження, що персонаж повнолітній',
        })
      }
    }
  }

  if (type === 'ready' && uploads.length) {
    throw createError({
      statusCode: 400,
      message: 'Для готових фігурок файли не потрібні',
    })
  }

  const order = await createOrder({
    type,
    name,
    phone,
    city,
    deliveryAddress,
    description,
    size,
    comment,
    needsPainting,
    isAdultContent,
    characterAdultConfirmed,
    items,
    totalUah,
    deliveryCarrier,
    deliveryMethod,
    deliveryCityLabel,
    deliveryCityArea,
    deliveryCityRef,
    deliveryPointId,
    deliveryPointLabel,
    paymentMethod,
    uploads,
  })

  return {
    id: order.id,
    type: order.type,
    createdAt: order.createdAt,
  }
})
