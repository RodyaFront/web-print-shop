<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: undefined,
  },
)
</script>

<template>
  <img
    class="logo-mark"
    src="/brand/logo-mark.png?v=4"
    width="64"
    height="64"
    alt=""
    decoding="async"
    :aria-hidden="title ? undefined : 'true'"
    :title="title"
  >
</template>
