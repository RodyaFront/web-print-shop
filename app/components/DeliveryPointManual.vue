<script setup lang="ts">
import type { DeliveryPoint } from '../../shared/delivery'

const model = defineModel<DeliveryPoint | null>({ default: null })

const text = computed(() => model.value?.label || '')
const canClear = computed(() => Boolean(text.value.trim()))

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  const value = target.value
  if (!value.trim()) {
    model.value = null
    return
  }
  model.value = {
    id: 'manual',
    label: value.trim(),
  }
}

function clearPoint() {
  model.value = null
}
</script>

<template>
  <div class="delivery-point-manual">
    <label class="field" for="delivery-point-manual">
      <span>Відділення</span>
      <div class="delivery-combobox__control">
        <input
          id="delivery-point-manual"
          :value="text"
          type="text"
          autocomplete="street-address"
          placeholder="Номер або адреса відділення"
          required
          @input="onInput"
        >
        <button
          v-if="canClear"
          class="btn-icon btn-icon--dense delivery-combobox__clear"
          type="button"
          aria-label="Очистити відділення"
          @click="clearPoint"
        >
          <Icon name="ph:x" class="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </label>
  </div>
</template>
