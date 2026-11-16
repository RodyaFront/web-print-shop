import { removeFigurineMedia } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id' })
  }
  const removed = await deleteFigurine(id)
  if (!removed) {
    throw createError({ statusCode: 404, message: 'Позицію не знайдено' })
  }
  await removeFigurineMedia(id)
  return { ok: true }
})
