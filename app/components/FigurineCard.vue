<script setup lang="ts">
import type { FigurineProduct } from '../../shared/figurky-catalog'
import {
  FIGURINE_STATUS_LABELS,
  figurineMetaLine,
  figurinePath,
  formatPriceUah,
} from '../../shared/figurky-catalog'

const props = defineProps<{
  product: FigurineProduct
}>()

const { has, add } = useCart()

const available = computed(() => props.product.status === 'in_stock')
const inCart = computed(() => has(props.product.id))
const metaLine = computed(() => figurineMetaLine(props.product))
const href = computed(() => figurinePath(props.product.id))

function addToCart() {
  add(props.product.id)
}
</script>

<template>
  <article
    class="figurine-card"
    :data-status="product.status"
  >
    <NuxtLink
      class="figurine-card__media"
      :to="href"
      :aria-label="product.title"
    >
      <img
        class="figurine-card__image"
        :src="product.image"
        :alt="product.imageAlt"
        width="320"
        height="400"
        loading="lazy"
        decoding="async"
      >
      <span class="figurine-card__status" :data-status="product.status">
        {{ FIGURINE_STATUS_LABELS[product.status] }}
      </span>
    </NuxtLink>

    <div class="figurine-card__body stack-tight">
      <h3 class="figurine-card__title">
        <NuxtLink class="figurine-card__title-link" :to="href">
          {{ product.title }}
        </NuxtLink>
      </h3>
      <p class="figurine-card__meta">{{ metaLine }}</p>
      <p v-if="product.painted" class="figurine-card__paint">Ручне фарбування</p>
      <p class="figurine-card__price">{{ formatPriceUah(product.priceUah) }}</p>
    </div>

    <div class="figurine-card__action">
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
  </article>
</template>
