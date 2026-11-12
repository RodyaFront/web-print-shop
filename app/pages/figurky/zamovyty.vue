<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: `Замовити фігурку - ${shopName}`,
  description:
    'Заявка на фігурку. Надішліть STL або OBJ - за потреби розфарбуємо вручну.',
})
</script>

<template>
  <div class="shell section">
    <OrderForm type="figurine" />
  </div>
</template>
