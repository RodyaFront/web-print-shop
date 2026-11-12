<script setup lang="ts">
import { PARTS_ACCEPTED_FILES } from '../../../shared/print-services'

const { shopName } = useShop()

useSeoMeta({
  title: `Замовити 3D-друк деталей - ${shopName}`,
  description: `Заявка на 3D-друк деталей в Одесі. Надішліть ${PARTS_ACCEPTED_FILES} - ціну й строк назвемо після перегляду моделі.`,
})
</script>

<template>
  <div class="shell section">
    <OrderForm type="parts" />
  </div>
</template>
