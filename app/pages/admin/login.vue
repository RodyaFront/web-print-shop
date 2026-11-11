<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { shopName } = useShop()
const password = ref('')
const error = ref('')
const submitting = ref(false)

useSeoMeta({
  title: `Вхід - ${shopName}`,
  robots: 'noindex, nofollow',
})

async function onSubmit(event: Event) {
  event.preventDefault()
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    await navigateTo('/admin/orders')
  } catch {
    error.value = 'Невірний пароль'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="age-gate">
    <form class="card age-gate__panel stack" @submit="onSubmit">
      <h1>Вхід до адмінки</h1>
      <p class="muted">Список заявок доступний лише з паролем.</p>
      <div v-if="error" class="error-box" role="alert">{{ error }}</div>
      <div class="field">
        <label for="password">Пароль</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          required
          autocomplete="current-password"
        >
      </div>
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        {{ submitting ? 'Перевіряємо…' : 'Увійти' }}
      </button>
      <NuxtLink to="/">На головну</NuxtLink>
    </form>
  </div>
</template>
