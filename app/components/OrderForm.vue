<script setup lang="ts">
import type { DeliveryCity, DeliveryMethod, DeliveryPoint } from '../../shared/delivery'
import { deliveryCarrierOf, deliveryMethodLabel } from '../../shared/delivery'
import type { OrderType, PaymentMethod } from '../../shared/shop'
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
const commentOpen = ref(false)

const form = reactive({
  name: '',
  description: '',
  comment: '',
  needsPainting: false,
  isAdultContent: false,
  characterAdultConfirmed: false,
})

const deliveryCity = ref<DeliveryCity | null>(null)
const deliveryMethod = ref<DeliveryMethod | null>(null)
const deliveryPoint = ref<DeliveryPoint | null>(null)
const paymentMethod = ref<PaymentMethod>('cod')

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
    return 'Друк і ручне фарбування художником. Ціну і строк узгоджуємо після перегляду моделі та референсів.'
  }
  return 'Друк окремих деталей. Фарбування можна додати окремо. Ціну назвемо після перегляду файлів.'
})

const descriptionPlaceholder = computed(() => {
  if (props.type === 'figurine') {
    return 'Персонаж, поза, деталі, матеріал…'
  }
  return 'Що друкуємо, кількість, матеріал, допуски…'
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

function openComment() {
  commentOpen.value = true
}

function collapseComment() {
  commentOpen.value = false
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
    if (!deliveryCity.value || !deliveryMethod.value || !deliveryPoint.value) {
      throw new Error('Оберіть місто, спосіб доставки та відділення')
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
    body.set(
      'city',
      deliveryCity.value.area
        ? `${deliveryCity.value.label}, ${deliveryCity.value.area}`
        : deliveryCity.value.label,
    )
    body.set(
      'deliveryAddress',
      `${deliveryMethodLabel(deliveryMethod.value)}: ${deliveryPoint.value.label}`,
    )
    body.set('deliveryMethod', deliveryMethod.value)
    body.set('deliveryCarrier', deliveryCarrierOf(deliveryMethod.value))
    body.set('deliveryCityLabel', deliveryCity.value.label)
    body.set('deliveryCityArea', deliveryCity.value.area)
    body.set('deliveryCityRef', deliveryCity.value.npCityRef)
    body.set('deliveryPointId', deliveryPoint.value.id)
    body.set('deliveryPointLabel', deliveryPoint.value.label)
    body.set('paymentMethod', paymentMethod.value)
    body.set('description', form.description)
    body.set('comment', commentOpen.value ? form.comment : '')

    if (props.type === 'parts') {
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
    form.description = ''
    form.comment = ''
    form.needsPainting = false
    form.isAdultContent = false
    form.characterAdultConfirmed = false
    commentOpen.value = false
    deliveryCity.value = null
    deliveryMethod.value = null
    deliveryPoint.value = null
    paymentMethod.value = 'cod'
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

      <div v-if="type === 'figurine'" class="muted icon-gap">
        <Icon name="ph:paint-brush" class="icon-sm" aria-hidden="true" />
        Фарбування художником входить у цю послугу.
      </div>

      <label v-if="type === 'parts'" class="checkbox">
        <input v-model="form.needsPainting" type="checkbox">
        <span class="icon-gap">
          <Icon name="ph:paint-brush" class="icon-sm" aria-hidden="true" />
          Потрібне ручне фарбування деталей
        </span>
      </label>

      <div v-if="!commentOpen">
        <button class="btn btn-ghost" type="button" @click="openComment">
          <Icon name="ph:chat-text" class="icon-sm" aria-hidden="true" />
          Додати коментар
        </button>
      </div>
      <div v-else class="field">
        <div class="field-label-row">
          <label for="comment">Коментар</label>
          <button
            class="btn-icon btn-icon--dense"
            type="button"
            aria-label="Сховати коментар"
            @click="collapseComment"
          >
            <Icon name="ph:x" class="icon-sm" aria-hidden="true" />
          </button>
        </div>
        <textarea id="comment" v-model="form.comment" name="comment" />
      </div>
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

    <DeliveryFields
      v-model:city="deliveryCity"
      v-model:method="deliveryMethod"
      v-model:point="deliveryPoint"
    />

    <PaymentFields v-model="paymentMethod" />

    <div class="row">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        <Icon name="ph:paper-plane-tilt" class="icon-sm" aria-hidden="true" />
        {{ submitting ? 'Надсилаємо…' : 'Надіслати заявку' }}
      </button>
      <NuxtLink class="btn btn-ghost" to="/delivery">
        <Icon name="ph:truck" class="icon-sm" aria-hidden="true" />
        Умови доставки
      </NuxtLink>
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
