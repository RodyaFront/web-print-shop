<script setup lang="ts">
/**
 * Non-modal cookie acknowledgment toast (region, not dialog):
 * - no focus steal on first paint
 * - polite live announcement
 * - persisted via useCookieConsent (versioned cookie)
 * - shown only after mount to avoid SSR/client flash
 */
const { hasConsent, accept } = useCookieConsent()

const mounted = ref(false)

const visible = computed(() => mounted.value && !hasConsent.value)

onMounted(() => {
  mounted.value = true
})

function onAccept() {
  accept()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie-toast">
      <div
        v-if="visible"
        class="cookie-toast"
        role="region"
        aria-label="Файли cookie"
        aria-live="polite"
      >
        <div class="cookie-toast__inner shell">
          <div class="cookie-toast__copy">
            <p class="cookie-toast__title">Файли cookie</p>
            <p class="cookie-toast__text">
              Ми використовуємо лише необхідні файли cookie: щоб сайт працював
              і щоб не показувати це повідомлення знову після «Приймаю».
              Докладніше -
              <NuxtLink class="cookie-toast__link" to="/privacy">
                політика конфіденційності
              </NuxtLink>.
            </p>
          </div>
          <button
            class="btn btn-primary cookie-toast__action"
            type="button"
            @click="onAccept"
          >
            Приймаю
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
