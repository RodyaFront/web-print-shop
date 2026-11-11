<script setup lang="ts">
import type { DeliveryCity, DeliveryMethod, DeliveryPoint } from '../../../shared/delivery'
import { deliveryCarrierOf, deliveryMethodLabel } from '../../../shared/delivery'
import { formatPriceUah } from '../../../shared/figurky-catalog'
import {
  isValidUaMobileLocal,
  normalizeUaPhoneFromLocal,
  toUaMobileLocal,
  type PaymentMethod,
} from '../../../shared/shop'

const { shopName } = useShop()
const { items, count, totalUah, ids, clear } = useCart()

const submitting = ref(false)
const error = ref('')
const successId = ref('')
const successOpen = ref(false)

const deliveryCity = ref<DeliveryCity | null>(null)
const deliveryMethod = ref<DeliveryMethod | null>(null)
const deliveryPoint = ref<DeliveryPoint | null>(null)
const paymentMethod = ref<PaymentMethod>('cod')

useSeoMeta({
  title: `Оформлення замовлення - ${shopName}`,
  description: 'Контакти та доставка для готових фігурок. Оплата накладеним платежем.',
  robots: 'noindex, nofollow',
})

if (import.meta.server && count.value === 0) {
  await navigateTo('/koshyk')
}

onMounted(() => {
  if (count.value === 0 && !successOpen.value) {
    void navigateTo('/koshyk')
  }
})

watch(count, (value) => {
  if (value === 0 && !successOpen.value) void navigateTo('/koshyk')
})

const form = reactive({
  name: '',
})

const phoneLocal = ref('')
const formEl = ref<HTMLFormElement | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)

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

function onPhoneLocalInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  phoneLocal.value = toUaMobileLocal(target.value)
}

async function onSuccessModalClose() {
  successId.value = ''
  await navigateTo('/figurky')
}

async function onSubmit(event: Event) {
  event.preventDefault()
  if (revealInvalidField()) return
  if (!count.value) {
    await navigateTo('/koshyk')
    return
  }

  error.value = ''
  successId.value = ''
  successOpen.value = false
  submitting.value = true

  try {
    if (!isValidUaMobileLocal(phoneLocal.value)) {
      throw new Error('Вкажіть 9 цифр номера після +380')
    }
    if (!deliveryCity.value || !deliveryMethod.value || !deliveryPoint.value) {
      throw new Error('Оберіть місто, спосіб доставки та відділення')
    }

    const phone = normalizeUaPhoneFromLocal(phoneLocal.value)
    const body = new FormData()
    body.set('type', 'ready')
    body.set('name', form.name)
    body.set('phone', phone)
    body.set('comment', '')
    body.set('productIds', JSON.stringify(ids.value))
    body.set('deliveryMethod', deliveryMethod.value)
    body.set('deliveryCarrier', deliveryCarrierOf(deliveryMethod.value))
    body.set('deliveryCityLabel', deliveryCity.value.label)
    body.set('deliveryCityArea', deliveryCity.value.area)
    body.set('deliveryCityRef', deliveryCity.value.npCityRef)
    body.set('deliveryPointId', deliveryPoint.value.id)
    body.set('deliveryPointLabel', deliveryPoint.value.label)
    body.set('paymentMethod', paymentMethod.value)
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

    const result = await $fetch<{ id: string }>('/api/orders', {
      method: 'POST',
      body,
    })

    clear()
    successId.value = result.id
    form.name = ''
    phoneLocal.value = ''
    deliveryCity.value = null
    deliveryMethod.value = null
    deliveryPoint.value = null
    paymentMethod.value = 'cod'
    successOpen.value = true
  } catch (err: unknown) {
    const fetchData =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string; statusMessage?: string } }).data
        : undefined
    const message = String(fetchData?.message || fetchData?.statusMessage || '')
    error.value = message || (err instanceof Error ? err.message : 'Не вдалося надіслати замовлення')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="shell section stack checkout-page">
    <header class="section-title">
      <h1>Оформлення замовлення</h1>
      <p class="lede">
        Готові фігурки. Оплата накладеним платежем після відправки.
      </p>
    </header>

    <div class="checkout-layout">
      <form
        ref="formEl"
        class="card stack checkout-form"
        novalidate
        @submit="onSubmit"
      >
        <div
          v-if="error"
          ref="feedbackRef"
          class="error-box"
          role="alert"
          tabindex="-1"
        >
          {{ error }}
        </div>

        <section class="stack" aria-labelledby="checkout-contact-title">
          <div class="section-title">
            <h2 id="checkout-contact-title">Контакт</h2>
          </div>

          <div class="form-grid two">
            <div class="field">
              <label for="checkout-name">Ім’я</label>
              <input
                id="checkout-name"
                v-model="form.name"
                name="name"
                required
                autocomplete="name"
              >
            </div>
            <div class="field">
              <label for="checkout-phone">Телефон</label>
              <div class="phone-input">
                <span class="phone-input__prefix" aria-hidden="true">+380</span>
                <input
                  id="checkout-phone"
                  :value="phoneLocal"
                  name="phoneLocal"
                  type="tel"
                  required
                  autocomplete="tel-national"
                  inputmode="numeric"
                  maxlength="9"
                  pattern="\d{9}"
                  title="9 цифр після +380"
                  aria-describedby="checkout-phone-hint"
                  @input="onPhoneLocalInput"
                >
              </div>
              <p id="checkout-phone-hint" class="visually-hidden">
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
          <button class="btn btn-primary" type="submit" :disabled="submitting || !count">
            <Icon name="ph:paper-plane-tilt" class="icon-sm" aria-hidden="true" />
            {{ submitting ? 'Надсилаємо…' : 'Підтвердити замовлення' }}
          </button>
          <NuxtLink class="btn btn-ghost" to="/koshyk">
            Назад до кошика
          </NuxtLink>
        </div>
      </form>

      <aside class="cart-summary checkout-summary" aria-labelledby="checkout-summary-title">
        <h2 id="checkout-summary-title">Ваше замовлення</h2>
        <ul class="checkout-summary__list">
          <li v-for="product in items" :key="product.id" class="checkout-summary__item">
            <span>{{ product.title }}</span>
            <span>{{ formatPriceUah(product.priceUah) }}</span>
          </li>
        </ul>
        <p class="cart-summary__total">{{ formatPriceUah(totalUah) }}</p>
        <p class="cart-summary__note">
          Спосіб оплати можна обрати нижче у формі.
        </p>
      </aside>
    </div>

    <AppModal
      v-model:open="successOpen"
      title="Замовлення прийнято"
      @close="onSuccessModalClose"
    >
      <p>
        Номер замовлення: {{ successId }}. Ми зв’яжемось, щоб підтвердити
        відправку. Деталі оплати узгодимо при контакті.
      </p>
      <template #footer="{ close }">
        <button class="btn btn-primary" type="button" @click="close">
          Зрозуміло
        </button>
      </template>
    </AppModal>
  </div>
</template>
