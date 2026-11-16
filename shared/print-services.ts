/**
 * Print technologies for /detali.
 * Public fields are customer-facing (limits, prices). Machine models stay out of UI.
 * Sell rates come from pricing settings (defaults in print-costing.ts).
 */

import {
  PRINT_COSTING_DEFAULTS,
  PRINT_SELL_RATE_ENGINEERING_LABEL,
  PRINT_SELL_RATE_LABEL,
} from './print-costing'

export type PrintLayerColumn = {
  key: string
  label: string
  hint?: string
  highlight?: boolean
}

export type PrintPriceRow = {
  material: string
  prices: Record<string, string>
}

export const PRINT_LIMIT_IDS = [
  'build-volume',
  'wall',
  'feature',
  'layer',
] as const

export type PrintLimitId = (typeof PRINT_LIMIT_IDS)[number]

/** Limits a buyer needs before sending a model. */
export type PrintCapability = {
  id: PrintLimitId
  label: string
  value: string
  hint?: string
}

export const PRINT_MATERIAL_IDS = [
  'standard',
  'engineering',
] as const

export type PrintMaterialId = (typeof PRINT_MATERIAL_IDS)[number]

export type PrintMaterialInfo = {
  id: PrintMaterialId
  name: string
  forWhat: string
  traits: string
  image: string
  imageAlt: string
}

export type PartsUseCase = {
  title: string
  summary: string
  image: string
  imageAlt: string
}

export type PartsProcessStep = {
  title: string
  summary: string
}

export type PrintTechnology = {
  id: string
  label: string
  shortLabel: string
  available: boolean
  priceUnit: string
  priceFrom: string
  summary: string
  capabilities: PrintCapability[]
  materials: PrintMaterialInfo[]
  layerColumns: PrintLayerColumn[]
  priceRows: PrintPriceRow[]
}

export type PartsPricingInput = {
  standardUahPerG: number
  engineeringUahPerG: number
  partsMinOrderUah: number
}

/** Fallback when pricing API is unavailable (build-time / SSR edge). */
export const PARTS_MIN_ORDER_UAH = 250

export const PARTS_ACCEPTED_FILES = 'STL або OBJ'

export type PartsStat = {
  label: string
  value: string
}

/** Key facts banner under /detali hero. */
export function partsStatsBanner(options: {
  printArea: string
  priceFrom: string
  minOrderLabel: string
}): PartsStat[] {
  return [
    { label: 'Кількість деталей', value: 'від 1' },
    { label: 'Область друку', value: options.printArea },
    { label: 'DLP', value: options.priceFrom ? `від ${options.priceFrom}` : 'фотополімер' },
    { label: 'Мінімальне замовлення', value: options.minOrderLabel },
  ]
}

/**
 * Tasks by request frequency (DLP / photopolymer).
 * Grid shows 4 cards per row; list can grow beyond one row.
 */
export const PARTS_USE_CASES: PartsUseCase[] = [
  {
    title: 'Прототип',
    summary: 'Перевірити форму, посадку й вигляд до серії чи наступного кроку.',
    image: '/mock/detali/prototype.jpg',
    imageAlt: 'Прототип деталі з фотополімерного друку',
  },
  {
    title: 'Дрібна геометрія',
    summary: 'Тонкі ребра, дрібні отвори, чіткі грані - там, де важлива гладкість.',
    image: '/mock/detali/detail.jpg',
    imageAlt: 'Деталь зі складною дрібною геометрією',
  },
  {
    title: 'Корпус під електроніку',
    summary: 'Оболонки, кришки й кожухи під плату, роз’єми та кнопки.',
    image: '/mock/detali/enclosure.jpg',
    imageAlt: 'Корпус під електроніку з фотополімерного друку',
  },
  {
    title: 'Заміна дрібної деталі',
    summary: 'Защіпки, вушка, кліпси та інші дрібні елементи на заміну.',
    image: '/mock/detali/spare.jpg',
    imageAlt: 'Дрібна змінна деталь з фотополімерного друку',
  },
  {
    title: 'Майстер під лиття',
    summary: 'Моделі під випалювання й лиття, коли важлива чистота поверхні.',
    image: '/mock/detali/castable.jpg',
    imageAlt: 'Ливарна майстер-модель з фотополімерного друку',
  },
  {
    title: 'Функційна деталь',
    summary: 'Кріплення й елементи під навантаження на інженерній смолі.',
    image: '/mock/detali/functional.jpg',
    imageAlt: 'Функційна деталь з інженерної смоли',
  },
  {
    title: 'Оснастка й кондуктори',
    summary: 'Пристосування для збірки, позиціонування та перевірки.',
    image: '/mock/detali/fixture.jpg',
    imageAlt: 'Оснастка з фотополімерного друку',
  },
  {
    title: 'Механізми й шестерні',
    summary: 'Дрібні рухомі вузли, коли потрібна точність посадки.',
    image: '/mock/detali/mechanism.jpg',
    imageAlt: 'Шестерні та елементи механізму з фотополімерного друку',
  },
]

