<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

type Pricing = {
  standardUahPerG: number
  engineeringUahPerG: number
  partsMinOrderUah: number
}

const { data, refresh } = await useFetch<Pricing>('/api/pricing', {
  key: 'parts-pricing-admin',
})

const standardUahPerG = ref(15)
const engineeringUahPerG = ref(30)
const partsMinOrderUah = ref(250)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

watch(
  data,
  (value) => {
    if (!value) return
    standardUahPerG.value = value.standardUahPerG
    engineeringUahPerG.value = value.engineeringUahPerG
    partsMinOrderUah.value = value.partsMinOrderUah
  },
  { immediate: true },
)

useSeoMeta({
  title: 'Ціни деталей',
  robots: 'noindex, nofollow',
})

async function save() {
  error.value = ''
  saved.value = false
  saving.value = true
  try {
    await $fetch('/api/admin/pricing', {
      method: 'PUT',
      body: {
        standardUahPerG: standardUahPerG.value,
        engineeringUahPerG: engineeringUahPerG.value,
        partsMinOrderUah: partsMinOrderUah.value,
      },
    })
    await refresh()
    clearNuxtData('parts-pricing')
    saved.value = true
  } catch {
    error.value = 'Не вдалося зберегти ставки'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="stack">
    <h1>Ціни деталей</h1>
    <p class="lede muted">
      Ставки для сторінки /detali і калькулятора в заявках.
    </p>

    <div class="card stack">
      <div v-if="error" class="error-box" role="alert">{{ error }}</div>
      <div v-if="saved" class="success-box" role="status">Збережено.</div>

      <div class="admin-work-grid">
        <div class="field">
          <label for="rate-standard">Стандартна смола, грн/г</label>
          <input
            id="rate-standard"
            v-model.number="standardUahPerG"
            type="number"
            min="1"
            step="1"
          >
        </div>
        <div class="field">
          <label for="rate-eng">Інженерна смола, грн/г</label>
          <input
            id="rate-eng"
            v-model.number="engineeringUahPerG"
            type="number"
            min="1"
            step="1"
          >
        </div>
        <div class="field">
          <label for="min-order">Мінімальне замовлення, грн</label>
          <input
            id="min-order"
            v-model.number="partsMinOrderUah"
            type="number"
            min="1"
            step="1"
          >
        </div>
      </div>

      <div class="row row-end">
        <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Зберігаємо…' : 'Зберегти' }}
        </button>
      </div>
    </div>
  </div>
</template>
