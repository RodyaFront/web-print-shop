<script setup lang="ts">
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
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
}

const { data, error, refresh } = await useFetch<OrderListItem[]>('/api/orders')

useSeoMeta({
  title: 'Заявки',
  robots: 'noindex, nofollow',
})

function formatDate(value: string) {
  return new Date(value).toLocaleString('uk-UA')
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

    <div v-if="error" class="error-box" role="alert">
      Не вдалося завантажити заявки.
    </div>

    <div v-else-if="!data?.length" class="empty-state">
      <p class="muted">Заявок ще немає.</p>
    </div>

    <div v-else class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Клієнт</th>
            <th>Місто</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in data" :key="order.id">
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
            <td>{{ order.city || '—' }}</td>
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
