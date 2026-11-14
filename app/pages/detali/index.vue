<script setup lang="ts">
import {
  availablePrintTechnologies,
  formatPartsMinOrder,
  PARTS_ACCEPTED_FILES,
  PARTS_DELIVERY_SUMMARY,
  PARTS_LEAD_TIME,
  PARTS_PRICE_FACTORS,
  PARTS_PROCESS_STEPS,
  PARTS_USE_CASES,
  partsStatsBanner,
} from '../../../shared/print-services'

const { shopName } = useShop()

const technologies = availablePrintTechnologies()
const minOrderLabel = formatPartsMinOrder()
const priceFrom = technologies[0]?.priceFrom || ''
const primaryTech = technologies[0]
const printArea =
  primaryTech?.capabilities.find((item) => item.id === 'build-volume')
    ?.value || ''
const heroStats = partsStatsBanner({
  printArea,
  priceFrom,
  minOrderLabel,
})

const metaDescription = [
  '3D-друк деталей в Одесі за вашою моделлю: прототипи, корпуси, функційні деталі.',
  'Фотополімер, STL або OBJ.',
  priceFrom ? `Ціни від ${priceFrom}.` : '',
  'Доставка по Україні.',
]
  .filter(Boolean)
  .join(' ')

useSeoMeta({
  title: `3D-друк Одеса - деталі на замовлення | ${shopName}`,
  description: metaDescription,
  ogTitle: `3D-друк Одеса - деталі на замовлення | ${shopName}`,
  ogDescription: metaDescription,
})
</script>

<template>
  <div class="shell section stack detali-page">
    <header class="hero detali-hero">
      <div class="detali-hero__main">
        <div class="hero-copy">
          <h1>3D-друк Одеса</h1>
          <p class="lede">
            Технічні деталі й прототипи за вашою моделлю.
          </p>
        </div>
      </div>
    </header>

    <aside class="detali-stats" aria-label="Параметри друку">
      <div class="detali-stats__surface" aria-hidden="true" />
      <div class="detali-stats__body">
        <dl class="detali-stats__grid">
          <div
            v-for="stat in heroStats"
            :key="stat.label"
            class="detali-stats__item"
          >
            <dt>{{ stat.label }}</dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
        <div class="detali-stats__actions">
          <a class="btn detali-stats__cta detali-stats__cta--secondary" href="#ceny">
            Ціни
          </a>
          <NuxtLink class="btn detali-stats__cta" to="/detali/zamovyty">
            Замовити деталі
          </NuxtLink>
        </div>
      </div>
    </aside>

    <dl
      v-if="primaryTech"
      class="detali-specs"
      aria-label="Обмеження друку"
    >
      <div
        v-for="item in primaryTech.capabilities"
        :key="item.id"
        class="detali-specs__item"
      >
        <DetaliLimitVisual :id="item.id" />
        <div class="detali-specs__copy">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
          <p v-if="item.hint" class="muted">{{ item.hint }}</p>
        </div>
      </div>
    </dl>

    <section class="stack" aria-labelledby="use-cases-title">
      <div class="section-title">
        <h2 id="use-cases-title">Які задачі беремо</h2>
        <p class="lede">
          Найчастіші запити. Якщо ваша деталь схожа - надішліть модель.
        </p>
      </div>
      <ul class="detali-task-grid">
        <li v-for="item in PARTS_USE_CASES" :key="item.title">
          <article class="detali-task-card">
            <div class="detali-task-card__media">
              <img
                class="detali-task-card__image"
                :src="item.image"
                :alt="item.imageAlt"
                width="640"
                height="320"
                loading="lazy"
                decoding="async"
              >
            </div>
            <div class="detali-task-card__body">
              <h3 class="detali-task-card__title">{{ item.title }}</h3>
              <p class="detali-task-card__text">{{ item.summary }}</p>
            </div>
          </article>
        </li>
      </ul>
    </section>

    <section
      v-if="primaryTech"
      class="stack"
      aria-labelledby="materials-title"
    >
      <div class="section-title">
        <h2 id="materials-title">Матеріали</h2>
        <p class="lede">
          Обираємо за задачею: міцність, гладкість чи під лиття.
        </p>
      </div>
      <ul class="detali-materials">
        <li
          v-for="mat in primaryTech.materials"
          :key="mat.id"
          class="detali-materials__item"
          :data-material="mat.id"
        >
          <div class="detali-materials__media">
            <img
              class="detali-materials__image"
              :src="mat.image"
              :alt="mat.imageAlt"
              width="640"
              height="320"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="detali-materials__copy">
            <strong>{{ mat.name }}</strong>
            <p>{{ mat.forWhat }}</p>
            <p class="muted">{{ mat.traits }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section id="ceny" class="stack detali-prices" aria-labelledby="prices-title">
      <div class="section-title">
        <h2 id="prices-title">Ціни</h2>
        <p class="lede">
          {{ PARTS_PRICE_FACTORS }}
        </p>
        <p class="detali-prices__min">
          Мінімальне замовлення - {{ minOrderLabel }}.
        </p>
      </div>

      <div
        v-for="tech in technologies"
        :key="`prices-${tech.id}`"
        class="stack"
      >
        <h3 v-if="technologies.length > 1" class="detali-prices__tech">
          {{ tech.label }}
        </h3>
        <div class="table-scroll detali-prices__panel">
          <table class="table detali-price-table">
            <caption class="visually-hidden">
              Ціни {{ tech.label }}, {{ tech.priceUnit }}
            </caption>
            <thead>
              <tr>
                <th scope="col">Матеріал</th>
                <th
                  v-for="col in tech.layerColumns"
                  :key="col.key"
                  scope="col"
                  :class="{ 'is-highlight': col.highlight }"
                >
                  <span class="detali-price-table__col-label">{{ col.label }}</span>
                  <span
                    v-if="col.hint"
                    class="detali-price-table__col-hint muted"
                  >
                    {{ col.hint }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tech.priceRows" :key="row.material">
                <th scope="row">{{ row.material }}</th>
                <td
                  v-for="col in tech.layerColumns"
                  :key="col.key"
                  :class="{ 'is-highlight': col.highlight }"
                >
                  {{ row.prices[col.key] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="stack" aria-labelledby="process-title">
      <div class="section-title">
        <h2 id="process-title">Як замовити</h2>
        <p class="lede">
          Формати: {{ PARTS_ACCEPTED_FILES }}. {{ PARTS_LEAD_TIME }}
        </p>
      </div>
      <ol class="detali-steps">
        <li v-for="(step, index) in PARTS_PROCESS_STEPS" :key="step.title">
          <span class="detali-steps__index" aria-hidden="true">
            {{ index + 1 }}
          </span>
          <div>
            <strong>{{ step.title }}</strong>
            <p class="muted">{{ step.summary }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="stack" aria-labelledby="delivery-title">
      <div class="section-title">
        <h2 id="delivery-title">Доставка й оплата</h2>
      </div>
      <p class="detali-delivery">
        {{ PARTS_DELIVERY_SUMMARY }}
      </p>
      <p class="muted">
        Детальніше -
        <NuxtLink to="/delivery">доставка та оплата</NuxtLink>.
      </p>
    </section>

    <div class="row">
      <NuxtLink class="btn btn-primary" to="/detali/zamovyty">
        Замовити деталі
        <Icon name="ph:upload-simple" class="icon" aria-hidden="true" />
      </NuxtLink>
    </div>
  </div>
</template>
