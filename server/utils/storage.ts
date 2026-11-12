import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { DeliveryCarrier, DeliveryMethod } from '../../shared/delivery'
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_FILES_PER_ORDER,
  MAX_UPLOAD_BYTES,
  ORDER_STATUSES,
  ORDER_TYPES,
  type OrderStatus,
  type OrderType,
  type PaymentMethod,
  type ReadyOrderItem,
} from '../../shared/shop'

export type OrderFile = {
  id: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
}

export type OrderRecord = {
  id: string
  type: OrderType
  status: OrderStatus
  createdAt: string
  updatedAt: string
  name: string
  phone: string
  telegram: string
  viber: string
  whatsapp: string
  city: string
  deliveryAddress: string
  description: string
  size: string
  comment: string
  needsPainting: boolean | null
  isAdultContent: boolean
  characterAdultConfirmed: boolean | null
  items: ReadyOrderItem[]
  totalUah: number | null
  deliveryCarrier: DeliveryCarrier | null
  deliveryMethod: DeliveryMethod | null
  deliveryCityLabel: string
  deliveryCityArea: string
  deliveryCityRef: string
  deliveryPointId: string
  deliveryPointLabel: string
  paymentMethod: PaymentMethod
  files: OrderFile[]
}

function ordersRoot() {
  return join(process.cwd(), 'data', 'orders')
}

function orderDir(id: string) {
  return join(ordersRoot(), id)
}

function metaPath(id: string) {
  return join(orderDir(id), 'meta.json')
}

export async function ensureOrdersRoot() {
  await mkdir(ordersRoot(), { recursive: true })
}

export function isOrderType(value: unknown): value is OrderType {
  return typeof value === 'string' && (ORDER_TYPES as readonly string[]).includes(value)
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value)
}

function extensionAllowed(filename: string) {
  const ext = extname(filename).toLowerCase()
  return (ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)
}

