<script setup lang="ts">
const { shopName } = useShop()

useSeoMeta({
  title: shopName,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div />
</template>
