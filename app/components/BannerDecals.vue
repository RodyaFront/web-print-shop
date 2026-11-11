<script setup lang="ts">
export type BannerDecalSlot = {
  id: number
  left: string
  top: string
  rotate: string
  scale: number
}

const props = withDefaults(
  defineProps<{
    /** Number of decal slots scattered on the canvas. */
    count?: number
    /** Seeded RNG so SSR and client match. */
    seed?: number
    /** Opacity 0..1 (0.15 = 15%). */
    opacity?: number
    /** Base size of one decal (width/height). */
    size?: string
    /** Random scale range around 1 (±25% → 0.75..1.25). */
    scaleJitter?: number
  }>(),
  {
    count: 16,
    seed: 42,
    opacity: 0.15,
    size: '1.25rem',
    scaleJitter: 0.25,
  },
)

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const slots = computed<BannerDecalSlot[]>(() => {
  const rand = mulberry32(props.seed)
  const jitter = Math.min(Math.max(props.scaleJitter, 0), 0.95)
  const list: BannerDecalSlot[] = []

  for (let i = 0; i < props.count; i++) {
    const scale = 1 + (rand() * 2 - 1) * jitter
    list.push({
      id: i,
      left: `${(rand() * 100).toFixed(2)}%`,
      top: `${(rand() * 100).toFixed(2)}%`,
      rotate: `${Math.round(rand() * 360)}deg`,
      scale: Math.round(scale * 1000) / 1000,
    })
  }

  return list
})
</script>

<template>
  <div
    class="banner-decals"
    aria-hidden="true"
    :style="{
      '--decal-opacity': String(opacity),
      '--decal-size': size,
    }"
  >
    <span
      v-for="slot in slots"
      :key="slot.id"
      class="banner-decals__slot"
      :style="{
        left: slot.left,
        top: slot.top,
        '--decal-rotate': slot.rotate,
        '--decal-scale': String(slot.scale),
      }"
    >
      <slot :slot="slot" :index="slot.id" />
    </span>
  </div>
</template>
