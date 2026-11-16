import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { createError } from 'h3'
import {
  FIGURINE_STATUSES,
  type FigurineProduct,
  type FigurineStatus,
} from '../../shared/figurky-catalog'
import { CATALOG_SEED } from './catalog-seed'
import { readJsonFile, updateJsonFile, writeJsonFile } from './json-store'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function catalogPath() {
  return join(process.cwd(), 'data', 'catalog', 'figurky.json')
}

function isFigurineStatus(value: unknown): value is FigurineStatus {
  return (
    typeof value === 'string'
    && (FIGURINE_STATUSES as readonly string[]).includes(value)
  )
}

function normalizeFigurine(raw: Record<string, unknown>): FigurineProduct | null {
  if (typeof raw.id !== 'string' || !raw.id) return null
  if (typeof raw.slug !== 'string' || !raw.slug) return null
  if (typeof raw.title !== 'string' || !raw.title) return null
  if (typeof raw.priceUah !== 'number' || !Number.isFinite(raw.priceUah)) return null
  if (typeof raw.heightCm !== 'number' || !Number.isFinite(raw.heightCm)) return null
  if (typeof raw.image !== 'string' || !raw.image) return null
  if (typeof raw.imageAlt !== 'string') return null
  if (typeof raw.seoTitle !== 'string') return null
  if (typeof raw.seoDescription !== 'string') return null
  if (typeof raw.description !== 'string') return null
  if (!isFigurineStatus(raw.status)) return null

  const aliases = Array.isArray(raw.aliases)
    ? raw.aliases.filter((item): item is string => typeof item === 'string')
    : []

  const previewFrames = Array.isArray(raw.previewFrames)
    ? raw.previewFrames.filter((item): item is string => typeof item === 'string')
    : undefined

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    aliases,
    franchise: typeof raw.franchise === 'string' ? raw.franchise : undefined,
    heightCm: raw.heightCm,
    scale:
      raw.scale === null || raw.scale === undefined
        ? raw.scale === null
          ? null
          : undefined
        : String(raw.scale),
    painted: true,
    priceUah: Math.round(raw.priceUah),
    status: raw.status,
    published: raw.published !== false,
    image: raw.image,
    imageAlt: raw.imageAlt,
    previewFrames: previewFrames?.length ? previewFrames : undefined,
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    description: raw.description,
  }
}

async function loadCatalog(): Promise<FigurineProduct[]> {
  const path = catalogPath()
  const existing = await readJsonFile<unknown>(path)
  if (existing == null) {
    await writeJsonFile(path, CATALOG_SEED)
    return CATALOG_SEED.map((item) => ({ ...item }))
  }

  if (!Array.isArray(existing)) {
    await writeJsonFile(path, CATALOG_SEED)
    return CATALOG_SEED.map((item) => ({ ...item }))
  }

  const items = existing
    .map((row) =>
      row && typeof row === 'object'
        ? normalizeFigurine(row as Record<string, unknown>)
        : null,
    )
    .filter((item): item is FigurineProduct => Boolean(item))

  return items
}

async function saveCatalog(items: FigurineProduct[]) {
  await writeJsonFile(catalogPath(), items)
}

export async function listFigurines(options?: {
  includeUnpublished?: boolean
}): Promise<FigurineProduct[]> {
  const items = await loadCatalog()
  if (options?.includeUnpublished) return items
  return items.filter((item) => item.published)
}

export async function getFigurine(
  idOrSlug: string,
  options?: { includeUnpublished?: boolean },
): Promise<FigurineProduct | null> {
  const items = await listFigurines({
    includeUnpublished: options?.includeUnpublished,
  })
  return (
    items.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null
  )
}

export type FigurineInput = {
  slug: string
  title: string
  aliases?: string[]
  franchise?: string
  heightCm: number
  scale?: string | null
  priceUah: number
  status?: FigurineStatus
  published?: boolean
  image?: string
  imageAlt: string
  previewFrames?: string[]
  seoTitle: string
  seoDescription: string
  description: string
}

function validateFigurineInput(
  input: FigurineInput,
  options?: { requireImage?: boolean },
) {
  const slug = String(input.slug ?? '').trim().toLowerCase()
  if (!SLUG_RE.test(slug)) {
    throw createError({
      statusCode: 400,
      message: 'Slug: лише латиниця, цифри та дефіси (наприклад rei-ayanami)',
    })
  }

  const title = String(input.title ?? '').trim()
  if (!title) {
    throw createError({ statusCode: 400, message: 'Вкажіть назву' })
  }

  const imageAlt = String(input.imageAlt ?? '').trim()
  if (!imageAlt) {
    throw createError({ statusCode: 400, message: 'Вкажіть alt для зображення' })
  }

  const heightCm = Number(input.heightCm)
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw createError({ statusCode: 400, message: 'Висота має бути більшою за 0' })
  }

  const priceUah = Number(input.priceUah)
  if (!Number.isFinite(priceUah) || priceUah <= 0) {
    throw createError({ statusCode: 400, message: 'Ціна має бути більшою за 0' })
  }

  const seoTitle = String(input.seoTitle ?? '').trim()
  const seoDescription = String(input.seoDescription ?? '').trim()
  const description = String(input.description ?? '').trim()
  if (!seoTitle || !seoDescription || !description) {
    throw createError({
      statusCode: 400,
      message: 'Заповніть SEO-заголовок, опис і текст сторінки',
    })
  }

  const image = String(input.image ?? '').trim()
  if (options?.requireImage !== false && !image) {
    throw createError({ statusCode: 400, message: 'Додайте обкладинку' })
  }

  const status = input.status && isFigurineStatus(input.status)
    ? input.status
    : 'in_stock'

  return {
    slug,
    title,
    aliases: (input.aliases ?? [])
      .map((item) => String(item).trim())
      .filter(Boolean),
    franchise: String(input.franchise ?? '').trim() || undefined,
    heightCm,
    scale:
      input.scale === null || input.scale === undefined || input.scale === ''
        ? null
        : String(input.scale).trim(),
    priceUah: Math.round(priceUah),
    status,
    published: Boolean(input.published),
    image,
    imageAlt,
    previewFrames: input.previewFrames?.length
      ? input.previewFrames.map(String)
      : undefined,
    seoTitle,
    seoDescription,
    description,
  }
}

