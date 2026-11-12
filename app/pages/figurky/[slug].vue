<script setup lang="ts">
import {
  FIGURINE_STATUS_LABELS,
  figurinePath,
  figurineSpecs,
  formatPriceUah,
  getFigurineByParam,
} from '../../../shared/figurky-catalog'

const { shopName } = useShop()
const route = useRoute()
const siteOrigin = useSiteOrigin()
const { has, add } = useCart()

const param = computed(() => String(route.params.slug || ''))
const product = computed(() => getFigurineByParam(param.value))

if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Фігурку не знайдено',
  })
}

// Legacy /figurky/mock-01 → /figurky/rei-ayanami
if (product.value.id === param.value && product.value.slug !== param.value) {
  await navigateTo(figurinePath(product.value), { redirectCode: 301 })
}

const available = computed(() => product.value?.status === 'in_stock')
const inCart = computed(() => (product.value ? has(product.value.id) : false))
const specs = computed(() =>
  product.value ? figurineSpecs(product.value) : [],
)

const canonicalUrl = computed(() =>
  product.value ? `${siteOrigin.value}${figurinePath(product.value)}` : '',
)
const absoluteImage = computed(() => {
  if (!product.value) return ''
  if (product.value.image.startsWith('http')) return product.value.image
  return `${siteOrigin.value}${product.value.image}`
})

useSeoMeta({
  title: () =>
    product.value
      ? `${product.value.seoTitle} | ${shopName}`
      : `Фігурка | ${shopName}`,
  description: () =>
    product.value?.seoDescription
    || 'Аніме фігурка з друком і ручним фарбуванням.',
  ogTitle: () =>
    product.value
      ? `${product.value.seoTitle} | ${shopName}`
      : `Фігурка | ${shopName}`,
  ogDescription: () => product.value?.seoDescription,
  ogImage: () => absoluteImage.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead(() => {
  if (!product.value) return {}
  const p = product.value
  const availability =
    p.status === 'in_stock'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Фігурка ${p.title}`,
    alternateName: p.aliases,
    description: p.seoDescription,
    image: [absoluteImage.value],
    sku: p.id,
    brand: {
      '@type': 'Brand',
      name: shopName,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl.value,
      priceCurrency: 'UAH',
      price: p.priceUah,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Аніме фігурки',
        item: `${siteOrigin.value}/figurky`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: p.title,
        item: canonicalUrl.value,
      },
    ],
  }

  return {
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(productLd),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbLd),
      },
    ],
  }
})

watch(param, (value) => {
  const next = getFigurineByParam(value)
  if (!next) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Фігурку не знайдено',
    })
  }
  if (next.id === value && next.slug !== value) {
    void navigateTo(figurinePath(next), { redirectCode: 301 })
  }
})

function addToCart() {
  if (!product.value) return
  add(product.value.id)
}
</script>

<template>
  <div v-if="product" class="shell section product-page">
    <nav class="product-page__nav" aria-label="Навігація">
      <ol class="breadcrumbs">
        <li>
          <NuxtLink class="text-link icon-gap" to="/figurky">
            <Icon name="ph:arrow-left" class="icon-sm" aria-hidden="true" />
            Аніме фігурки
          </NuxtLink>
        </li>
        <li aria-current="page">{{ product.title }}</li>
      </ol>
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
          <h1>Фігурка {{ product.title }}</h1>
          <p v-if="product.franchise" class="lede product-page__series">
            {{ product.franchise }}
          </p>
        </header>

        <p class="product-page__price">{{ formatPriceUah(product.priceUah) }}</p>
        <p v-if="product.painted" class="product-page__paint">
          Друк і ручне фарбування
        </p>

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

        <div class="product-page__about stack-tight">
          <p
            v-for="(paragraph, index) in product.description.split('\n').filter(Boolean)"
            :key="index"
          >
            {{ paragraph }}
          </p>
        </div>

        <section class="product-specs" aria-labelledby="product-specs-title">
          <h2 id="product-specs-title" class="product-specs__title">
            Характеристики
          </h2>
          <dl class="product-specs__list">
            <div
              v-for="row in specs"
              :key="row.label"
              class="product-specs__row"
            >
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  </div>
</template>
