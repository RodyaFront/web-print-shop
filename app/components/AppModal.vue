<script setup lang="ts">
/**
 * Accessible modal on native <dialog>:
 * - top layer + inert backdrop via showModal()
 * - Escape closes (browser cancel → close)
 * - backdrop click closes (optional)
 * - initial focus on the header close control
 * - restore focus to the previously focused element on close
 */
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    title: string
    /** Optional id for aria-labelledby; auto-generated otherwise. */
    titleId?: string
    /** Close when clicking the scrim (dialog element itself). Default true. */
    closeOnBackdrop?: boolean
  }>(),
  {
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  close: []
  open: []
}>()

const uid = useId()
const titleDomId = computed(() => props.titleId || `app-modal-title-${uid}`)
const { dialogRef, requestClose } = useDialog(open)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

watch(open, async (isOpen, wasOpen) => {
  if (isOpen) {
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    emit('open')
    await nextTick()
    closeBtnRef.value?.focus()
    return
  }
  if (wasOpen) {
    emit('close')
    await nextTick()
    previouslyFocused?.focus?.()
    previouslyFocused = null
  }
})

function onDialogClose() {
  if (open.value) open.value = false
}

function onDialogClick(event: MouseEvent) {
  if (!props.closeOnBackdrop) return
  if (event.target === dialogRef.value) {
    requestClose()
  }
}

defineExpose({
  requestClose,
})
</script>

<template>
  <dialog
    ref="dialogRef"
    class="app-modal"
    :aria-labelledby="titleDomId"
    @close="onDialogClose"
    @click="onDialogClick"
  >
    <div class="app-modal__panel" role="document" @click.stop>
      <header class="app-modal__header">
        <h2 :id="titleDomId" class="app-modal__title">
          {{ title }}
        </h2>
        <button
          ref="closeBtnRef"
          class="btn-icon btn-icon--dense"
          type="button"
          aria-label="Закрити"
          @click="requestClose"
        >
          <Icon name="ph:x" class="icon-sm" aria-hidden="true" />
        </button>
      </header>

      <div class="app-modal__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="app-modal__footer">
        <slot name="footer" :close="requestClose" />
      </footer>
    </div>
  </dialog>
</template>
