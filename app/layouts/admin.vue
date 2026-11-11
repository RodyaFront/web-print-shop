<script setup lang="ts">
const { shopName } = useShop()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-shell">
    <div class="admin-bar">
      <div class="shell row row-between">
        <strong>{{ shopName }} · Адмінка</strong>
        <div class="row">
          <NuxtLink class="icon-gap" to="/admin/orders">
            <Icon name="ph:clipboard-text" class="icon-sm" aria-hidden="true" />
            Заявки
          </NuxtLink>
          <NuxtLink class="icon-gap" to="/">
            <Icon name="ph:house" class="icon-sm" aria-hidden="true" />
            На сайт
          </NuxtLink>
          <button type="button" class="btn btn-ghost btn-on-dark" @click="logout">
            <Icon name="ph:sign-out" class="icon-sm" aria-hidden="true" />
            Вийти
          </button>
        </div>
      </div>
    </div>
    <main class="shell section">
      <slot />
    </main>
  </div>
</template>
