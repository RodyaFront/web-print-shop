<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: `Конфіденційність - ${shopName}`,
  description:
    'Як Фігулярня обробляє заявки та які файли cookie потрібні для роботи сайту.',
})
</script>

<template>
  <div class="shell section">
    <article class="delivery stack">
      <header class="section-title">
        <h1>Конфіденційність</h1>
        <p class="lede">
          Коротко про дані заявок і файли cookie на сайті {{ shopName }}.
        </p>
      </header>

      <section class="stack">
        <div class="section-title">
          <h2>Заявки</h2>
        </div>
        <p>
          Коли ви надсилаєте форму замовлення, ми отримуємо контактні дані,
          опис роботи та файли, які ви додали. Вони потрібні, щоб відповісти на
          заявку, узгодити ціну і виконати замовлення.
        </p>
      </section>

      <section class="stack">
        <div class="section-title">
          <h2>Файли cookie</h2>
        </div>
        <p>
          На сайті використовуються необхідні файли cookie: щоб не показувати
          банер cookie знову після «Приймаю» і щоб працював захищений вхід в
          адмінку для власника. Маркетингових і рекламних cookie немає.
        </p>
      </section>

      <div class="row">
        <NuxtLink class="btn btn-secondary" to="/">
          На головну
        </NuxtLink>
      </div>
    </article>
  </div>
</template>
