export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id' })
  }
  const body = await readBody(event)
  const product = await updateFigurine(id, body ?? {})
  if (!product) {
    throw createError({ statusCode: 404, message: 'Позицію не знайдено' })
  }
  return product
})
