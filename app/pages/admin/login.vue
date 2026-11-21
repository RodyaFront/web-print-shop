<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { shopName } = useShop()
const password = ref('')
const showPassword = ref(false)
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
    await navigateTo('/admin')
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
      <p class="muted">Кабінет доступний лише з паролем.</p>
      <div v-if="error" class="error-box" role="alert">{{ error }}</div>
      <div class="field">
        <label for="password">Пароль</label>
        <div class="field-password">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            required
            autocomplete="current-password"
          >
          <button
            type="button"
            class="btn-icon btn-icon--dense field-password__toggle"
            :aria-label="showPassword ? 'Приховати пароль' : 'Показати пароль'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <Icon
              :name="showPassword ? 'ph:eye-slash' : 'ph:eye'"
              class="icon-sm"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        {{ submitting ? 'Перевіряємо…' : 'Увійти' }}
      </button>
      <NuxtLink to="/figurky">На головну</NuxtLink>
    </form>
  </div>
</template>
