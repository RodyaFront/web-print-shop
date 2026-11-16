<script setup lang="ts">
/**
 * Scrub turntable surface (pointer X → frames). Parent owns chrome (link, badge).
 */
const props = defineProps<{
  image: string
  imageAlt: string
  frames?: readonly string[] | null
  /** Parallel labels for the active scrub frame (admin constructor, etc.). */
  frameMeta?: readonly string[] | null
}>()

const previewFrames = computed(() => props.frames)

const {
  frames,
  frameIndex,
  scrubProgress,
  scrubVisible,
  stackReady,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
} = useTurntableScrub(previewFrames)

const activeFrameMeta = computed(() => {
  const list = props.frameMeta
  if (!list?.length || !frames.value) return ''
  return list[frameIndex.value] ?? ''
})
</script>

<template>
  <div
    class="figurine-turntable"
    @pointerenter="onPointerEnter"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div class="figurine-turntable__stage">
      <img
        v-if="!(frames && stackReady)"
        class="figurine-turntable__image"
        :src="image"
        :alt="imageAlt"
        width="640"
        height="640"
        decoding="async"
        draggable="false"
      >
      <div
        v-else
        class="figurine-turntable__frames"
        aria-hidden="true"
      >
        <img
          v-for="(src, index) in frames"
          :key="index"
          class="figurine-turntable__image"
          :class="{ 'is-active': index === frameIndex }"
          :src="src"
          alt=""
          width="640"
          height="640"
          decoding="sync"
          draggable="false"
        >
      </div>

      <p
        v-if="activeFrameMeta"
        class="figurine-turntable__meta"
        aria-live="polite"
      >
        {{ activeFrameMeta }}
      </p>
    </div>

    <div
      v-if="frames"
      class="figurine-turntable__scrub"
      :class="{ 'is-visible': scrubVisible }"
      aria-hidden="true"
    >
      <div class="figurine-turntable__scrub-track">
        <div class="figurine-turntable__scrub-rail">
          <span
            class="figurine-turntable__scrub-thumb"
            :style="{ '--scrub-progress': scrubProgress }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
