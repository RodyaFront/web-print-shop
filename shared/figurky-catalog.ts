export const FIGURINE_STATUSES = ['in_stock', 'sold'] as const
export type FigurineStatus = (typeof FIGURINE_STATUSES)[number]

export const FIGURINE_STATUS_LABELS: Record<FigurineStatus, string> = {
  in_stock: 'В наявності',
  sold: 'Продано',
}

export type FigurineProduct = {
  id: string
  title: string
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
}

/** MVP mock catalog for /figurky gallery. */
export const FIGURKY_CATALOG: FigurineProduct[] = [
  {
    id: 'mock-01',
    title: 'Рей Аянамі',
    franchise: 'Evangelion',
    heightCm: 22,
    scale: '1/7',
    painted: true,
    priceUah: 6200,
    status: 'in_stock',
    image: '/mock/figurky/01.png',
    imageAlt: 'Фігурка Рей Аянамі, ручне фарбування',
  },
  {
    id: 'mock-02',
    title: 'Лейла',
    franchise: 'Genshin Impact',
    heightCm: 24,
    scale: '1/7',
    painted: true,
    priceUah: 7800,
    status: 'in_stock',
    image: '/mock/figurky/02.png',
    imageAlt: 'Фігурка Лейли, ручне фарбування',
  },
  {
    id: 'mock-03',
    title: 'Кецін',
    franchise: 'Genshin Impact',
    heightCm: 25,
    scale: '1/7',
    painted: true,
    priceUah: 8100,
    status: 'sold',
    image: '/mock/figurky/03.png',
    imageAlt: 'Фігурка Кецін, ручне фарбування',
  },
  {
    id: 'mock-04',
    title: 'Фрірен',
    franchise: 'Sousou no Frieren',
    heightCm: 26,
    scale: null,
    painted: true,
    priceUah: 9400,
    status: 'in_stock',
    image: '/mock/figurky/04.png',
    imageAlt: 'Фігурка Фрірен, ручне фарбування',
  },
  {
    id: 'mock-05',
    title: 'Кяру',
    franchise: 'Princess Connect',
    heightCm: 23,
    scale: '1/7',
    painted: true,
    priceUah: 8600,
    status: 'in_stock',
    image: '/mock/figurky/05.png',
    imageAlt: 'Фігурка Кяру, ручне фарбування',
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

export function figurinePath(id: string) {
  return `/figurky/${id}`
}

export function figurineMetaLine(product: FigurineProduct) {
  const parts: string[] = []
  if (product.franchise) parts.push(product.franchise)
  parts.push(`~${product.heightCm} см`)
  if (product.scale) parts.push(product.scale)
  return parts.join(' · ')
}
