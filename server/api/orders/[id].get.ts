export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id заявки' })
  }
  const order = await getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, message: 'Заявку не знайдено' })
  }
  return order
})
