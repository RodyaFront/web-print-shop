<script setup lang="ts">
import { FIGURKY_CATALOG } from '../../../shared/figurky-catalog'

const { shopName } = useShop()

useSeoMeta({
  title: `Фігурки під ключ - ${shopName}`,
  description:
    'Готові фігурки з ручним фарбуванням і замовлення під ключ за вашими референсами.',
})

const catalog = FIGURKY_CATALOG

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
          Надішліть референси або модель. Надрукуємо, поґрунтуємо й розфарбуємо
          вручну. Ціну назвемо після перегляду.
        </p>
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
        <h1 id="figurky-catalog-title">Готові фігурки</h1>
        <p class="lede">
          Позиції зі складу: надруковані й розфарбовані вручну.
        </p>
      </div>

      <ul class="product-grid">
        <li v-for="product in catalog" :key="product.id">
          <FigurineCard :product="product" />
        </li>
      </ul>
    </section>
  </div>
</template>
