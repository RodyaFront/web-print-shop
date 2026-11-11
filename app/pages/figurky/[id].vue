<script setup lang="ts">
import {
  FIGURINE_STATUS_LABELS,
  figurineMetaLine,
  formatPriceUah,
  getFigurineById,
} from '../../../shared/figurky-catalog'

const { shopName } = useShop()
const route = useRoute()
const { has, add } = useCart()

const product = computed(() => getFigurineById(String(route.params.id)))

if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Фігурку не знайдено',
  })
}

const available = computed(() => product.value?.status === 'in_stock')
const inCart = computed(() => (product.value ? has(product.value.id) : false))
const metaLine = computed(() =>
  product.value ? figurineMetaLine(product.value) : '',
)

useSeoMeta({
  title: () =>
    product.value
      ? `${product.value.title} - фігурка | ${shopName}`
      : `Фігурка | ${shopName}`,
  description: () =>
    product.value
      ? `${product.value.title}. ${figurineMetaLine(product.value)}. Ручне фарбування. Доставка по Україні.`
      : 'Готова фігурка з ручним фарбуванням.',
  ogImage: () => product.value?.image,
})

watch(
  () => route.params.id,
  (id) => {
    if (!getFigurineById(String(id))) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Фігурку не знайдено',
      })
    }
  },
)

function addToCart() {
  if (!product.value) return
  add(product.value.id)
}
</script>

<template>
  <div v-if="product" class="shell section product-page">
    <nav class="product-page__nav" aria-label="Навігація по каталогу">
      <NuxtLink class="text-link" to="/figurky">
        До каталогу
      </NuxtLink>
    </nav>

    <div class="product-page__layout">
      <div class="product-page__media" :data-status="product.status">
        <img
          class="product-page__image"
          :src="product.image"
          :alt="product.imageAlt"
          width="480"
          height="600"
          decoding="async"
        >
        <span class="product-page__status" :data-status="product.status">
          {{ FIGURINE_STATUS_LABELS[product.status] }}
        </span>
      </div>

      <div class="product-page__info stack">
        <header class="stack-tight">
          <h1>{{ product.title }}</h1>
          <p class="lede product-page__meta">{{ metaLine }}</p>
          <p class="product-page__paint">Ручне фарбування</p>
        </header>

        <p class="product-page__price">{{ formatPriceUah(product.priceUah) }}</p>

        <div class="product-page__actions row">
          <button
            v-if="available && !inCart"
            class="btn btn-primary"
            type="button"
            @click="addToCart"
          >
            У кошик
          </button>
          <NuxtLink
            v-else-if="available && inCart"
            class="btn btn-secondary"
            to="/koshyk"
          >
            У кошику
          </NuxtLink>
          <button
            v-else
            class="btn btn-secondary"
            type="button"
            disabled
          >
            Продано
          </button>
        </div>

        <p class="hint">
          Оплата накладеним платежем або на картку. Доставка поштою по Україні.
        </p>
      </div>
    </div>
  </div>
</template>
