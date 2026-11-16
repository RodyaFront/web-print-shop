<script setup lang="ts">
import {
  deliveryMethodLabel,
  type DeliveryCarrier,
  type DeliveryMethod,
} from '../../../../shared/delivery'
import { formatPriceUah } from '../../../../shared/figurky-catalog'
import {
  loadedHandUahPerHour,
} from '../../../../shared/print-costing'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type OrderType,
  type PaymentMethod,
  type ReadyOrderItem,
} from '../../../../shared/shop'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const route = useRoute()
const id = computed(() => String(route.params.id))

type OrderDetail = {
  id: string
  type: OrderType
  status: OrderStatus
  createdAt: string
  updatedAt: string
  name: string
  phone: string
  telegram?: string
  viber?: string
  whatsapp?: string
  city: string
  deliveryAddress: string
  description: string
  size: string
  comment: string
  needsPainting: boolean | null
  isAdultContent: boolean
  characterAdultConfirmed: boolean | null
  items?: ReadyOrderItem[]
  totalUah?: number | null
  deliveryCarrier?: DeliveryCarrier | null
  deliveryMethod?: DeliveryMethod | null
  deliveryCityLabel?: string
  deliveryCityArea?: string
  deliveryPointId?: string
  deliveryPointLabel?: string
  paymentMethod?: PaymentMethod
  adminNote?: string
  quotedPriceUah?: number | null
  trackingNumber?: string
  files: Array<{
    id: string
    originalName: string
    size: number
  }>
}

type Pricing = {
  standardUahPerG: number
  engineeringUahPerG: number
  partsMinOrderUah: number
}

const { data, error, refresh } = await useFetch<OrderDetail>(
  () => `/api/orders/${id.value}`,
)
const { data: pricing } = await useFetch<Pricing>('/api/pricing', {
  key: 'parts-pricing',
})

const statusDraft = ref<OrderStatus>('new')
const quotedDraft = ref<number | null>(null)
const trackingDraft = ref('')
const noteDraft = ref('')
const saving = ref(false)
const saveError = ref('')

const calcGrams = ref(50)
const calcMaterial = ref<'standard' | 'engineering'>('standard')
const calcPostHours = ref(0.5)
const calcPaintHours = ref(0)

watch(
  data,
  (value) => {
    if (!value) return
    statusDraft.value = value.status
    quotedDraft.value = value.quotedPriceUah ?? null
    trackingDraft.value = value.trackingNumber ?? ''
    noteDraft.value = value.adminNote ?? ''
    if (value.type === 'parts') calcPaintHours.value = 0
    if (value.type === 'figurine' && value.needsPainting) {
      calcPaintHours.value = Math.max(calcPaintHours.value, 2)
    }
  },
  { immediate: true },
)

useSeoMeta({
  title: 'Заявка',
  robots: 'noindex, nofollow',
})

