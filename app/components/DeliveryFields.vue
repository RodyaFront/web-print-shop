<script setup lang="ts">
import type {
  DeliveryCity,
  DeliveryMethod,
  DeliveryMethodInfo,
  DeliveryPoint,
} from '../../shared/delivery'

const city = defineModel<DeliveryCity | null>('city', { default: null })
const method = defineModel<DeliveryMethod | null>('method', { default: null })
const point = defineModel<DeliveryPoint | null>('point', { default: null })

const { data: methods } = useFetch<DeliveryMethodInfo[]>('/api/delivery/methods', {
  default: () => [],
})

watch(city, () => {
  method.value = null
  point.value = null
})
</script>

<template>
  <div class="delivery-fields stack">
    <section class="delivery-card stack" aria-labelledby="delivery-city-title">
      <div class="section-title">
        <h2 id="delivery-city-title">Місто</h2>
      </div>
      <DeliveryCityPicker v-model="city" />
    </section>

    <section class="delivery-card stack" aria-labelledby="delivery-method-title">
      <div class="section-title">
        <h2 id="delivery-method-title">Доставка</h2>
      </div>
      <DeliveryMethodPicker
        v-model:method="method"
        v-model:point="point"
        :city="city"
        :methods="methods || []"
      />
    </section>
  </div>
</template>
