<script setup lang="ts">
import type { PrintMaterialId } from '../../shared/print-services'

defineProps<{
  id: PrintMaterialId
}>()
</script>

<template>
  <div class="detali-card-visual" aria-hidden="true">
    <!-- Standard: smooth surface with fine detail -->
    <svg
      v-if="id === 'standard'"
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__fill"
        d="M22 58 H98 V70 H22 Z"
      />
      <path
        class="detali-card-visual__muted"
        d="M22 58 H98 V70 H22 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__accent"
        d="M22 58 C38 42 54 42 70 58 C82 68 92 52 98 58"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M48 36 Q52 28 56 36 Q60 44 64 36"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__muted"
        d="M70 40 H86"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M70 36 V44 M86 36 V44"
        stroke-width="1.25"
        stroke-linecap="round"
      />
    </svg>

    <!-- Engineering: ribbed section with load arrows -->
    <svg
      v-else-if="id === 'engineering'"
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__fill"
        d="M34 66 H86 V74 H34 Z"
      />
      <path
        class="detali-card-visual__muted"
        d="M34 66 H86 V74 H34 Z"
        stroke-width="1.25"
      />
      <path
        class="detali-card-visual__fill"
        d="M52 28 H68 V66 H52 Z"
      />
      <path
        class="detali-card-visual__accent"
        d="M52 28 H68 V66 H52 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__accent"
        d="M60 18 V28"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M54 24 L60 18 L66 24"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="detali-card-visual__muted"
        d="M40 48 H52 M68 48 H80"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M40 48 L46 44 M40 48 L46 52 M80 48 L74 44 M80 48 L74 52"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Castable: model → burnout → cavity -->
    <svg
      v-else
      class="detali-card-visual__svg"
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="detali-card-visual__fill"
        d="M18 50 H38 V70 H18 Z"
      />
      <path
        class="detali-card-visual__accent"
        d="M18 50 H38 V70 H18 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__muted"
        d="M42 60 H52"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M48 56 L52 60 L48 64"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="detali-card-visual__muted"
        d="M56 48 H76 V72 H56 Z"
        stroke-width="1.25"
        stroke-dasharray="3 2"
      />
      <path
        class="detali-card-visual__accent"
        d="M62 40 V48"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M58 44 L62 40 L66 44"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="detali-card-visual__muted"
        d="M80 60 H88"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path
        class="detali-card-visual__accent"
        d="M84 56 L88 60 L84 64"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="detali-card-visual__muted"
        d="M92 50 H112 V70 H92 Z"
        stroke-width="1.5"
      />
      <path
        class="detali-card-visual__fill"
        d="M98 56 H106 V70 H98 Z"
        opacity="0.35"
      />
    </svg>
  </div>
</template>
