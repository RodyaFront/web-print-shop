import { createReadStream } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { sendStream } from 'h3'
import { resolveSafeMediaPath } from '../../utils/media'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path')
  if (!pathParam) {
    throw createError({ statusCode: 404, message: 'Не знайдено' })
  }

  const filePath = resolveSafeMediaPath(pathParam)
  try {
    await access(filePath)
    const info = await stat(filePath)
    if (!info.isFile()) {
      throw createError({ statusCode: 404, message: 'Не знайдено' })
    }
  } catch {
    throw createError({ statusCode: 404, message: 'Не знайдено' })
  }

  const ext = extname(filePath).toLowerCase()
  const type = MIME[ext]
  if (!type) {
    throw createError({ statusCode: 404, message: 'Не знайдено' })
  }

  setHeader(event, 'content-type', type)
  setHeader(event, 'cache-control', 'public, max-age=86400')
  return sendStream(event, createReadStream(filePath))
})
