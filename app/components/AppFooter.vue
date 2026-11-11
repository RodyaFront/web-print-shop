<script setup lang="ts">
const { shopName, shopTagline } = useShop()
</script>

<template>
  <footer class="site-footer">
    <div class="shell">
      <p class="muted">
        {{ shopName }}: {{ shopTagline }}.
      </p>
    </div>
  </footer>
</template>
