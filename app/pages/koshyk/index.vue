<script setup lang="ts">
import {
  figurineMetaLine,
  figurinePath,
  formatPriceUah,
} from '../../../shared/figurky-catalog'

const { shopName } = useShop()
const { items, count, totalUah, remove } = useCart()

useSeoMeta({
  title: `Кошик - ${shopName}`,
  description: 'Готові фігурки в кошику. Оформлення з оплатою накладеним платежем.',
  robots: 'noindex, nofollow',
})

const countLabel = computed(() => {
  const n = count.value
  if (n === 1) return '1 позиція'
  if (n >= 2 && n <= 4) return `${n} позиції`
  return `${n} позицій`
})
</script>

<template>
  <div class="shell section stack cart-page">
    <header class="section-title">
      <h1>Кошик</h1>
      <p v-if="count" class="lede">{{ countLabel }}</p>
    </header>

    <div v-if="!count" class="cart-empty card stack">
      <p class="lede">
        Кошик порожній. Оберіть готову фігурку в каталозі.
      </p>
      <div>
        <NuxtLink class="btn btn-primary" to="/figurky">
          До каталогу
        </NuxtLink>
      </div>
    </div>

    <div v-else class="cart-layout">
      <ul class="cart-list">
        <li
          v-for="product in items"
          :key="product.id"
          class="cart-line"
        >
          <div class="cart-line__media">
            <img
              :src="product.image"
              :alt="product.imageAlt"
              width="120"
              height="150"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="cart-line__info stack-tight">
            <h2 class="cart-line__title">
              <NuxtLink class="cart-line__title-link" :to="figurinePath(product)">
                {{ product.title }}
              </NuxtLink>
            </h2>
            <p class="cart-line__meta">{{ figurineMetaLine(product) }}</p>
            <p class="cart-line__qty">1 шт</p>
          </div>
          <p class="cart-line__price">{{ formatPriceUah(product.priceUah) }}</p>
          <button
            class="btn-icon cart-line__remove"
            type="button"
            :aria-label="`Прибрати ${product.title}`"
            @click="remove(product.id)"
          >
            <Icon name="ph:trash" class="icon" aria-hidden="true" />
          </button>
        </li>
      </ul>

      <aside class="cart-summary" aria-labelledby="cart-summary-title">
        <h2 id="cart-summary-title">Разом</h2>
        <p class="cart-summary__total">{{ formatPriceUah(totalUah) }}</p>
        <p class="cart-summary__note">
          Оплата: накладений платіж або на картку - оберете при оформленні.
        </p>
        <NuxtLink class="btn btn-primary cart-summary__cta" to="/koshyk/oformyty">
          Оформити замовлення
        </NuxtLink>
        <NuxtLink class="cart-summary__link" to="/figurky">
          Продовжити покупки
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>
