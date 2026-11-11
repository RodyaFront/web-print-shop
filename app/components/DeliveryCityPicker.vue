<script setup lang="ts">
import type { DeliveryCity } from '../../shared/delivery'

const model = defineModel<DeliveryCity | null>({ default: null })

const query = ref('')
const open = ref(false)
const loading = ref(false)
const error = ref('')
const options = ref<DeliveryCity[]>([])
const rootEl = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const displayValue = computed(() => {
  if (model.value) {
    return model.value.area
      ? `${model.value.label}, ${model.value.area}`
      : model.value.label
  }
  return query.value
})

watch(
  () => model.value,
  (value) => {
    if (value) query.value = ''
  },
)

function scheduleSearch(raw: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void runSearch(raw)
  }, 300)
}

async function runSearch(raw: string) {
  const q = raw.trim()
  error.value = ''
  if (q.length < 2) {
    options.value = []
    return
  }

  loading.value = true
  try {
    options.value = await $fetch<DeliveryCity[]>('/api/delivery/cities', {
      query: { q },
    })
    open.value = true
  } catch (err: unknown) {
    options.value = []
    const fetchData =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string; statusMessage?: string } }).data
        : undefined
    error.value = String(
      fetchData?.message || fetchData?.statusMessage || 'Не вдалося знайти місто',
    )
  } finally {
    loading.value = false
  }
}

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  model.value = null
  query.value = target.value
  scheduleSearch(target.value)
}

function selectCity(city: DeliveryCity) {
  model.value = city
  query.value = ''
  options.value = []
  open.value = false
  error.value = ''
}

function clearCity() {
  model.value = null
  query.value = ''
  options.value = []
  open.value = false
}

function onFocus() {
  if (options.value.length) open.value = true
}

function onDocPointerDown(event: PointerEvent) {
  const el = rootEl.value
  if (!el || !(event.target instanceof Node)) return
  if (!el.contains(event.target)) open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div ref="rootEl" class="delivery-combobox">
    <label class="field" for="delivery-city">
      <span>Місто / населений пункт</span>
      <div
        class="delivery-combobox__control"
        :data-loading="loading ? 'true' : 'false'"
      >
        <input
          id="delivery-city"
          :value="displayValue"
          type="text"
          autocomplete="off"
          placeholder="Почніть вводити назву"
          required
          :aria-busy="loading"
          @input="onInput"
          @focus="onFocus"
        >
        <span
          v-if="loading"
          class="delivery-combobox__spinner"
          aria-hidden="true"
        />
        <span v-if="loading" class="visually-hidden">Шукаємо міста</span>
        <button
          v-else-if="model"
          class="btn-icon btn-icon--dense delivery-combobox__clear"
          type="button"
          aria-label="Змінити місто"
          @click="clearCity"
        >
          <Icon name="ph:x" class="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </label>

    <p v-if="error" class="delivery-combobox__error" role="alert">{{ error }}</p>

    <ul
      v-if="open && options.length"
      class="delivery-combobox__list"
      role="listbox"
    >
      <li v-for="city in options" :key="city.npCityRef">
        <button
          class="delivery-combobox__option"
          type="button"
          role="option"
          @click="selectCity(city)"
        >
          <span class="delivery-combobox__option-title">{{ city.label }}</span>
          <span v-if="city.area" class="delivery-combobox__option-meta">{{ city.area }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
