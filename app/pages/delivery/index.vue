<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: `Доставка та оплата - ${shopName}`,
  description:
    'Доставка поштою по Україні. Оплата накладеним платежем або на картку.',
})
</script>

<template>
  <div class="shell section">
    <article class="delivery stack">
      <header class="section-title">
        <h1>Доставка та оплата</h1>
        <p class="lede">
          Працюємо по Україні. Спочатку узгоджуємо заявку, потім відправляємо
          посилку поштою.
        </p>
      </header>

      <section class="stack">
        <div class="section-title">
          <h2>Доставка</h2>
        </div>
        <p>
          Доставка поштою лише по Україні. У заявці вкажіть місто і відділення
          або адресу, куди зручно отримати посилку.
        </p>
        <p class="muted">
          Строк відправки залежить від обсягу роботи. Назвемо його разом із
          ціною після перегляду файлів заявки.
        </p>
      </section>

      <section class="stack">
        <div class="section-title">
          <h2>Оплата</h2>
        </div>
        <p>
          Можна обрати накладений платіж або оплату на картку. Реквізити для
          картки надішлемо після узгодження.
        </p>
        <p class="muted">
          Спочатку дивимось заявку і файли, узгоджуємо ціну і строк, далі друк
          і (за потреби) фарбування, потім відправка.
        </p>
      </section>

      <div class="row">
        <NuxtLink class="btn btn-primary" to="/figurky/zamovyty">
          Замовити фігурку
        </NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/detali/zamovyty">
          Замовити деталі
        </NuxtLink>
      </div>
    </article>
  </div>
</template>
