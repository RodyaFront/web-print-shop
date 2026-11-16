export const FIGURINE_STATUSES = ['in_stock', 'sold'] as const
export type FigurineStatus = (typeof FIGURINE_STATUSES)[number]

export const FIGURINE_STATUS_LABELS: Record<FigurineStatus, string> = {
  in_stock: 'В наявності',
  sold: 'Продано',
}

export type FigurineProduct = {
  id: string
  /** SEO-friendly URL segment under /figurky/ */
  slug: string
  title: string
  /** Search / language variants of the character name. */
  aliases: string[]
  franchise?: string
  /** Height including base, cm. */
  heightCm: number
  /** Omit or null when non-scale / not applicable. */
  scale?: string | null
  painted: true
  priceUah: number
  status: FigurineStatus
  /** Public catalog only shows published items. */
  published: boolean
  image: string
  imageAlt: string
  /**
   * Optional yaw strip for card scrub (left → right, center = front).
   * Usually live phone photos; omit for a static `image` only.
   */
  previewFrames?: string[]
  seoTitle: string
  seoDescription: string
  /** Indexable body copy for the product page. */
  description: string
}

export function formatPriceUah(amount: number) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function figurinePath(product: FigurineProduct) {
  return `/figurky/${product.slug}`
}

export function figurineMetaLine(product: FigurineProduct) {
  const parts: string[] = []
  if (product.franchise) parts.push(product.franchise)
  parts.push(`~${product.heightCm} см`)
  if (product.scale) parts.push(product.scale)
  return parts.join(' · ')
}

export type FigurineSpec = {
  label: string
  value: string
}

/** Attribute rows for the product page (label / value). */
export function figurineSpecs(product: FigurineProduct): FigurineSpec[] {
  const rows: FigurineSpec[] = []
  if (product.franchise) {
    rows.push({ label: 'Серія', value: product.franchise })
  }
  rows.push({
    label: 'Висота',
    value: `~${product.heightCm} см з підставкою`,
  })
  if (product.scale) {
    rows.push({ label: 'Масштаб', value: product.scale })
  }
  if (product.painted) {
    rows.push({ label: 'Фарбування', value: 'Вручну' })
  }
  rows.push({
    label: 'Наявність',
    value: FIGURINE_STATUS_LABELS[product.status],
  })
  return rows
}

export function findFigurineByParam(
  catalog: readonly FigurineProduct[],
  param: string,
): FigurineProduct | undefined {
  return (
    catalog.find((item) => item.slug === param)
    || catalog.find((item) => item.id === param)
  )
}
