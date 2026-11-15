<script setup lang="ts">
/**
 * Horizontal 1:1 image strip. Opt-in vertical→horizontal wheel via data-scroll-x.
 */
const props = withDefaults(
  defineProps<{
    images: readonly string[]
    /** Highlighted thumb; omit when strip only opens a preview. */
    activeIndex?: number | null
    ariaLabel?: string
  }>(),
  {
    activeIndex: null,
    ariaLabel: 'Кадри огляду',
  },
)

const emit = defineEmits<{
  select: [index: number]
}>()

const listRef = ref<HTMLElement | null>(null)

watch(
  () => props.activeIndex,
  async (index) => {
    if (index == null || index < 0 || !import.meta.client) return
    await nextTick()
    const item = listRef.value?.children[index]
    if (!(item instanceof HTMLElement)) return
    item.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <ul
    v-if="images.length > 1"
    ref="listRef"
    class="image-thumb-strip"
    data-scroll-x
    :aria-label="ariaLabel"
  >
    <li
      v-for="(src, index) in images"
      :key="src"
    >
      <button
        class="image-thumb-strip__thumb"
        type="button"
        :class="{ 'is-active': activeIndex === index }"
        :aria-label="`Кадр ${index + 1}`"
        :aria-current="activeIndex === index ? 'true' : undefined"
        @click="emit('select', index)"
      >
        <img
          :src="src"
          alt=""
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
          draggable="false"
        >
      </button>
    </li>
  </ul>
</template>
