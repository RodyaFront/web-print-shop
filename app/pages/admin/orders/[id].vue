<script setup lang="ts">
import {
  deliveryMethodLabel,
  type DeliveryCarrier,
  type DeliveryMethod,
} from '../../../../shared/delivery'
import { formatPriceUah } from '../../../../shared/figurky-catalog'
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
  files: Array<{
    id: string
    originalName: string
    size: number
  }>
}

const { data, error, refresh } = await useFetch<OrderDetail>(() => `/api/orders/${id.value}`)
const statusDraft = ref<OrderStatus>('new')
const saving = ref(false)
const saveError = ref('')

watch(
  data,
  (value) => {
    if (value) statusDraft.value = value.status
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

async function saveStatus() {
  saveError.value = ''
  saving.value = true
  try {
    await $fetch(`/api/orders/${id.value}`, {
      method: 'PATCH',
      body: { status: statusDraft.value },
    })
    await refresh()
  } catch {
    saveError.value = 'Не вдалося зберегти статус'
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
        <h2>Статус</h2>
        <div v-if="saveError" class="error-box" role="alert">{{ saveError }}</div>
        <div class="row row-end">
          <div class="field field-narrow">
            <label for="status">Статус заявки</label>
            <select id="status" v-model="statusDraft">
              <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
                {{ ORDER_STATUS_LABELS[status] }}
              </option>
            </select>
          </div>
          <button type="button" class="btn btn-primary" :disabled="saving" @click="saveStatus">
            {{ saving ? 'Зберігаємо…' : 'Зберегти' }}
          </button>
        </div>
        <p class="muted">
          Створено: {{ formatDate(data.createdAt) }}. Оновлено: {{ formatDate(data.updatedAt) }}.
        </p>
      </div>

      <div class="card stack">
        <h2>Клієнт</h2>
        <p><strong>{{ data.name }}</strong></p>
        <p>Телефон: {{ data.phone }}</p>
        <p v-if="data.telegram">Telegram: {{ data.telegram }}</p>
        <p v-if="data.viber">Viber: {{ data.viber }}</p>
        <p v-if="data.whatsapp">WhatsApp: {{ data.whatsapp }}</p>
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
              {{ item.title }}
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
