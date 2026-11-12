/**
 * Print technologies for /detali.
 * Public fields are customer-facing (limits, prices). Machine models stay out of UI.
 */

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

export type PrintMaterialInfo = {
  name: string
  forWhat: string
  traits: string
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

export const PARTS_MIN_ORDER_UAH = 350

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

export const PRINT_TECHNOLOGIES: PrintTechnology[] = [
  {
    id: 'sla',
    label: 'Фотополімер',
    shortLabel: 'Фотополімер',
    available: true,
    priceUnit: 'грн/г',
    priceFrom: '29,7 грн/г',
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
        name: 'Стандартний',
        forWhat: 'Прототипи, корпуси, майстер-моделі під ґрунт і фарбу.',
        traits: 'Гладка поверхня, добре тримає дріб. Не для високих температур.',
      },
      {
        name: 'Інженерний',
        forWhat: 'Функційні деталі, кріплення, елементи під навантаження.',
        traits: 'Вища міцність і жорсткість порівняно зі стандартним.',
      },
      {
        name: 'Ливарний',
        forWhat: 'Майстер-моделі під випалювання / лиття.',
        traits: 'Під випалювання. Не як кінцева деталь у роботі.',
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
          '100': 'від 29,7 грн/г',
          '50': 'від 31,7 грн/г',
          '25': 'від 34,1 грн/г',
        },
      },
      {
        material: 'Інженерний',
        prices: {
          '100': 'від 35,6 грн/г',
          '50': 'від 36 грн/г',
          '25': 'від 36,7 грн/г',
        },
      },
      {
        material: 'Ливарний',
        prices: {
          '100': 'від 40,2 грн/г',
          '50': 'від 45,2 грн/г',
          '25': '-',
        },
      },
    ],
  },
]

export function availablePrintTechnologies() {
  return PRINT_TECHNOLOGIES.filter((tech) => tech.available)
}

export function formatPartsMinOrder() {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(PARTS_MIN_ORDER_UAH)
}
