import {
  TURNTABLE_TARGET_FRAMES,
  TURNTABLE_TARGET_STEP_DEG,
  turntableCenterIndex,
} from '../../shared/turntable-scrub'
import type { FigurineProduct } from '../../shared/figurky-catalog'

/** −180° … +180° at the recommended step (ends = back, middle = front). */
const TURNTABLE_ANGLES_DEG = Array.from(
  { length: TURNTABLE_TARGET_FRAMES },
  (_, i) => -180 + i * TURNTABLE_TARGET_STEP_DEG,
)

function mockTurntableFrames(slug: 'hutao' | 'friren'): string[] {
  const back = `/mock/figurky/turntable/${slug}/${slug}_m180.png`
  return TURNTABLE_ANGLES_DEG.map((deg) => {
    if (deg === 0) return `/mock/figurky/turntable/${slug}/${slug}_z000.png`
    if (Math.abs(deg) === 180) return back
    const sign = deg < 0 ? 'm' : 'p'
    return `/mock/figurky/turntable/${slug}/${slug}_${sign}${String(Math.abs(deg)).padStart(3, '0')}.png`
  })
}

const MOCK_TURNTABLE_HUTAO = mockTurntableFrames('hutao')
const MOCK_TURNTABLE_FRIREN = mockTurntableFrames('friren')
const MOCK_TURNTABLE_FRONT =
  MOCK_TURNTABLE_HUTAO[turntableCenterIndex(MOCK_TURNTABLE_HUTAO.length)]!
const MOCK_TURNTABLE_FRIREN_FRONT =
  MOCK_TURNTABLE_FRIREN[turntableCenterIndex(MOCK_TURNTABLE_FRIREN.length)]!

/** Initial catalog seed written to data/catalog/figurky.json on first read. */
export const CATALOG_SEED: FigurineProduct[] = [
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
    published: true,
    image: MOCK_TURNTABLE_FRONT,
    previewFrames: [...MOCK_TURNTABLE_HUTAO],
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
    published: true,
    image: MOCK_TURNTABLE_FRONT,
    previewFrames: [...MOCK_TURNTABLE_HUTAO],
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
    published: true,
    image: MOCK_TURNTABLE_FRONT,
    previewFrames: [...MOCK_TURNTABLE_HUTAO],
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
    published: true,
    image: MOCK_TURNTABLE_FRIREN_FRONT,
    previewFrames: [...MOCK_TURNTABLE_FRIREN],
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
    published: true,
    image: MOCK_TURNTABLE_FRONT,
    previewFrames: [...MOCK_TURNTABLE_HUTAO],
    imageAlt: 'Фігурка Кяру, ручне фарбування',
    seoTitle: 'Фігурка Кяру (Kyaru) купити',
    seoDescription:
      'Купити фігурку Кяру (Kyaru) з Princess Connect. 3D-друк і ручне фарбування, масштаб 1/7, висота близько 23 см. Доставка по Україні.',
    description:
      'Фігурка Кяру (Kyaru) з Princess Connect. Надрукована й розфарбована вручну. Масштаб 1/7, висота близько 23 см з підставкою.',
  },
]
