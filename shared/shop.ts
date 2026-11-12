export const SHOP_NAME = 'Фігулярня'
export const SHOP_TAGLINE = '3D-друк і ручне фарбування'

export const ORDER_TYPES = ['figurine', 'parts', 'ready'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

export const ORDER_STATUSES = ['new', 'in_progress', 'done'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  figurine: 'Фігурка',
  parts: 'Деталі',
  ready: 'Готові фігурки',
}

export type ReadyOrderItem = {
  id: string
  title: string
  priceUah: number
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нова',
  in_progress: 'В роботі',
  done: 'Виконана',
}

export const PAYMENT_METHODS = ['cod', 'card'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Накладений платіж',
  card: 'Оплата на картку',
}

export const PAYMENT_METHOD_HINTS: Record<PaymentMethod, string> = {
  cod: 'Оплата при отриманні посилки.',
  card: 'Реквізити надішлемо після узгодження замовлення.',
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && (PAYMENT_METHODS as readonly string[]).includes(value)
}

export const ALLOWED_UPLOAD_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.stl',
  '.obj',
  '.zip',
] as const

/** Max upload size per file (bytes). STL models can be large. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

export const MAX_FILES_PER_ORDER = 8

/** Digits only from a phone-related string. */
export function digitsOnlyPhone(input: string) {
  return String(input ?? '').replace(/\D/g, '')
}

/**
 * Local UA mobile part after country code: exactly 9 digits
 * (operator + subscriber), e.g. 671234567.
 */
export function isValidUaMobileLocal(input: string) {
  return /^\d{9}$/.test(digitsOnlyPhone(input))
}

export function normalizeUaPhoneFromLocal(local: string) {
  return `+380${digitsOnlyPhone(local)}`
}

/** Full value as stored/sent: +380XXXXXXXXX or legacy 0XXXXXXXXX paste. */
export function isValidUaPhone(input: string) {
  const digits = digitsOnlyPhone(input)
  return (
    (digits.startsWith('380') && digits.length === 12)
    || (digits.startsWith('0') && digits.length === 10)
  )
}

export function normalizeUaPhone(input: string) {
  const digits = digitsOnlyPhone(input)
  if (digits.startsWith('380') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+38${digits}`
  if (digits.length === 9) return `+380${digits}`
  return String(input ?? '').trim()
}

/** Strip country / leading 0 so the field keeps only 9 local digits. */
export function toUaMobileLocal(input: string) {
  let digits = digitsOnlyPhone(input)
  if (digits.startsWith('380')) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}