export async function listOrders(): Promise<OrderRecord[]> {
  await ensureOrdersRoot()
  const entries = await readdir(ordersRoot(), { withFileTypes: true })
  const orders: OrderRecord[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      const raw = await readFile(metaPath(entry.name), 'utf8')
      orders.push(normalizeOrder(JSON.parse(raw)))
    } catch {
      // Skip incomplete folders.
    }
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  try {
    const raw = await readFile(metaPath(id), 'utf8')
    return normalizeOrder(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await getOrder(id)
  if (!order) return null
  order.status = status
  order.updatedAt = new Date().toISOString()
  await writeFile(metaPath(id), JSON.stringify(order, null, 2), 'utf8')
  return order
}

export async function getOrderFile(orderId: string, fileId: string) {
  const order = await getOrder(orderId)
  if (!order) return null
  const file = order.files.find((item) => item.id === fileId)
  if (!file) return null
  const path = join(orderDir(orderId), 'files', file.storedName)
  try {
    await access(path)
  } catch {
    return null
  }
  return { order, file, path }
}

function normalizeOrder(raw: Record<string, unknown>): OrderRecord {
  const legacyAdult = raw.type === 'adult'
  let type: OrderType = 'figurine'
  if (raw.type === 'parts') type = 'parts'
  else if (raw.type === 'ready') type = 'ready'
  else if (legacyAdult) type = 'figurine'

  const items = Array.isArray(raw.items)
    ? raw.items.filter((item): item is ReadyOrderItem => {
        if (!item || typeof item !== 'object') return false
        const row = item as Record<string, unknown>
        return (
          typeof row.id === 'string'
          && typeof row.title === 'string'
          && typeof row.priceUah === 'number'
        )
      })
    : []

  const totalRaw = raw.totalUah
  const totalUah =
    typeof totalRaw === 'number' && Number.isFinite(totalRaw)
      ? totalRaw
      : items.length
        ? items.reduce((sum, item) => sum + item.priceUah, 0)
        : null

  return {
    ...(raw as unknown as OrderRecord),
    type,
    items,
    totalUah,
    deliveryCarrier: (raw.deliveryCarrier as DeliveryCarrier | null) ?? null,
    deliveryMethod: (raw.deliveryMethod as DeliveryMethod | null) ?? null,
    deliveryCityLabel: String(raw.deliveryCityLabel ?? ''),
    deliveryCityArea: String(raw.deliveryCityArea ?? ''),
    deliveryCityRef: String(raw.deliveryCityRef ?? ''),
    deliveryPointId: String(raw.deliveryPointId ?? ''),
    deliveryPointLabel: String(raw.deliveryPointLabel ?? ''),
    telegram: String(raw.telegram ?? ''),
    viber: String(raw.viber ?? ''),
    whatsapp: String(raw.whatsapp ?? ''),
    paymentMethod: raw.paymentMethod === 'card' ? 'card' : 'cod',
    isAdultContent: Boolean(raw.isAdultContent) || legacyAdult,
    characterAdultConfirmed:
      raw.characterAdultConfirmed === true
        ? true
        : raw.characterAdultConfirmed === false
          ? false
          : null,
  }
}

type CreateOrderInput = {
  type: OrderType
  name: string
  phone: string
  telegram?: string
  viber?: string
  whatsapp?: string
  city: string
  deliveryAddress: string
  description: string
  size: string
  comment: string
  needsPainting: boolean | null
  isAdultContent: boolean
  characterAdultConfirmed: boolean | null
  items?: ReadyOrderItem[]
  totalUah?: number | null
  deliveryCarrier?: DeliveryCarrier | null
  deliveryMethod?: DeliveryMethod | null
  deliveryCityLabel?: string
  deliveryCityArea?: string
  deliveryCityRef?: string
  deliveryPointId?: string
  deliveryPointLabel?: string
  paymentMethod?: PaymentMethod
  uploads: Array<{
    filename: string
    data: Buffer
    type: string
  }>
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  if (input.uploads.length > MAX_FILES_PER_ORDER) {
    throw createError({
      statusCode: 400,
      message: `Можна додати не більше ${MAX_FILES_PER_ORDER} файлів`,
    })
  }

  for (const upload of input.uploads) {
    if (!extensionAllowed(upload.filename)) {
      throw createError({
        statusCode: 400,
        message: `Файл "${upload.filename}" має недозволене розширення`,
      })
    }
    if (upload.data.byteLength > MAX_UPLOAD_BYTES) {
      throw createError({
        statusCode: 400,
        message: `Файл "${upload.filename}" більший за 25 МБ`,
      })
    }
  }

  await ensureOrdersRoot()
  const id = randomUUID()
  const dir = orderDir(id)
  const filesDir = join(dir, 'files')
  await mkdir(filesDir, { recursive: true })

  const files: OrderFile[] = []
  for (const upload of input.uploads) {
    const fileId = randomUUID()
    const ext = extname(upload.filename).toLowerCase()
    const storedName = `${fileId}${ext}`
    await writeFile(join(filesDir, storedName), upload.data)
    files.push({
      id: fileId,
      originalName: upload.filename,
      storedName,
      mimeType: upload.type || 'application/octet-stream',
      size: upload.data.byteLength,
    })
  }

  const items = input.items ?? []
  const totalUah =
    input.totalUah
    ?? (items.length ? items.reduce((sum, item) => sum + item.priceUah, 0) : null)

  const now = new Date().toISOString()
  const order: OrderRecord = {
    id,
    type: input.type,
    status: 'new',
    createdAt: now,
    updatedAt: now,
    name: input.name,
    phone: input.phone,
    telegram: String(input.telegram ?? '').trim(),
    viber: String(input.viber ?? '').trim(),
    whatsapp: String(input.whatsapp ?? '').trim(),
    city: input.city,
    deliveryAddress: input.deliveryAddress,
    description: input.description,
    size: input.size,
    comment: input.comment,
    needsPainting: input.needsPainting,
    isAdultContent: input.isAdultContent,
    characterAdultConfirmed: input.characterAdultConfirmed,
    items,
    totalUah,
    deliveryCarrier: input.deliveryCarrier ?? null,
    deliveryMethod: input.deliveryMethod ?? null,
    deliveryCityLabel: input.deliveryCityLabel ?? '',
    deliveryCityArea: input.deliveryCityArea ?? '',
    deliveryCityRef: input.deliveryCityRef ?? '',
    deliveryPointId: input.deliveryPointId ?? '',
    deliveryPointLabel: input.deliveryPointLabel ?? '',
    paymentMethod: input.paymentMethod === 'card' ? 'card' : 'cod',
    files,
  }

  await writeFile(metaPath(id), JSON.stringify(order, null, 2), 'utf8')
  return order
}
