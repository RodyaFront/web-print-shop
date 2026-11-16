<script setup lang="ts">
import { formatPriceUah } from '../../../../shared/figurky-catalog'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  ORDER_TYPE_LABELS,
  ORDER_TYPES,
  type OrderStatus,
  type OrderType,
} from '../../../../shared/shop'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

type OrderListItem = {
  id: string
  type: OrderType
  status: OrderStatus
  createdAt: string
  name: string
  city: string
  phone: string
  isAdultContent?: boolean
  totalUah?: number | null
  quotedPriceUah?: number | null
}

const route = useRoute()
const router = useRouter()

const { data, error, refresh } = await useFetch<OrderListItem[]>('/api/orders')

const statusFilter = ref<string>(String(route.query.status || 'all'))
const typeFilter = ref<string>(String(route.query.type || 'all'))
const search = ref(String(route.query.q || ''))

watch(
  () => route.query,
  (query) => {
    statusFilter.value = String(query.status || 'all')
    typeFilter.value = String(query.type || 'all')
    search.value = String(query.q || '')
  },
)

watch([statusFilter, typeFilter, search], () => {
  const query: Record<string, string> = {}
  if (statusFilter.value !== 'all') query.status = statusFilter.value
  if (typeFilter.value !== 'all') query.type = typeFilter.value
  if (search.value.trim()) query.q = search.value.trim()
  void router.replace({ query })
})

useSeoMeta({
  title: 'Заявки',
  robots: 'noindex, nofollow',
})

function formatDate(value: string) {
  return new Date(value).toLocaleString('uk-UA')
}

const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: data.value?.length ?? 0 }
  for (const status of ORDER_STATUSES) counts[status] = 0
  for (const order of data.value ?? []) {
    counts[order.status] = (counts[order.status] ?? 0) + 1
  }
  return counts
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (data.value ?? []).filter((order) => {
    if (statusFilter.value !== 'all' && order.status !== statusFilter.value) {
      return false
    }
    if (typeFilter.value !== 'all' && order.type !== typeFilter.value) {
      return false
    }
    if (!q) return true
    return (
      order.name.toLowerCase().includes(q)
      || order.phone.toLowerCase().includes(q)
    )
  })
})

function amountLabel(order: OrderListItem) {
  const amount = order.quotedPriceUah ?? order.totalUah
  if (amount == null) return ''
  return formatPriceUah(amount)
}
</script>

<template>
  <div class="stack">
    <div class="row row-between">
      <h1>Заявки</h1>
      <button type="button" class="btn btn-ghost" @click="refresh()">
        <Icon name="ph:arrows-clockwise" class="icon-sm" aria-hidden="true" />
        Оновити
      </button>
    </div>

    <div class="row admin-filters">
      <button
        v-for="status in ['all', ...ORDER_STATUSES]"
        :key="status"
        type="button"
        class="btn btn-ghost"
        :class="{ 'is-pressed': statusFilter === status }"
        @click="statusFilter = status"
      >
        {{ status === 'all' ? 'Усі' : ORDER_STATUS_LABELS[status as OrderStatus] }}
        <span class="muted">({{ statusCounts[status] ?? 0 }})</span>
      </button>
    </div>

    <div class="row row-end admin-filters">
      <div class="field field-narrow">
        <label for="type-filter">Тип</label>
        <select id="type-filter" v-model="typeFilter">
          <option value="all">Усі типи</option>
          <option v-for="type in ORDER_TYPES" :key="type" :value="type">
            {{ ORDER_TYPE_LABELS[type] }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="order-search">Пошук</label>
        <input
          id="order-search"
          v-model="search"
          type="search"
          placeholder="Ім’я або телефон"
          autocomplete="off"
        >
      </div>
    </div>

    <div v-if="error" class="error-box" role="alert">
      Не вдалося завантажити заявки.
    </div>

    <div v-else-if="!filtered.length" class="empty-state">
      <p class="muted">Заявок за цими фільтрами немає.</p>
    </div>

    <div v-else class="table-scroll" data-scroll-x>
      <table class="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Клієнт</th>
            <th>Місто</th>
            <th>Сума</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filtered" :key="order.id">
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
              {{ ORDER_TYPE_LABELS[order.type] }}
              <span v-if="order.isAdultContent" class="badge">18+</span>
            </td>
            <td><span class="badge">{{ ORDER_STATUS_LABELS[order.status] }}</span></td>
            <td>
              <div>{{ order.name }}</div>
              <div class="muted">{{ order.phone }}</div>
            </td>
            <td>{{ order.city || '' }}</td>
            <td>{{ amountLabel(order) }}</td>
            <td>
              <NuxtLink class="icon-gap" :to="`/admin/orders/${order.id}`">
                <Icon name="ph:arrow-square-out" class="icon-sm" aria-hidden="true" />
                Відкрити
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
