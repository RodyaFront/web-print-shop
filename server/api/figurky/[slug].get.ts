export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Немає slug' })
  }

  const product = await getFigurine(slug)
  if (!product) {
    throw createError({ statusCode: 404, message: 'Фігурку не знайдено' })
  }
  return product
})
