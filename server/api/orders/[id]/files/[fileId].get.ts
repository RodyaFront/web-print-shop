import { createReadStream } from 'node:fs'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const fileId = getRouterParam(event, 'fileId')
  if (!id || !fileId) {
    throw createError({ statusCode: 400, message: 'Немає id заявки або файлу' })
  }

  const result = await getOrderFile(id, fileId)
  if (!result) {
    throw createError({ statusCode: 404, message: 'Файл не знайдено' })
  }

  setHeader(event, 'Content-Type', result.file.mimeType)
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(result.file.originalName)}`,
  )
  return sendStream(event, createReadStream(result.path))
})
