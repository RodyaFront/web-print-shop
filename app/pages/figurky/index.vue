<script setup lang="ts">
import { FIGURKY_CATALOG, figurinePath } from '../../../shared/figurky-catalog'

const { shopName } = useShop()
const siteOrigin = useSiteOrigin()

const catalog = FIGURKY_CATALOG
const catalogUrl = computed(() => `${siteOrigin.value}/figurky`)

const productGridRef = ref<HTMLElement | null>(null)
const gridColumnCount = ref(1)

const fillerCount = computed(() => {
  const cols = gridColumnCount.value
  if (cols <= 1) return 0
  const rem = catalog.length % cols
  return rem === 0 ? 0 : cols - rem
})

function readGridColumns(el: HTMLElement) {
  const template = getComputedStyle(el).gridTemplateColumns
  if (!template || template === 'none') {
    gridColumnCount.value = 1
    return
  }
  gridColumnCount.value = template.split(/\s+/).filter(Boolean).length
}

let gridObserver: ResizeObserver | null = null

onMounted(() => {
  const el = productGridRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  readGridColumns(el)
  gridObserver = new ResizeObserver(() => {
    readGridColumns(el)
  })
  gridObserver.observe(el)
})

onBeforeUnmount(() => {
  gridObserver?.disconnect()
  gridObserver = null
})

useSeoMeta({
  title: `Купити аніме фігурки - ручне фарбування | ${shopName}`,
  description:
    'Купити готові аніме фігурки в Україні. Ручне фарбування, доставка поштою. Також фігурка під ваш запит.',
  ogTitle: `Купити аніме фігурки | ${shopName}`,
  ogDescription:
    'Готові аніме фігурки з ручним фарбуванням. Доставка по Україні. Замовлення під ключ за референсами.',
  ogType: 'website',
})

useHead(() => {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Купити аніме фігурки',
    description:
      'Готові аніме фігурки з ручним фарбуванням і замовлення під ключ.',
    url: catalogUrl.value,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: catalog.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteOrigin.value}${figurinePath(product)}`,
        name: `Фігурка ${product.title}`,
        image: product.image.startsWith('http')
          ? product.image
          : `${siteOrigin.value}${product.image}`,
      })),
    },
  }

  return {
    link: [{ rel: 'canonical', href: catalogUrl.value }],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(itemList),
      },
    ],
  }
})


/** Subtle parallax range for the figurine track (px). */
const FIG_PARALLAX_PX = 14
/** Decals follow the same vector, weaker than the figurine. */
const DECAL_PARALLAX_FACTOR = 0.35
/** Per-frame lerp toward pointer (0..1). Lower = softer. */
const FIG_PARALLAX_SMOOTH = 0.1
const FIG_PARALLAX_EPSILON = 0.05

const bannerRef = ref<HTMLElement | null>(null)

let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let hovering = false
let rafId = 0

function canParallax(event: PointerEvent) {
  if (event.pointerType === 'touch') return false
  if (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  return true
}

function paintParallax() {
  const el = bannerRef.value
  if (!el) return
  el.style.setProperty('--fig-mx', `${currentX}px`)
  el.style.setProperty('--fig-my', `${currentY}px`)
  el.style.setProperty('--decal-mx', `${currentX * DECAL_PARALLAX_FACTOR}px`)
  el.style.setProperty('--decal-my', `${currentY * DECAL_PARALLAX_FACTOR}px`)
}

function tick() {
  currentX += (targetX - currentX) * FIG_PARALLAX_SMOOTH
  currentY += (targetY - currentY) * FIG_PARALLAX_SMOOTH

  if (Math.abs(targetX - currentX) < FIG_PARALLAX_EPSILON) currentX = targetX
  if (Math.abs(targetY - currentY) < FIG_PARALLAX_EPSILON) currentY = targetY

  paintParallax()

  const stillMoving =
    Math.abs(targetX - currentX) > FIG_PARALLAX_EPSILON
    || Math.abs(targetY - currentY) > FIG_PARALLAX_EPSILON

  if (hovering || stillMoving) {
    rafId = requestAnimationFrame(tick)
    return
  }

  rafId = 0
}

function ensureTick() {
  if (rafId) return
  rafId = requestAnimationFrame(tick)
}

function onBannerPointerMove(event: PointerEvent) {
  if (!canParallax(event)) return
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return

  hovering = true
  const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
  const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  targetX = nx * FIG_PARALLAX_PX
  targetY = ny * FIG_PARALLAX_PX
  ensureTick()
}

function onBannerPointerLeave() {
  hovering = false
  targetX = 0
  targetY = 0
  ensureTick()
}

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="shell section stack figurky-page">
    <aside
      ref="bannerRef"
      class="custom-banner"
      aria-labelledby="custom-banner-title"
      @pointermove="onBannerPointerMove"
      @pointerleave="onBannerPointerLeave"
    >
      <div class="custom-banner__surface" aria-hidden="true">
        <span class="custom-banner__glow custom-banner__glow--br" />
        <span class="custom-banner__glow custom-banner__glow--tl" />
        <BannerDecals :count="18" :seed="17">
          <svg
            class="banner-decals__mark banner-decals__mark--star"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path
              d="M12 2.2 14.7 9h7.1l-5.7 4.3 2.2 6.9L12 16.6 5.7 20.2l2.2-6.9L2.2 9h7.1L12 2.2Z"
              fill="currentColor"
            />
          </svg>
        </BannerDecals>
      </div>
      <div class="custom-banner__copy">
        <h2 id="custom-banner-title">Фігурка під ваш запит</h2>
        <p>
          Надішліть референси або модель - надрукуємо й за потреби розфарбуємо
          вручну. Ціну назвемо після перегляду
        </p>
        <p>Також приймаємо запити 18+</p>
        <NuxtLink class="btn custom-banner__cta" to="/figurky/zamovyty">
          Замовити
          <Icon name="ph:arrow-right" class="icon" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="custom-banner__visual" aria-hidden="true">
        <div class="custom-banner__fig-track">
          <img
            class="custom-banner__fig"
            src="/mock/figurky/02.png"
            alt=""
            width="320"
            height="400"
            loading="eager"
            decoding="async"
          >
        </div>
      </div>
    </aside>

    <section class="figurky-catalog" aria-labelledby="figurky-catalog-title">
      <div class="section-title">
        <h1 id="figurky-catalog-title">Купити аніме фігурки</h1>
        <p class="lede">
          Готові позиції зі складу: надруковані й розфарбовані вручну.
        </p>
      </div>

      <ul ref="productGridRef" class="product-grid">
        <li v-for="product in catalog" :key="product.id">
          <FigurineCard :product="product" />
        </li>
        <li
          v-for="n in fillerCount"
          :key="`filler-${n}`"
          class="product-grid__filler"
          aria-hidden="true"
        >
          <div class="figurine-card-placeholder">
            <span class="figurine-card-placeholder__label">Пусто</span>
          </div>
        </li>
      </ul>

      <div class="figurky-seo stack">
        <h2 class="figurky-seo__title">Аніме фігурки з ручним фарбуванням</h2>
        <p>
          У каталозі Фігулярні зібрані готові аніме фігурки для покупки в Україні.
          Кожну позицію друкуємо й фарбуємо вручну. Оплата накладеним платежем
          або на картку, доставка поштою.
        </p>
        <p>
          Немає потрібного персонажа в каталозі - можна
          <NuxtLink to="/figurky/zamovyty">замовити фігурку під ключ</NuxtLink>
          за своїми референсами або моделлю.
        </p>
      </div>
    </section>
  </div>
</template>

