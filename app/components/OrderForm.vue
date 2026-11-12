<script setup lang="ts">
import type { OrderType } from '../../shared/shop'
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_FILES_PER_ORDER,
  MAX_UPLOAD_BYTES,
  isValidUaMobileLocal,
  normalizeUaPhoneFromLocal,
  toUaMobileLocal,
} from '../../shared/shop'

const props = withDefaults(
  defineProps<{
    type: OrderType
    /** Where to go after closing the success modal. */
    successRedirect?: string
  }>(),
  {
    successRedirect: '/detali',
  },
)

const submitting = ref(false)
const error = ref('')
const successId = ref('')
const successOpen = ref(false)

const form = reactive({
  name: '',
  description: '',
  telegram: '',
  viber: '',
  whatsapp: '',
  needsPainting: false,
  isAdultContent: false,
  characterAdultConfirmed: false,
})

/** 9 digits after +380 (no fake placeholder number). */
const phoneLocal = ref('')

const formEl = ref<HTMLFormElement | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])

const accept = ALLOWED_UPLOAD_EXTENSIONS.join(',')
const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))

const lineLabel = computed(() => {
  if (props.type === 'figurine') return 'Фігурка під ключ'
  return 'Друк деталей'
})

const lineIcon = computed(() => {
  if (props.type === 'figurine') return 'ph:paint-brush'
  return 'ph:cube'
})

const title = computed(() => {
  if (props.type === 'figurine') return 'Замовити фігурку під ключ'
  return 'Замовити друк деталей'
})

const intro = computed(() => {
  if (props.type === 'figurine') {
    return 'Друк фігурки. Ручне фарбування можна додати окремо. Ціну і строк узгоджуємо після перегляду моделі та референсів.'
  }
  return 'Надішліть STL або OBJ. Опишіть задачу (прототип, корпус, дрібна геометрія) і матеріал за бажанням. Ціну й строк назвемо після перегляду моделі.'
})

const descriptionPlaceholder = computed(() => {
  if (props.type === 'figurine') {
    return 'Персонаж, поза, деталі, матеріал…'
  }
  return 'Тип задачі, кількість, матеріал, допуски…'
})

watch(
  () => form.isAdultContent,
  (value) => {
    if (!value) form.characterAdultConfirmed = false
  },
)

function syncSelectedFiles() {
  const list = fileInput.value?.files
  selectedFiles.value = list ? Array.from(list) : []
}

function openFilePicker() {
  fileInput.value?.click()
}

function clearFiles() {
  if (fileInput.value) fileInput.value.value = ''
  selectedFiles.value = []
}

function onPhoneLocalInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  phoneLocal.value = toUaMobileLocal(target.value)
}

function scrollBehavior(): ScrollBehavior {
  if (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'auto'
  }
  return 'smooth'
}

async function revealFeedback() {
  await nextTick()
  const el = feedbackRef.value
  if (!el) return
  el.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
  el.focus({ preventScroll: true })
}

function revealInvalidField() {
  const root = formEl.value
  if (!root) return false
  if (root.checkValidity()) return false
  const invalid = root.querySelector(':invalid')
  if (invalid instanceof HTMLElement) {
    invalid.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
    invalid.focus({ preventScroll: true })
    root.reportValidity()
  }
  return true
}

watch(error, (nextError) => {
  if (nextError) void revealFeedback()
})

async function onSuccessModalClose() {
  successId.value = ''
  await navigateTo(props.successRedirect)
}

