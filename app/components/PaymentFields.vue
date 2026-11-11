<script setup lang="ts">
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_HINTS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from '../../shared/shop'

const model = defineModel<PaymentMethod>({ default: 'cod' })

const icons: Record<PaymentMethod, string> = {
  cod: 'ph:hand-coins',
  card: 'ph:credit-card',
}
</script>

<template>
  <section class="delivery-card stack payment-fields" aria-labelledby="payment-title">
    <div class="section-title">
      <h2 id="payment-title">Оплата</h2>
    </div>

    <fieldset class="delivery-methods">
      <legend class="visually-hidden">Спосіб оплати</legend>

      <div
        v-for="method in PAYMENT_METHODS"
        :key="method"
        class="delivery-method"
        :data-selected="model === method ? 'true' : 'false'"
      >
        <label class="delivery-method__head">
          <input
            v-model="model"
            type="radio"
            name="paymentMethod"
            :value="method"
            required
          >
          <span class="delivery-method__icon" aria-hidden="true">
            <Icon :name="icons[method]" class="icon" />
          </span>
          <span class="delivery-method__copy">
            <span class="delivery-method__title">{{ PAYMENT_METHOD_LABELS[method] }}</span>
            <span class="delivery-method__meta">{{ PAYMENT_METHOD_HINTS[method] }}</span>
          </span>
        </label>
      </div>
    </fieldset>
  </section>
</template>
