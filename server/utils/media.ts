import { mkdir, writeFile, rm } from 'node:fs/promises'
import { extname, join, normalize, relative, resolve, sep } from 'node:path'
import { createError } from 'h3'
import { assertTurntableFrames } from '../../shared/turntable-scrub'
import { updateFigurine } from './catalog'

const MAX_MEDIA_BYTES = 10 * 1024 * 1024
const ALLOWED_MEDIA_EXT = ['.png', '.jpg', '.jpeg', '.webp'] as const

export function mediaRoot() {
  return join(process.cwd(), 'data', 'media')
}

export function figurineMediaDir(id: string) {
  return join(mediaRoot(), 'figurky', id)
}

export function publicMediaUrl(relativePath: string) {
  return `/media/${relativePath.replace(/\\/g, '/')}`
}

export function isAllowedMediaFilename(filename: string) {
  const ext = extname(filename).toLowerCase()
  return (ALLOWED_MEDIA_EXT as readonly string[]).includes(ext)
}

/** Resolve a /media path under data/media; throws if path escapes. */
export function resolveSafeMediaPath(urlPath: string) {
  const root = resolve(mediaRoot())
  const cleaned = urlPath.replace(/^\/+/, '').replace(/\\/g, '/')
  const target = resolve(root, cleaned)
  const rel = relative(root, target)
  if (rel.startsWith('..') || rel.includes(`..${sep}`) || normalize(rel).startsWith('..')) {
    throw createError({ statusCode: 400, message: 'Некоректний шлях' })
  }
  if (!target.startsWith(root)) {
    throw createError({ statusCode: 400, message: 'Некоректний шлях' })
  }
  return target
}

export async function saveCoverImage(
  figurineId: string,
  upload: { filename: string; data: Buffer; type: string },
) {
  if (!isAllowedMediaFilename(upload.filename)) {
    throw createError({
      statusCode: 400,
      message: 'Дозволені лише PNG, JPG, WEBP',
    })
  }
  if (upload.data.byteLength > MAX_MEDIA_BYTES) {
    throw createError({
      statusCode: 400,
      message: 'Файл більший за 10 МБ',
    })
  }

  const dir = figurineMediaDir(figurineId)
  await mkdir(dir, { recursive: true })
  const ext = extname(upload.filename).toLowerCase()
  const stored = `cover${ext}`
  await writeFile(join(dir, stored), upload.data)
  const url = publicMediaUrl(`figurky/${figurineId}/${stored}`)
  await updateFigurine(figurineId, { image: url })
  return url
}

/**
 * Live phone photos for scrub: keep selection order (left → right by yaw).
 * Middle frame = front. First frame is the back; last index reuses it to close the loop.
 */
export async function saveTurntableFrames(
  figurineId: string,
  uploads: Array<{ filename: string; data: Buffer; type: string }>,
) {
  if (!uploads.length) {
    throw createError({ statusCode: 400, message: 'Немає кадрів для завантаження' })
  }

  if (uploads.length < 3) {
    throw createError({
      statusCode: 400,
      message: 'Потрібно щонайменше 3 кадри: спина, анфас і проміжні ракурси',
    })
  }

  if (uploads.length % 2 === 0) {
    throw createError({
      statusCode: 400,
      message:
        'Кількість кадрів має бути непарною: середина списку - анфас, перший кадр - спина',
    })
  }

  for (const upload of uploads) {
    if (!isAllowedMediaFilename(upload.filename)) {
      throw createError({
        statusCode: 400,
        message: `Файл "${upload.filename}": дозволені лише PNG, JPG, WEBP`,
      })
    }
    if (upload.data.byteLength > MAX_MEDIA_BYTES) {
      throw createError({
        statusCode: 400,
        message: `Файл "${upload.filename}" більший за 10 МБ`,
      })
    }
  }

  const dir = join(figurineMediaDir(figurineId), 'turntable')
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })

  const frames: string[] = []
  for (let i = 0; i < uploads.length; i++) {
    const file = uploads[i]!
    const ext = extname(file.filename).toLowerCase()
    const stored = `frame_${String(i).padStart(2, '0')}${ext}`
    await writeFile(join(dir, stored), file.data)
    frames.push(publicMediaUrl(`figurky/${figurineId}/turntable/${stored}`))
  }

  // Close the loop: last slot shows the same back photo as the first.
  frames[frames.length - 1] = frames[0]!

  try {
    assertTurntableFrames(frames)
  } catch {
    await rm(dir, { recursive: true, force: true })
    throw createError({
      statusCode: 400,
      message: 'Набір кадрів не підходить для обертання на картці',
    })
  }

  const cover = frames[Math.floor((frames.length - 1) / 2)]!
  await updateFigurine(figurineId, {
    previewFrames: frames,
    image: cover,
  })

  return { frames, image: cover }
}

export async function removeFigurineMedia(figurineId: string) {
  await rm(figurineMediaDir(figurineId), { recursive: true, force: true }).catch(
    () => undefined,
  )
}
