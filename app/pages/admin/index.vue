<script setup lang="ts">
import {
  FIGURINE_STATUS_LABELS,
  type FigurineProduct,
} from '../../../shared/figurky-catalog'
import {
  type OrderStatus,
  type OrderType,
} from '../../../shared/shop'

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
}

const [{ data: orders }, { data: catalog }] = await Promise.all([
  useFetch<OrderListItem[]>('/api/orders'),
  useFetch<FigurineProduct[]>('/api/admin/figurky'),
])

useSeoMeta({
  title: 'Адмінка',
  robots: 'noindex, nofollow',
})

const newCount = computed(
  () => orders.value?.filter((item) => item.status === 'new').length ?? 0,
)
const inProgressCount = computed(
  () =>
    orders.value?.filter((item) =>
      item.status === 'in_progress' || item.status === 'shipped',
    ).length ?? 0,
)
const inStockCount = computed(
  () =>
    catalog.value?.filter((item) => item.status === 'in_stock').length ?? 0,
)
</script>

<template>
  <div class="stack">
    <h1>Кабінет</h1>
    <p class="lede muted">
      Короткий огляд заявок і каталогу.
    </p>

    <div class="admin-summary">
      <NuxtLink class="card stack stack-tight" to="/admin/orders?status=new">
        <p class="muted">Нові заявки</p>
        <p class="admin-summary__value">{{ newCount }}</p>
      </NuxtLink>
      <NuxtLink class="card stack stack-tight" to="/admin/orders?status=in_progress">
        <p class="muted">В роботі</p>
        <p class="admin-summary__value">{{ inProgressCount }}</p>
      </NuxtLink>
      <NuxtLink class="card stack stack-tight" to="/admin/catalog">
        <p class="muted">{{ FIGURINE_STATUS_LABELS.in_stock }}</p>
        <p class="admin-summary__value">{{ inStockCount }}</p>
      </NuxtLink>
    </div>

    <div class="row">
      <NuxtLink class="btn btn-primary" to="/admin/orders">
        <Icon name="ph:clipboard-text" class="icon-sm" aria-hidden="true" />
        Заявки
      </NuxtLink>
      <NuxtLink class="btn btn-ghost" to="/admin/catalog">
        <Icon name="ph:package" class="icon-sm" aria-hidden="true" />
        Каталог
      </NuxtLink>
      <NuxtLink class="btn btn-ghost" to="/admin/pricing">
        <Icon name="ph:currency-circle-dollar" class="icon-sm" aria-hidden="true" />
        Ціни деталей
      </NuxtLink>
    </div>
  </div>
</template>