async function onSubmit(event: Event) {
  event.preventDefault()
  if (revealInvalidField()) return

  error.value = ''
  successId.value = ''
  successOpen.value = false
  submitting.value = true

  try {
    if (props.type === 'figurine' && form.isAdultContent && !form.characterAdultConfirmed) {
      throw new Error('Для опції 18+ підтвердіть, що персонаж повнолітній')
    }

    if (!isValidUaMobileLocal(phoneLocal.value)) {
      throw new Error('Вкажіть 9 цифр номера після +380')
    }

    const files = fileInput.value?.files
    if (files && files.length > MAX_FILES_PER_ORDER) {
      throw new Error(`Можна додати не більше ${MAX_FILES_PER_ORDER} файлів`)
    }

    const phone = normalizeUaPhoneFromLocal(phoneLocal.value)

    const body = new FormData()
    body.set('type', props.type)
    body.set('name', form.name)
    body.set('phone', phone)
    body.set('telegram', form.telegram.trim())
    body.set('viber', form.viber.trim())
    body.set('whatsapp', form.whatsapp.trim())
    body.set('description', form.description)
    body.set('comment', '')

    if (props.type === 'parts' || props.type === 'figurine') {
      body.set('needsPainting', form.needsPainting ? 'true' : 'false')
    }
    if (props.type === 'figurine') {
      body.set('isAdultContent', form.isAdultContent ? 'true' : 'false')
      if (form.isAdultContent) {
        body.set('characterAdultConfirmed', form.characterAdultConfirmed ? 'true' : 'false')
      }
    }

    if (files) {
      for (const file of Array.from(files)) {
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`Файл "${file.name}" більший за ${maxMb} МБ`)
        }
        body.append('files', file)
      }
    }

    const result = await $fetch<{ id: string }>('/api/orders', {
      method: 'POST',
      body,
    })

    successId.value = result.id
    form.name = ''
    phoneLocal.value = ''
    form.telegram = ''
    form.viber = ''
    form.whatsapp = ''
    form.description = ''
    form.needsPainting = false
    form.isAdultContent = false
    form.characterAdultConfirmed = false
    clearFiles()
    successOpen.value = true
  } catch (err: unknown) {
    const fetchData =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string; statusMessage?: string } }).data
        : undefined
    const message = String(fetchData?.message || fetchData?.statusMessage || '')
    error.value = message || (err instanceof Error ? err.message : 'Не вдалося надіслати заявку')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <form
      ref="formEl"
      class="card stack order-form"
      :data-line="type"
      novalidate
      @submit="onSubmit"
    >
    <header class="order-form__intro stack-tight">
      <p class="order-form__eyebrow icon-gap">
        <Icon :name="lineIcon" class="icon-sm" aria-hidden="true" />
        {{ lineLabel }}
      </p>
      <h1>{{ title }}</h1>
      <p class="lede">{{ intro }}</p>
    </header>

    <div
      v-if="error"
      ref="feedbackRef"
      class="error-box"
      role="alert"
      tabindex="-1"
    >
      {{ error }}
    </div>

    <section class="stack" aria-labelledby="order-brief-title">
      <div class="section-title">
        <h2 id="order-brief-title">Бриф</h2>
      </div>

      <div class="field">
        <label for="description">Опис роботи</label>
        <textarea
          id="description"
          v-model="form.description"
          name="description"
          required
          :placeholder="descriptionPlaceholder"
        />
      </div>

      <template v-if="type === 'figurine'">
        <label class="checkbox">
          <input v-model="form.needsPainting" type="checkbox">
          <span class="icon-gap">
            <Icon name="ph:paint-brush" class="icon-sm" aria-hidden="true" />
            Потрібне ручне фарбування
          </span>
        </label>
        <label class="checkbox">
          <input v-model="form.isAdultContent" type="checkbox">
          <span>Замовлення 18+ (дорослий контент фігурки)</span>
        </label>
        <label v-if="form.isAdultContent" class="checkbox">
          <input v-model="form.characterAdultConfirmed" type="checkbox" required>
          <span class="icon-gap">
            <Icon name="ph:seal-check" class="icon-sm" aria-hidden="true" />
            Підтверджую, що персонаж на фігурці повнолітній
          </span>
        </label>
      </template>

      <div class="field">
        <span class="field-label icon-gap" id="files-label">
          <Icon name="ph:upload-simple" class="icon-sm" aria-hidden="true" />
          Референси та файли
        </span>
        <div class="file-upload">
          <input
            id="files"
            ref="fileInput"
            class="file-upload__input"
            name="files"
            type="file"
            multiple
            :accept="accept"
            aria-labelledby="files-label"
            @change="syncSelectedFiles"
          >
          <div class="row">
            <button
              class="btn btn-secondary"
              type="button"
              @click="openFilePicker"
            >
              <Icon name="ph:upload-simple" class="icon-sm" aria-hidden="true" />
              Обрати файли
            </button>
            <button
              v-if="selectedFiles.length"
              class="btn btn-ghost"
              type="button"
              @click="clearFiles"
            >
              Очистити
            </button>
          </div>
          <ul v-if="selectedFiles.length" class="file-list">
            <li v-for="file in selectedFiles" :key="`${file.name}-${file.size}`">
              {{ file.name }}
            </li>
          </ul>
          <p class="hint">
            До {{ MAX_FILES_PER_ORDER }} файлів, кожен до {{ maxMb }} МБ.
            Формати: {{ ALLOWED_UPLOAD_EXTENSIONS.join(', ') }}.
          </p>
        </div>
      </div>

      <label v-if="type === 'parts'" class="checkbox">
        <input v-model="form.needsPainting" type="checkbox">
        <span class="icon-gap">
          <Icon name="ph:paint-brush" class="icon-sm" aria-hidden="true" />
          Потрібне ручне фарбування деталей
        </span>
      </label>
    </section>

    <section class="stack" aria-labelledby="order-contact-title">
      <div class="section-title">
        <h2 id="order-contact-title">Контакт</h2>
      </div>

      <div class="form-grid two">
        <div class="field">
          <label for="name">Ім’я</label>
          <input id="name" v-model="form.name" name="name" required autocomplete="name">
        </div>
        <div class="field">
          <label for="phone">Телефон</label>
          <div class="phone-input">
            <span class="phone-input__prefix" aria-hidden="true">+380</span>
            <input
              id="phone"
              :value="phoneLocal"
              name="phoneLocal"
              type="tel"
              required
              autocomplete="tel-national"
              inputmode="numeric"
              maxlength="9"
              pattern="\d{9}"
              title="9 цифр після +380"
              aria-describedby="phone-prefix-hint"
              @input="onPhoneLocalInput"
            >
          </div>
          <p id="phone-prefix-hint" class="visually-hidden">
            Код країни +380 уже вказаний. Введіть наступні 9 цифр.
          </p>
        </div>
      </div>
    </section>

    <section class="stack" aria-labelledby="order-messenger-title">
      <div class="section-title">
        <h2 id="order-messenger-title">Спосіб зв’язку</h2>
      </div>
      <p class="hint">За бажанням - щоб зручніше зв’язатись у месенджері.</p>
      <div class="form-grid two">
        <div class="field">
          <label for="telegram">Telegram</label>
          <input
            id="telegram"
            v-model="form.telegram"
            name="telegram"
            type="text"
            autocomplete="off"
            maxlength="64"
            placeholder="@username або номер"
          >
        </div>
        <div class="field">
          <label for="viber">Viber</label>
          <input
            id="viber"
            v-model="form.viber"
            name="viber"
            type="text"
            autocomplete="off"
            maxlength="64"
            placeholder="Номер або ім’я"
          >
        </div>
        <div class="field">
          <label for="whatsapp">WhatsApp</label>
          <input
            id="whatsapp"
            v-model="form.whatsapp"
            name="whatsapp"
            type="text"
            autocomplete="off"
            maxlength="64"
            placeholder="Номер"
          >
        </div>
      </div>
    </section>

    <div class="row">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        <Icon name="ph:paper-plane-tilt" class="icon-sm" aria-hidden="true" />
        {{ submitting ? 'Надсилаємо…' : 'Надіслати заявку' }}
      </button>
    </div>
    </form>

    <AppModal
      v-model:open="successOpen"
      title="Заявку прийнято"
      @close="onSuccessModalClose"
    >
      <p>
        Номер заявки: {{ successId }}. Ми зв’яжемось, щоб назвати ціну і строк.
        Деталі оплати узгодимо при контакті.
      </p>
      <template #footer="{ close }">
        <button class="btn btn-primary" type="button" @click="close">
          Зрозуміло
        </button>
      </template>
    </AppModal>
  </div>
</template>
