<script setup lang="ts">
useShopLine()
</script>

<template>
  <div>
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <CookieConsentToast />
  </div>
</template>