export async function createFigurine(input: FigurineInput): Promise<FigurineProduct> {
  const validated = validateFigurineInput(
    { ...input, published: false },
    { requireImage: false },
  )

  let created: FigurineProduct | null = null

  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    if (items.some((item) => item.slug === validated.slug)) {
      throw createError({ statusCode: 400, message: 'Такий slug уже зайнятий' })
    }

    created = {
      id: randomUUID(),
      ...validated,
      painted: true,
      published: false,
      image: validated.image || '/mock/figurky/chibi-panda-sad.svg',
    }

    return [...items, created]
  })

  if (!created) {
    throw createError({ statusCode: 500, message: 'Не вдалося створити позицію' })
  }
  return created
}

export async function updateFigurine(
  id: string,
  input: Partial<FigurineInput> & { image?: string; previewFrames?: string[] },
): Promise<FigurineProduct | null> {
  let updated: FigurineProduct | null = null

  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    const index = items.findIndex((item) => item.id === id)
    if (index < 0) return items

    const existing = items[index]!
    const merged: FigurineInput = {
      slug: input.slug ?? existing.slug,
      title: input.title ?? existing.title,
      aliases: input.aliases ?? existing.aliases,
      franchise: input.franchise ?? existing.franchise,
      heightCm: input.heightCm ?? existing.heightCm,
      scale: input.scale !== undefined ? input.scale : existing.scale,
      priceUah: input.priceUah ?? existing.priceUah,
      status: input.status ?? existing.status,
      published: input.published ?? existing.published,
      image: input.image ?? existing.image,
      imageAlt: input.imageAlt ?? existing.imageAlt,
      previewFrames:
        input.previewFrames !== undefined
          ? input.previewFrames
          : existing.previewFrames,
      seoTitle: input.seoTitle ?? existing.seoTitle,
      seoDescription: input.seoDescription ?? existing.seoDescription,
      description: input.description ?? existing.description,
    }

    const validated = validateFigurineInput(merged)

    if (
      items.some((item, i) => i !== index && item.slug === validated.slug)
    ) {
      throw createError({ statusCode: 400, message: 'Такий slug уже зайнятий' })
    }

    if (
      validated.published
      && (
        !validated.image
        || validated.image.includes('chibi-panda-sad.svg')
      )
    ) {
      throw createError({
        statusCode: 400,
        message: 'Перед публікацією завантажте обкладинку',
      })
    }

    updated = {
      ...existing,
      ...validated,
      painted: true,
    }
    const next = [...items]
    next[index] = updated
    return next
  })

  return updated
}

export async function deleteFigurine(id: string): Promise<boolean> {
  let removed = false
  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    const next = items.filter((item) => item.id !== id)
    removed = next.length !== items.length
    return next
  })
  return removed
}

export async function markFigurinesSold(ids: string[]): Promise<void> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return

  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    return items.map((item) =>
      unique.includes(item.id) ? { ...item, status: 'sold' as const } : item,
    )
  })
}

export async function restoreFigurinesInStock(ids: string[]): Promise<void> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return

  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    return items.map((item) =>
      unique.includes(item.id)
        ? { ...item, status: 'in_stock' as const }
        : item,
    )
  })
}

export async function reserveReadyFigurines(
  ids: string[],
): Promise<FigurineProduct[]> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) {
    throw createError({
      statusCode: 400,
      message: 'Кошик порожній або позиції недоступні',
    })
  }

  let reserved: FigurineProduct[] = []

  await updateJsonFile<FigurineProduct[]>(catalogPath(), async (current) => {
    const items = Array.isArray(current)
      ? current
        .map((row) =>
          row && typeof row === 'object'
            ? normalizeFigurine(row as unknown as Record<string, unknown>)
            : null,
        )
        .filter((item): item is FigurineProduct => Boolean(item))
      : await loadCatalog()

    reserved = []
    const next = items.map((item) => {
      if (!unique.includes(item.id)) return item
      if (!item.published || item.status !== 'in_stock') {
        throw createError({
          statusCode: 400,
          message: `Позиція «${item.title || item.id}» недоступна для замовлення`,
        })
      }
      reserved.push(item)
      return { ...item, status: 'sold' as const }
    })

    for (const id of unique) {
      if (!reserved.some((item) => item.id === id)) {
        throw createError({
          statusCode: 400,
          message: `Позиція «${id}» недоступна для замовлення`,
        })
      }
    }

    return next
  })

  return reserved
}

export { saveCatalog }
