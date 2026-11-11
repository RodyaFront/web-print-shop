<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: `Замовити фігурку під ключ - ${shopName}`,
})
</script>

<template>
  <div class="shell section">
    <OrderForm type="figurine" />
  </div>
</template>
