export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id заявки' })
  }

  const body = await readBody<{
    status?: string
    adminNote?: string
    quotedPriceUah?: number | null
    trackingNumber?: string
  }>(event)

  const patch: {
    status?: import('../../../shared/shop').OrderStatus
    adminNote?: string
    quotedPriceUah?: number | null
    trackingNumber?: string
  } = {}

  if (body?.status !== undefined) {
    if (!isOrderStatus(body.status)) {
      throw createError({ statusCode: 400, message: 'Невідомий статус' })
    }
    patch.status = body.status
  }

  if (body?.adminNote !== undefined) {
    if (typeof body.adminNote !== 'string') {
      throw createError({ statusCode: 400, message: 'Некоректна нотатка' })
    }
    patch.adminNote = body.adminNote.trim().slice(0, 4000)
  }

  if (body?.quotedPriceUah !== undefined) {
    if (body.quotedPriceUah === null || body.quotedPriceUah === ('' as never)) {
      patch.quotedPriceUah = null
    } else if (
      typeof body.quotedPriceUah === 'number'
      && Number.isFinite(body.quotedPriceUah)
      && body.quotedPriceUah >= 0
    ) {
      patch.quotedPriceUah = Math.round(body.quotedPriceUah)
    } else {
      throw createError({ statusCode: 400, message: 'Некоректна узгоджена ціна' })
    }
  }

  if (body?.trackingNumber !== undefined) {
    if (typeof body.trackingNumber !== 'string') {
      throw createError({ statusCode: 400, message: 'Некоректний номер ТТН' })
    }
    patch.trackingNumber = body.trackingNumber.trim().slice(0, 128)
  }

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, message: 'Немає змін для збереження' })
  }

  const order = await updateOrder(id, patch)
  if (!order) {
    throw createError({ statusCode: 404, message: 'Заявку не знайдено' })
  }
  return order
})
