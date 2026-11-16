export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id' })
  }
  const product = await getFigurine(id, { includeUnpublished: true })
  if (!product) {
    throw createError({ statusCode: 404, message: 'Позицію не знайдено' })
  }
  return product
})
