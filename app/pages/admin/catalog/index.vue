<script setup lang="ts">
import {
  FIGURINE_STATUS_LABELS,
  formatPriceUah,
  type FigurineProduct,
} from '../../../../shared/figurky-catalog'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { data, error, refresh } = await useFetch<FigurineProduct[]>(
  '/api/admin/figurky',
)

useSeoMeta({
  title: 'Каталог',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="stack">
    <div class="row row-between">
      <h1>Каталог фігурок</h1>
      <div class="row">
        <button type="button" class="btn btn-ghost" @click="refresh()">
          <Icon name="ph:arrows-clockwise" class="icon-sm" aria-hidden="true" />
          Оновити
        </button>
        <NuxtLink class="btn btn-primary" to="/admin/catalog/new">
          <Icon name="ph:plus" class="icon-sm" aria-hidden="true" />
          Додати
        </NuxtLink>
      </div>
    </div>

    <div v-if="error" class="error-box" role="alert">
      Не вдалося завантажити каталог.
    </div>

    <div v-else-if="!data?.length" class="empty-state">
      <p class="muted">Позицій ще немає. Додайте першу фігурку.</p>
    </div>

    <div v-else class="table-scroll" data-scroll-x>
      <table class="table">
        <thead>
          <tr>
            <th>Прев’ю</th>
            <th>Назва</th>
            <th>Ціна</th>
            <th>Наявність</th>
            <th>Публікація</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td>
              <img
                class="admin-catalog-thumb"
                :src="item.image"
                :alt="item.imageAlt"
                width="64"
                height="64"
                loading="lazy"
              >
            </td>
            <td>
              <div>{{ item.title }}</div>
              <div class="muted">{{ item.slug }}</div>
            </td>
            <td>{{ formatPriceUah(item.priceUah) }}</td>
            <td>{{ FIGURINE_STATUS_LABELS[item.status] }}</td>
            <td>{{ item.published ? 'На сайті' : 'Чернетка' }}</td>
            <td>
              <NuxtLink class="icon-gap" :to="`/admin/catalog/${item.id}`">
                <Icon name="ph:pencil-simple" class="icon-sm" aria-hidden="true" />
                Редагувати
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
