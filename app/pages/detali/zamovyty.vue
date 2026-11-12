<script setup lang="ts">
import { PARTS_ACCEPTED_FILES } from '../../../shared/print-services'

const { shopName } = useShop()

useSeoMeta({
  title: `Замовити деталі - ${shopName}`,
  description: `Заявка на деталі в Одесі. Надішліть ${PARTS_ACCEPTED_FILES} - ціну й строк назвемо після перегляду файлу.`,
})
</script>

<template>
  <div class="shell section">
    <OrderForm type="parts" />
  </div>
</template>
