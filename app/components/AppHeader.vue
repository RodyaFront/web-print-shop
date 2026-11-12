<script setup lang="ts">
const { shopName } = useShop()
const { count } = useCart()
const route = useRoute()

const cartLabel = computed(() => {
  if (count.value === 0) return 'Кошик'
  return `Кошик, ${count.value}`
})

const onCartPage = computed(() => route.path === '/koshyk' || route.path.startsWith('/koshyk/'))

const orderOpen = ref(false)
const orderWrap = ref<HTMLElement | null>(null)

async function openCart() {
  if (onCartPage.value) return
  await navigateTo('/koshyk')
}

function toggleOrderMenu() {
  orderOpen.value = !orderOpen.value
}

function closeOrderMenu() {
  orderOpen.value = false
}

function onOrderKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeOrderMenu()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!orderOpen.value) return
  const root = orderWrap.value
  if (!root) return
  if (event.target instanceof Node && root.contains(event.target)) return
  closeOrderMenu()
}

watch(
  () => route.fullPath,
  () => {
    closeOrderMenu()
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onOrderKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onOrderKeydown)
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <div class="site-header__primary">
        <NuxtLink class="brand" to="/" :aria-label="shopName">
          <ShopLogo class="brand__mark" />
          <span class="brand__name">{{ shopName }}</span>
        </NuxtLink>

        <span class="site-header__sep" aria-hidden="true">·</span>

        <nav class="header-nav" aria-label="Розділи">
          <ul class="nav header-nav__list">
            <li>
              <NuxtLink to="/detali">Деталі</NuxtLink>
            </li>
            <li class="header-nav__sep" aria-hidden="true">·</li>
            <li>
              <NuxtLink to="/figurky">Фігурки</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="header-cta">
        <div ref="orderWrap" class="header-order">
          <button
            class="btn btn-primary header-order__trigger"
            type="button"
            :aria-expanded="orderOpen ? 'true' : 'false'"
            aria-haspopup="menu"
            aria-controls="header-order-menu"
            @click="toggleOrderMenu"
          >
            Замовити
            <Icon
              :name="orderOpen ? 'ph:caret-up' : 'ph:caret-down'"
              class="icon-sm"
              aria-hidden="true"
            />
          </button>

          <div
            v-show="orderOpen"
            id="header-order-menu"
            class="header-order__menu"
            role="menu"
            aria-label="Тип замовлення"
          >
            <NuxtLink
              class="header-order__item header-order__item--parts"
              role="menuitem"
              to="/detali/zamovyty"
              @click="closeOrderMenu"
            >
              <Icon name="ph:cube" class="icon" aria-hidden="true" />
              <span>Замовити деталі</span>
            </NuxtLink>
            <NuxtLink
              class="header-order__item header-order__item--figurine"
              role="menuitem"
              to="/figurky/zamovyty"
              @click="closeOrderMenu"
            >
              <Icon name="ph:paint-brush" class="icon" aria-hidden="true" />
              <span>Замовити фігурку</span>
            </NuxtLink>
          </div>
        </div>

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
      </div>
    </div>
  </header>
</template>