function formatDate(value: string) {
  return new Date(value).toLocaleString('uk-UA')
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function phoneDigits(phone: string) {
  return phone.replace(/\D/g, '')
}

const phoneTelHref = computed(() => {
  if (!data.value?.phone) return ''
  return `tel:${data.value.phone}`
})

const telegramHref = computed(() => {
  const raw = data.value?.telegram?.trim()
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  const user = raw.replace(/^@/, '')
  return `https://t.me/${user}`
})

const viberHref = computed(() => {
  const digits = phoneDigits(data.value?.viber || data.value?.phone || '')
  if (!digits) return ''
  return `viber://chat?number=%2B${digits}`
})

const whatsappHref = computed(() => {
  const digits = phoneDigits(data.value?.whatsapp || data.value?.phone || '')
  if (!digits) return ''
  return `https://wa.me/${digits}`
})

const gramRate = computed(() => {
  const p = pricing.value
  if (!p) return 15
  return calcMaterial.value === 'engineering'
    ? p.engineeringUahPerG
    : p.standardUahPerG
})

const calcResult = computed(() => {
  const grams = Math.max(0, Number(calcGrams.value) || 0)
  const post = Math.max(0, Number(calcPostHours.value) || 0)
  const paint = Math.max(0, Number(calcPaintHours.value) || 0)
  const handHours = post + paint
  const printUah = grams * gramRate.value
  const handsUah = handHours * loadedHandUahPerHour()
  let total = Math.round(printUah + handsUah)
  if (data.value?.type === 'parts') {
    const min = pricing.value?.partsMinOrderUah ?? 250
    total = Math.max(total, min)
  }
  return {
    printUah: Math.round(printUah),
    handsUah: Math.round(handsUah),
    total,
    handRate: Math.round(loadedHandUahPerHour()),
  }
})

const showCalculator = computed(
  () => data.value?.type === 'figurine' || data.value?.type === 'parts',
)

function applyCalcToQuote() {
  quotedDraft.value = calcResult.value.total
}

async function saveWork() {
  saveError.value = ''
  saving.value = true
  try {
    const quoted =
      quotedDraft.value === null
      || quotedDraft.value === undefined
      || (typeof quotedDraft.value === 'number' && Number.isNaN(quotedDraft.value))
        ? null
        : Number(quotedDraft.value)
    await $fetch(`/api/orders/${id.value}`, {
      method: 'PATCH',
      body: {
        status: statusDraft.value,
        adminNote: noteDraft.value,
        quotedPriceUah: quoted,
        trackingNumber: trackingDraft.value,
      },
    })
    await refresh()
  } catch {
    saveError.value = 'Не вдалося зберегти зміни'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="stack">
    <NuxtLink class="icon-gap" to="/admin/orders">
      <Icon name="ph:caret-left" class="icon-sm" aria-hidden="true" />
      До списку
    </NuxtLink>

    <div v-if="error" class="error-box" role="alert">
      Заявку не знайдено або немає доступу.
    </div>

    <template v-else-if="data">
      <div class="row row-between row-end">
        <div class="stack stack-tight">
          <h1>Заявка</h1>
          <p class="muted">{{ data.id }}</p>
        </div>
        <span class="badge">{{ ORDER_TYPE_LABELS[data.type] }}</span>
        <span v-if="data.isAdultContent" class="badge">18+</span>
      </div>

      <div class="card stack">
        <h2>Робота із заявкою</h2>
        <div v-if="saveError" class="error-box" role="alert">{{ saveError }}</div>
        <div class="admin-work-grid">
          <div class="field">
            <label for="status">Статус</label>
            <select id="status" v-model="statusDraft">
              <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
                {{ ORDER_STATUS_LABELS[status] }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="quoted">Узгоджена ціна, грн</label>
            <input
              id="quoted"
              v-model.number="quotedDraft"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
            >
          </div>
          <div class="field">
            <label for="tracking">ТТН</label>
            <input
              id="tracking"
              v-model="trackingDraft"
              type="text"
              autocomplete="off"
            >
          </div>
        </div>
        <div class="field">
          <label for="admin-note">Нотатка</label>
          <textarea id="admin-note" v-model="noteDraft" rows="4" />
        </div>
        <div class="row row-end">
          <button type="button" class="btn btn-primary" :disabled="saving" @click="saveWork">
            {{ saving ? 'Зберігаємо…' : 'Зберегти' }}
          </button>
        </div>
        <p class="muted">
          Створено: {{ formatDate(data.createdAt) }}. Оновлено: {{ formatDate(data.updatedAt) }}.
        </p>
      </div>

      <div v-if="showCalculator" class="card stack">
        <h2>Калькулятор ціни</h2>
        <div class="admin-work-grid">
          <div class="field">
            <label for="calc-grams">Грами (зі слайсера)</label>
            <input
              id="calc-grams"
              v-model.number="calcGrams"
              type="number"
              min="0"
              step="0.1"
            >
          </div>
          <div class="field">
            <label for="calc-material">Матеріал</label>
            <select id="calc-material" v-model="calcMaterial">
              <option value="standard">
                Стандартний ({{ pricing?.standardUahPerG ?? 15 }} грн/г)
              </option>
              <option value="engineering">
                Інженерний ({{ pricing?.engineeringUahPerG ?? 30 }} грн/г)
              </option>
            </select>
          </div>
          <div class="field">
            <label for="calc-post">Години постобробки</label>
            <input
              id="calc-post"
              v-model.number="calcPostHours"
              type="number"
              min="0"
              step="0.1"
            >
          </div>
          <div v-if="data.type === 'figurine'" class="field">
            <label for="calc-paint">Години фарбування</label>
            <input
              id="calc-paint"
              v-model.number="calcPaintHours"
              type="number"
              min="0"
              step="0.1"
            >
          </div>
        </div>
        <p>
          Друк: {{ formatPriceUah(calcResult.printUah) }}.
          Руки ({{ calcResult.handRate }} грн/год): {{ formatPriceUah(calcResult.handsUah) }}.
        </p>
        <p v-if="data.type === 'parts'" class="muted">
          Для деталей не нижче мінімального замовлення
          ({{ formatPriceUah(pricing?.partsMinOrderUah ?? 250) }}).
        </p>
        <div class="row row-end">
          <strong>{{ formatPriceUah(calcResult.total) }}</strong>
          <button type="button" class="btn btn-ghost" @click="applyCalcToQuote">
            В узгоджену ціну
          </button>
        </div>
      </div>

      <div class="card stack">
        <h2>Клієнт</h2>
        <p><strong>{{ data.name }}</strong></p>
        <p>
          Телефон:
          <a v-if="phoneTelHref" class="text-link" :href="phoneTelHref">{{ data.phone }}</a>
          <span v-else>{{ data.phone }}</span>
        </p>
        <p v-if="data.telegram">
          Telegram:
          <a class="text-link" :href="telegramHref" target="_blank" rel="noopener">
            {{ data.telegram }}
          </a>
        </p>
        <p v-if="data.viber || viberHref">
          Viber:
          <a v-if="viberHref" class="text-link" :href="viberHref">{{ data.viber || data.phone }}</a>
        </p>
        <p v-if="data.whatsapp || whatsappHref">
          WhatsApp:
          <a v-if="whatsappHref" class="text-link" :href="whatsappHref" target="_blank" rel="noopener">
            {{ data.whatsapp || data.phone }}
          </a>
        </p>
        <p v-if="data.city">Місто: {{ data.city }}</p>
        <template v-if="data.deliveryMethod">
          <p>
            Спосіб:
            {{ deliveryMethodLabel(data.deliveryMethod) }}
          </p>
          <p v-if="data.deliveryPointLabel">
            Пункт: {{ data.deliveryPointLabel }}
          </p>
        </template>
        <p v-else-if="data.deliveryAddress">
          Доставка: {{ data.deliveryAddress }}
        </p>
        <p v-if="data.type === 'ready'">
          Оплата:
          {{ PAYMENT_METHOD_LABELS[data.paymentMethod === 'card' ? 'card' : 'cod'] }}
        </p>
      </div>

      <div class="card stack">
        <h2>Замовлення</h2>
        <template v-if="data.type === 'ready'">
          <ul v-if="data.items?.length" class="file-list">
            <li v-for="item in data.items" :key="item.id">
              <NuxtLink class="text-link" :to="`/admin/catalog/${item.id}`">
                {{ item.title }}
              </NuxtLink>
              <span class="muted"> · {{ formatPriceUah(item.priceUah) }}</span>
            </li>
          </ul>
          <p v-if="data.totalUah != null">
            <strong>Сума:</strong> {{ formatPriceUah(data.totalUah) }}
          </p>
        </template>
        <template v-else>
          <p v-if="data.size"><strong>Розмір:</strong> {{ data.size }}</p>
          <p><strong>Опис:</strong> {{ data.description }}</p>
        </template>
        <p v-if="data.comment"><strong>Коментар:</strong> {{ data.comment }}</p>
        <p v-if="data.type === 'ready'">
          Фарбування: входить у послугу
        </p>
        <p v-else-if="data.needsPainting !== null">
          Фарбування: {{ data.needsPainting ? 'потрібне' : 'не потрібне' }}
        </p>
        <p v-if="data.isAdultContent">
          18+: так
          <span v-if="data.characterAdultConfirmed"> · персонаж повнолітній підтверджено</span>
        </p>
      </div>

      <div class="card stack">
        <h2>Файли</h2>
        <p v-if="!data.files.length" class="muted">Файлів немає.</p>
        <ul v-else class="file-list">
          <li v-for="file in data.files" :key="file.id">
            <a :href="`/api/orders/${data.id}/files/${file.id}`">
              {{ file.originalName }}
            </a>
            <span class="muted"> · {{ formatSize(file.size) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
