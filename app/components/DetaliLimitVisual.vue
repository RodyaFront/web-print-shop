<script setup lang="ts">
import type { PrintLimitId } from '../../shared/print-services'

defineProps<{
  id: PrintLimitId
}>()
</script>

<template>
  <div class="detali-card-visual" aria-hidden="true">
    <!-- Build volume: XYZ axes + bounding box -->
    <svg
      v-if="id === 'build-volume'"
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__muted"
        d="M28 58 L52 44 L88 44 L64 58 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__muted"
        d="M28 58 L28 30 L52 16 L52 44 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__muted"
        d="M52 16 L88 16 L88 44 L52 44 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__accent"
        d="M28 58 L64 58"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M28 58 L28 30"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M28 58 L12 68"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <text class="detali-card-visual__label" x="42" y="72">X</text>
      <text class="detali-card-visual__label" x="18" y="42">Z</text>
      <text class="detali-card-visual__label" x="8" y="78">Y</text>
    </svg>

    <!-- Wall thickness: cross-section with dimension -->
    <svg
      v-else-if="id === 'wall'"
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__fill"
        d="M34 18 H52 V70 H34 Z"
      />
      <path
        class="detali-card-visual__accent"
        d="M34 18 H52 V70 H34 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__muted"
        d="M52 28 H78 V60 H52"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__accent"
        d="M34 78 H52"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M34 74 V82 M52 74 V82"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <text class="detali-card-visual__label" x="58" y="82">t</text>
    </svg>

    <!-- Fine feature: pin with size callout -->
    <svg
      v-else-if="id === 'feature'"
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__muted"
        d="M24 62 H96 V72 H24 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__fill"
        d="M54 22 H66 V62 H54 Z"
      />
      <path
        class="detali-card-visual__accent"
        d="M54 22 H66 V62 H54 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__accent"
        d="M48 18 V26 M72 18 V26"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M48 22 H72"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <text class="detali-card-visual__label" x="80" y="26">ø</text>
    </svg>

    <!-- Layer height: stacked layers -->
    <svg
      v-else
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__muted"
        d="M30 64 H90 V72 H30 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__muted"
        d="M30 54 H90 V62 H30 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__muted"
        d="M30 44 H90 V52 H30 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__fill"
        d="M30 34 H90 V42 H30 Z"
      />
      <path
        class="detali-card-visual__accent"
        d="M30 34 H90 V42 H30 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__accent"
        d="M96 34 V42"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M92 34 H100 M92 42 H100"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <text class="detali-card-visual__label" x="104" y="40">h</text>
    </svg>
  </div>
</template>
