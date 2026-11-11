<script setup lang="ts">
import type {
  DeliveryCity,
  DeliveryMethod,
  DeliveryMethodInfo,
  DeliveryPoint,
} from '../../shared/delivery'

const props = defineProps<{
  city: DeliveryCity | null
  methods: DeliveryMethodInfo[]
}>()

const method = defineModel<DeliveryMethod | null>('method', { default: null })
const point = defineModel<DeliveryPoint | null>('point', { default: null })

const carrierLogo: Record<string, string> = {
  nova: '/brands/nova.svg',
  meest: '/brands/meest.png',
  ukrposhta: '/brands/ukrposhta.png',
}

function usesPointAutocomplete(item: DeliveryMethodInfo) {
  return item.carrier === 'nova'
}

function selectMethod(next: DeliveryMethodInfo) {
  if (!next.available || !props.city) return
  method.value = next.method
  if (point.value) point.value = null
}
</script>

<template>
  <fieldset class="delivery-methods">
    <legend class="visually-hidden">Спосіб доставки</legend>

    <p v-if="!city" class="hint">Спочатку оберіть місто - тоді з’являться відділення.</p>

    <div
      v-for="item in methods"
      :key="item.method"
      class="delivery-method"
      :data-selected="method === item.method ? 'true' : 'false'"
      :data-disabled="!item.available || !city ? 'true' : 'false'"
    >
      <label class="delivery-method__head">
        <input
          type="radio"
          name="deliveryMethod"
          :value="item.method"
          :checked="method === item.method"
          :disabled="!item.available || !city"
          required
          @change="selectMethod(item)"
        >
        <span class="delivery-method__icon" aria-hidden="true">
          <img
            class="delivery-method__logo"
            :src="carrierLogo[item.carrier]"
            alt=""
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
          >
        </span>
        <span class="delivery-method__copy">
          <span class="delivery-method__title">{{ item.label }}</span>
          <span v-if="!item.available" class="delivery-method__meta">Скоро</span>
          <span v-else class="delivery-method__meta">За тарифами перевізника</span>
        </span>
      </label>

      <div
        v-if="city && method === item.method && item.available"
        class="delivery-method__body"
      >
        <DeliveryPointPicker
          v-if="usesPointAutocomplete(item)"
          v-model="point"
          :city="city"
          :method="item.method"
        />
        <DeliveryPointManual
          v-else
          v-model="point"
        />
      </div>
    </div>
  </fieldset>
</template>
