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
  image: string
  imageAlt: string
  seoTitle: string
  seoDescription: string
  /** Indexable body copy for the product page. */
  description: string
}

/** MVP mock catalog for /figurky gallery. */
export const FIGURKY_CATALOG: FigurineProduct[] = [
  {
    id: 'mock-01',
    slug: 'rei-ayanami',
    title: 'Рей Аянамі',
    aliases: ['Rei Ayanami', 'Аянами Рей', 'Аянамі Рей', 'Rey Ayanami'],
    franchise: 'Evangelion',
    heightCm: 22,
    scale: '1/7',
    painted: true,
    priceUah: 6200,
    status: 'in_stock',
    image: '/mock/figurky/01.png',
    imageAlt: 'Фігурка Рей Аянамі, ручне фарбування',
    seoTitle: 'Фігурка Рей Аянамі (Evangelion) купити',
    seoDescription:
      'Купити фігурку Рей Аянамі (Rei Ayanami) з Evangelion. 3D-друк і ручне фарбування, масштаб 1/7, висота близько 22 см. Доставка по Україні.',
    description:
      'Фігурка Рей Аянамі (Rei Ayanami) з Evangelion. Надрукована й розфарбована вручну. Масштаб 1/7, висота близько 22 см з підставкою.',
  },
  {
    id: 'mock-02',
    slug: 'layla-genshin',
    title: 'Лейла',
    aliases: ['Layla', 'Лейла Genshin', 'Layla Genshin Impact'],
    franchise: 'Genshin Impact',
    heightCm: 24,
    scale: '1/7',
    painted: true,
    priceUah: 7800,
    status: 'in_stock',
    image: '/mock/figurky/02.png',
    imageAlt: 'Фігурка Лейли, ручне фарбування',
    seoTitle: 'Фігурка Лейла (Genshin Impact) купити',
    seoDescription:
      'Купити фігурку Лейли (Layla) з Genshin Impact. 3D-друк і ручне фарбування, масштаб 1/7, висота близько 24 см. Доставка по Україні.',
    description:
      'Фігурка Лейли (Layla) з Genshin Impact. Надрукована й розфарбована вручну. Масштаб 1/7, висота близько 24 см з підставкою.',
  },
  {
    id: 'mock-03',
    slug: 'keqing-genshin',
    title: 'Кецін',
    aliases: ['Keqing', 'Кэцин', 'Keqing Genshin Impact'],
    franchise: 'Genshin Impact',
    heightCm: 25,
    scale: '1/7',
    painted: true,
    priceUah: 8100,
    status: 'sold',
    image: '/mock/figurky/03.png',
    imageAlt: 'Фігурка Кецін, ручне фарбування',
    seoTitle: 'Фігурка Кецін (Genshin Impact) купити',
    seoDescription:
      'Фігурка Кецін (Keqing) з Genshin Impact. 3D-друк і ручне фарбування, масштаб 1/7, висота близько 25 см. Зараз продано.',
    description:
      'Фігурка Кецін (Keqing) з Genshin Impact. Надрукована й розфарбована вручну. Масштаб 1/7, висота близько 25 см з підставкою. Позиція продана.',
  },
  {
    id: 'mock-04',
    slug: 'frieren',
    title: 'Фрірен',
    aliases: ['Frieren', 'Фрирен', 'Sousou no Frieren'],
    franchise: 'Sousou no Frieren',
    heightCm: 26,
    scale: null,
    painted: true,
    priceUah: 9400,
    status: 'in_stock',
    image: '/mock/figurky/04.png',
    imageAlt: 'Фігурка Фрірен, ручне фарбування',
    seoTitle: 'Фігурка Фрірен (Frieren) купити',
    seoDescription:
      'Купити фігурку Фрірен (Frieren) з Sousou no Frieren. 3D-друк і ручне фарбування, висота близько 26 см. Доставка по Україні.',
    description:
      'Фігурка Фрірен (Frieren) з Sousou no Frieren. Надрукована й розфарбована вручну. Висота близько 26 см з підставкою.',
  },
  {
    id: 'mock-05',
    slug: 'kyaru',
    title: 'Кяру',
    aliases: ['Kyaru', 'Kiruya Momochi', 'Кяру Princess Connect'],
    franchise: 'Princess Connect',
    heightCm: 23,
    scale: '1/7',
    painted: true,
    priceUah: 8600,
    status: 'in_stock',
    image: '/mock/figurky/05.png',
    imageAlt: 'Фігурка Кяру, ручне фарбування',
    seoTitle: 'Фігурка Кяру (Kyaru) купити',
    seoDescription:
      'Купити фігурку Кяру (Kyaru) з Princess Connect. 3D-друк і ручне фарбування, масштаб 1/7, висота близько 23 см. Доставка по Україні.',
    description:
      'Фігурка Кяру (Kyaru) з Princess Connect. Надрукована й розфарбована вручну. Масштаб 1/7, висота близько 23 см з підставкою.',
  },
]

export function formatPriceUah(amount: number) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getFigurineById(id: string): FigurineProduct | undefined {
  return FIGURKY_CATALOG.find((item) => item.id === id)
}

export function getFigurineBySlug(slug: string): FigurineProduct | undefined {
  return FIGURKY_CATALOG.find((item) => item.slug === slug)
}

/** Resolve by SEO slug first, then legacy catalog id (for redirects). */
export function getFigurineByParam(param: string): FigurineProduct | undefined {
  return getFigurineBySlug(param) || getFigurineById(param)
}

export function figurinePath(productOrId: FigurineProduct | string) {
  const product =
    typeof productOrId === 'string'
      ? getFigurineById(productOrId) || getFigurineBySlug(productOrId)
      : productOrId
  if (!product) return '/figurky'
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