export const PARTS_PRICE_FACTORS =
  'Підсумок залежить від об’єму (ваги) моделі, матеріалу, товщини шару, підпорок і постобробки. Орієнтири нижче - "від"; точну суму назвемо після файлу.'

export const PARTS_PROCESS_STEPS: PartsProcessStep[] = [
  {
    title: 'Заявка',
    summary: `Надсилаєте ${PARTS_ACCEPTED_FILES} і коротко описуєте задачу.`,
  },
  {
    title: 'Оцінка',
    summary: 'Переглядаємо модель, називаємо ціну й строк.',
  },
  {
    title: 'Друк',
    summary: 'Друкуємо, знімаємо підпорки, миємо й затверджуємо деталь.',
  },
  {
    title: 'Відправка',
    summary: 'Пакуємо й відправляємо поштою по Україні.',
  },
]

export const PARTS_LEAD_TIME =
  'Строк залежить від обсягу й черги. Назвемо разом із ціною після перегляду моделі.'

export const PARTS_DELIVERY_SUMMARY =
  'Доставка поштою лише по Україні. Оплата накладеним платежем або на картку - оберете після узгодження ціни. Онлайн-оплати на сайті немає.'

function rateLabel(uahPerG: number) {
  return `${uahPerG} грн/г`
}

export function buildPrintTechnologies(
  pricing: PartsPricingInput = {
    standardUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerG,
    engineeringUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerGEngineering,
    partsMinOrderUah: PARTS_MIN_ORDER_UAH,
  },
): PrintTechnology[] {
  const standardLabel = rateLabel(pricing.standardUahPerG)
  const engineeringLabel = rateLabel(pricing.engineeringUahPerG)

  return [
    {
      id: 'sla',
      label: 'Фотополімер',
      shortLabel: 'Фотополімер',
      available: true,
      priceUnit: 'грн/г',
      priceFrom: standardLabel,
      summary:
        'Гладка поверхня й дрібні елементи. Корпуси, кріплення, майстер-моделі, складна форма.',
      capabilities: [
        {
          id: 'build-volume',
          label: 'Максимальний розмір',
          value: 'до 212 × 118 × 220 мм',
        },
        {
          id: 'wall',
          label: 'Мін. товщина стінок',
          value: 'орієнтир від 0,6 мм',
          hint: 'Для надійного друку. Тонші місця узгоджуємо по файлу.',
        },
        {
          id: 'feature',
          label: 'Дрібні елементи',
          value: 'орієнтир від ~0,4 мм',
          hint: 'При шарі 50 мкм. Тонший шар дає чіткіші грані.',
        },
        {
          id: 'layer',
          label: 'Товщина шару',
          value: '25-100 мкм',
          hint: '50 мкм - зазвичай оптимальний баланс швидкості й якості.',
        },
      ],
      materials: [
        {
          id: 'standard',
          name: 'Стандартний',
          forWhat: 'Прототипи, корпуси, майстер-моделі під ґрунт і фарбу.',
          traits: 'Гладка поверхня, добре тримає дріб. Не для високих температур.',
          image: '/mock/detali/resin-wave.png',
          imageAlt: 'Стандартна фотополімерна смола',
        },
        {
          id: 'engineering',
          name: 'Інженерний',
          forWhat: 'Функційні деталі, кріплення, елементи під навантаження.',
          traits: 'Вища міцність і жорсткість порівняно зі стандартним.',
          image: '/mock/detali/resin-wave.png',
          imageAlt: 'Інженерна фотополімерна смола',
        },
      ],
      layerColumns: [
        { key: '100', label: '100 мкм', hint: 'Швидше' },
        { key: '50', label: '50 мкм', hint: 'Оптимально', highlight: true },
        { key: '25', label: '25 мкм', hint: 'Найтонше' },
      ],
      priceRows: [
        {
          material: 'Стандартний',
          prices: {
            '100': standardLabel,
            '50': standardLabel,
            '25': standardLabel,
          },
        },
        {
          material: 'Інженерний',
          prices: {
            '100': engineeringLabel,
            '50': engineeringLabel,
            '25': engineeringLabel,
          },
        },
      ],
    },
  ]
}

/** @deprecated Prefer buildPrintTechnologies(pricing) */
export const PRINT_TECHNOLOGIES: PrintTechnology[] = buildPrintTechnologies()

export function availablePrintTechnologies(
  pricing?: PartsPricingInput,
): PrintTechnology[] {
  return buildPrintTechnologies(pricing).filter((tech) => tech.available)
}

export function formatPartsMinOrder(minOrderUah: number = PARTS_MIN_ORDER_UAH) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(minOrderUah)
}

export {
  PRINT_SELL_RATE_LABEL,
  PRINT_SELL_RATE_ENGINEERING_LABEL,
}
