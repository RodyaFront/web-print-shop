<script setup lang="ts">
import type { DeliveryCity, DeliveryMethod, DeliveryPoint } from '../../shared/delivery'

const props = defineProps<{
  city: DeliveryCity
  method: DeliveryMethod
}>()

const model = defineModel<DeliveryPoint | null>({ default: null })

const query = ref('')
const open = ref(false)
const loading = ref(false)
const error = ref('')
const options = ref<DeliveryPoint[]>([])
const rootEl = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0
/** After clear, keep field empty until user picks an option. */
let autoselect = true

const displayValue = computed(() => model.value?.label || query.value)
const canClear = computed(() => Boolean(model.value || query.value.trim()))

async function loadPoints(search = '') {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const rows = await $fetch<DeliveryPoint[]>('/api/delivery/points', {
      query: {
        method: props.method,
        cityRef: props.city.npCityRef,
        cityLabel: props.city.label,
        cityArea: props.city.area,
        lat: props.city.lat ?? undefined,
        lon: props.city.lon ?? undefined,
        q: search || undefined,
      },
    })
    if (id !== requestId) return
    options.value = rows
    if (autoselect) {
      if (!model.value && rows[0]) {
        model.value = rows[0]
      } else if (model.value && !rows.some((row) => row.id === model.value?.id)) {
        model.value = rows[0] || null
      }
    }
  } catch (err: unknown) {
    if (id !== requestId) return
    options.value = []
    model.value = null
    const fetchData =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string; statusMessage?: string } }).data
        : undefined
    error.value = String(
      fetchData?.message || fetchData?.statusMessage || 'Не вдалося завантажити відділення',
    )
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(
  () => [props.city.npCityRef, props.method, props.city.label] as const,
  () => {
    query.value = ''
    model.value = null
    autoselect = true
    void loadPoints()
  },
  { immediate: true },
)

function scheduleSearch(raw: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void loadPoints(raw)
  }, 300)
}

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  model.value = null
  query.value = target.value
  open.value = true
  autoselect = false
  scheduleSearch(target.value)
}

function selectPoint(point: DeliveryPoint) {
  model.value = point
  query.value = ''
  open.value = false
  autoselect = true
}

function clearPoint() {
  model.value = null
  query.value = ''
  open.value = true
  autoselect = false
  void loadPoints()
}

function onFocus() {
  open.value = true
  if (!options.value.length && !loading.value) void loadPoints(query.value)
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
  <div ref="rootEl" class="delivery-combobox delivery-point-picker">
    <label class="field" for="delivery-point">
      <span>Відділення / поштомат</span>
      <div
        class="delivery-combobox__control"
        :data-loading="loading ? 'true' : 'false'"
      >
        <input
          id="delivery-point"
          :value="displayValue"
          type="text"
          autocomplete="off"
          placeholder="Оберіть або шукайте пункт"
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
        <span v-if="loading" class="visually-hidden">Завантажуємо пункти</span>
        <button
          v-else-if="canClear"
          class="btn-icon btn-icon--dense delivery-combobox__clear"
          type="button"
          aria-label="Очистити відділення"
          @click="clearPoint"
        >
          <Icon name="ph:x" class="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </label>

    <p v-if="error" class="delivery-combobox__error" role="alert">{{ error }}</p>
    <p v-else-if="!loading && !options.length" class="hint">
      Для цього міста пунктів не знайдено. Спробуйте інше місто або спосіб.
    </p>

    <ul
      v-if="open && options.length"
      class="delivery-combobox__list"
      role="listbox"
    >
      <li v-for="point in options" :key="point.id">
        <button
          class="delivery-combobox__option"
          type="button"
          role="option"
          :aria-selected="model?.id === point.id"
          @click="selectPoint(point)"
        >
          <span class="delivery-combobox__option-title">{{ point.label }}</span>
          <span v-if="point.address" class="delivery-combobox__option-meta">
            {{ point.address }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
