import {
  getFigurine,
} from '../../../../utils/catalog'
import {
  saveCoverImage,
  saveTurntableFrames,
} from '../../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Немає id' })
  }

  const existing = await getFigurine(id, { includeUnpublished: true })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Позицію не знайдено' })
  }

  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, message: 'Очікується multipart-форма' })
  }

  const kindPart = form.find((part) => part.name === 'kind' && !part.filename)
  const kind = kindPart?.data?.toString('utf8').trim() || 'cover'

  const uploads = form
    .filter((part) => part.filename && part.data)
    .map((part) => ({
      filename: part.filename!,
      data: part.data!,
      type: part.type || 'application/octet-stream',
    }))

  if (!uploads.length) {
    throw createError({ statusCode: 400, message: 'Немає файлів' })
  }

  if (kind === 'cover') {
    const image = await saveCoverImage(id, uploads[0]!)
    return { image }
  }

  if (kind === 'turntable') {
    return await saveTurntableFrames(id, uploads)
  }

  throw createError({
    statusCode: 400,
    message: 'kind має бути cover або turntable',
  })
})
