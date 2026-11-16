<script setup lang="ts">
const { shopName } = useShop()
const route = useRoute()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}

function navClass(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
    ? 'icon-gap is-active'
    : 'icon-gap'
}
</script>

<template>
  <div class="admin-shell">
    <div class="admin-bar">
      <div class="shell admin-bar__inner">
        <NuxtLink class="admin-bar__brand icon-gap" to="/admin">
          <strong>{{ shopName }} · Адмінка</strong>
        </NuxtLink>
        <nav class="admin-bar__nav" aria-label="Адмінка">
          <NuxtLink :class="navClass('/admin/orders')" to="/admin/orders">
            <Icon name="ph:clipboard-text" class="icon-sm" aria-hidden="true" />
            Заявки
          </NuxtLink>
          <NuxtLink :class="navClass('/admin/catalog')" to="/admin/catalog">
            <Icon name="ph:package" class="icon-sm" aria-hidden="true" />
            Каталог
          </NuxtLink>
          <NuxtLink :class="navClass('/admin/pricing')" to="/admin/pricing">
            <Icon name="ph:currency-circle-dollar" class="icon-sm" aria-hidden="true" />
            Ціни деталей
          </NuxtLink>
          <NuxtLink class="icon-gap" to="/figurky">
            <Icon name="ph:house" class="icon-sm" aria-hidden="true" />
            На сайт
          </NuxtLink>
          <button type="button" class="btn btn-ghost btn-on-dark" @click="logout">
            <Icon name="ph:sign-out" class="icon-sm" aria-hidden="true" />
            Вийти
          </button>
        </nav>
      </div>
    </div>
    <main class="shell section">
      <slot />
    </main>
  </div>
</template>
