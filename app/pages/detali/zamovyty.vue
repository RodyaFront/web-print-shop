<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: `Замовити друк деталей - ${shopName}`,
})
</script>

<template>
  <div class="shell section">
    <OrderForm type="parts" />
  </div>
</template>
