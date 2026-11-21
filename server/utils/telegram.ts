import {
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderType,
  type PaymentMethod,
} from '../../shared/shop'
import type { OrderRecord } from './storage'

type TelegramConfig = {
  botToken: string
  chatId: string
}

function getTelegramConfig(): TelegramConfig | null {
  const config = useRuntimeConfig()
  const botToken = String(config.telegramBotToken || '').trim()
  const chatId = String(config.telegramChatId || '').trim()
  if (!botToken || !chatId) return null
  return { botToken, chatId }
}

function formatMoney(amount: number | null | undefined) {
  if (amount == null || !Number.isFinite(amount)) return null
  return `${Math.round(amount)} грн`
}

function adminOrderUrl(orderId: string) {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').trim().replace(/\/$/, '')
  if (!siteUrl) return `/admin/orders/${orderId}`
  return `${siteUrl}/admin/orders/${orderId}`
}

function buildNewOrderMessage(order: OrderRecord) {
  const typeLabel = ORDER_TYPE_LABELS[order.type as OrderType] ?? order.type
  const paymentLabel =
    PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]
    ?? order.paymentMethod

  const lines = [
    'Нова заявка',
    `Тип: ${typeLabel}`,
    `Ім’я: ${order.name}`,
    `Телефон: ${order.phone}`,
  ]

  if (order.telegram) lines.push(`Telegram: ${order.telegram}`)
  if (order.viber) lines.push(`Viber: ${order.viber}`)
  if (order.whatsapp) lines.push(`WhatsApp: ${order.whatsapp}`)
  if (order.city) lines.push(`Місто: ${order.city}`)
  if (order.deliveryAddress) lines.push(`Доставка: ${order.deliveryAddress}`)
  if (order.description) lines.push(`Опис: ${order.description}`)
  if (order.size) lines.push(`Розмір: ${order.size}`)
  if (order.comment) lines.push(`Коментар: ${order.comment}`)
  if (order.isAdultContent) lines.push('18+: так')
  if (order.needsPainting != null) {
    lines.push(`Фарбування: ${order.needsPainting ? 'так' : 'ні'}`)
  }
  if (order.items.length) {
    lines.push(
      `Позиції: ${order.items.map((item) => `${item.title} (${item.priceUah} грн)`).join(', ')}`,
    )
  }

  const total = formatMoney(order.totalUah)
  if (total) lines.push(`Сума: ${total}`)

  lines.push(`Оплата: ${paymentLabel}`)
  if (order.files.length) lines.push(`Файлів: ${order.files.length}`)
  lines.push(`Адмінка: ${adminOrderUrl(order.id)}`)

  return lines.join('\n')
}

async function sendTelegramMessage(text: string) {
  const credentials = getTelegramConfig()
  if (!credentials) return false

  const url = `https://api.telegram.org/bot${credentials.botToken}/sendMessage`
  await $fetch(url, {
    method: 'POST',
    body: {
      chat_id: credentials.chatId,
      text,
      disable_web_page_preview: true,
    },
  })
  return true
}

/** Best-effort notify. Never throws — order flow must not depend on Telegram. */
export async function notifyNewOrder(order: OrderRecord) {
  if (!getTelegramConfig()) return

  try {
    await sendTelegramMessage(buildNewOrderMessage(order))
  } catch (error) {
    console.warn('[telegram] Failed to notify about new order', order.id, error)
  }
}
