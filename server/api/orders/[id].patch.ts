export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id заявки' })
  }
  const body = await readBody<{ status?: string }>(event)
  if (!isOrderStatus(body?.status)) {
    throw createError({ statusCode: 400, message: 'Невідомий статус' })
  }
  const order = await updateOrderStatus(id, body.status)
  if (!order) {
    throw createError({ statusCode: 404, message: 'Заявку не знайдено' })
  }
  return order
})
