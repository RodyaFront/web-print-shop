<script setup lang="ts">
const { shopName } = useShop()
const { count } = useCart()
const route = useRoute()

const cartLabel = computed(() => {
  if (count.value === 0) return 'Кошик'
  return `Кошик, ${count.value}`
})

const onCartPage = computed(() => route.path === '/koshyk' || route.path.startsWith('/koshyk/'))

async function openCart() {
  if (onCartPage.value) return
  await navigateTo('/koshyk')
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink class="brand" to="/" :aria-label="shopName">
        <ShopLogo class="brand__mark" />
        <span class="brand__name">{{ shopName }}</span>
      </NuxtLink>

      <nav class="header-nav" aria-label="Розділи">
        <ul class="nav">
          <li>
            <NuxtLink to="/detali">Деталі</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/figurky">Фігурки</NuxtLink>
          </li>
        </ul>
      </nav>

      <nav class="header-cta" aria-label="Замовлення">
        <NuxtLink class="btn btn-secondary" to="/detali/zamovyty">
          Замовити деталі
        </NuxtLink>
        <NuxtLink class="btn btn-primary" to="/figurky/zamovyty">
          Замовити фігурку
        </NuxtLink>
        <button
          class="btn btn-secondary header-cart"
          type="button"
          :aria-label="cartLabel"
          :aria-current="onCartPage ? 'page' : undefined"
          @click="openCart"
        >
          <Icon name="ph:shopping-cart" class="icon" aria-hidden="true" />
          <span
            v-if="count > 0"
            class="header-cart__badge"
            aria-hidden="true"
          >
            {{ count }}
          </span>
        </button>
      </nav>
    </div>
  </header>
</template>
