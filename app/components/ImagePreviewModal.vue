<script setup lang="ts">
/**
 * Fullscreen-ish image preview on AppModal:
 * contain stage, side arrows, keyboard ←/→, bottom thumb strip (same set).
 */
const open = defineModel<boolean>('open', { default: false })
const index = defineModel<number>('index', { default: 0 })

const props = withDefaults(
  defineProps<{
    images: readonly string[]
    alt?: string
    /** Accessible name for the dialog. */
    title?: string
  }>(),
  {
    alt: '',
    title: 'Огляд зображення',
  },
)

const canNav = computed(() => props.images.length > 1)
const currentSrc = computed(() => props.images[index.value] ?? '')

function clampIndex(value: number) {
  const total = props.images.length
  if (total < 1) return 0
  return ((value % total) + total) % total
}

function step(delta: number) {
  if (!canNav.value) return
  index.value = clampIndex(index.value + delta)
}

function select(next: number) {
  index.value = clampIndex(next)
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value || !canNav.value) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    index.value = clampIndex(index.value)
    window.addEventListener('keydown', onKeydown)
    return
  }
  window.removeEventListener('keydown', onKeydown)
})

watch(
  () => props.images.length,
  () => {
    index.value = clampIndex(index.value)
  },
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <AppModal
    v-model:open="open"
    class="app-modal--media"
    hide-title
    :title="title"
  >
    <div class="image-preview-modal">
      <div class="image-preview-modal__viewer">
        <button
          v-if="canNav"
          class="btn-icon image-preview-modal__nav image-preview-modal__nav--prev"
          type="button"
          aria-label="Попередній кадр"
          @click="step(-1)"
        >
          <Icon name="ph:caret-left" class="icon" aria-hidden="true" />
        </button>

        <div class="image-preview-modal__stage">
          <img
            v-if="currentSrc"
            class="image-preview-modal__image"
            :src="currentSrc"
            :alt="alt"
            width="960"
            height="960"
            decoding="async"
          >
        </div>

        <button
          v-if="canNav"
          class="btn-icon image-preview-modal__nav image-preview-modal__nav--next"
          type="button"
          aria-label="Наступний кадр"
          @click="step(1)"
        >
          <Icon name="ph:caret-right" class="icon" aria-hidden="true" />
        </button>
      </div>

      <ImageThumbStrip
        class="image-preview-modal__thumbs"
        :images="images"
        :active-index="index"
        @select="select"
      />
    </div>
  </AppModal>
</template>
