import {
  isValidTurntableFrames,
  pointerXToFrameIndex,
  returnStepDelayMs,
  turntableCenterIndex,
} from '../../shared/turntable-scrub'

/**
 * Card preview turntable: pointer scrub, frame stack preload, spring return.
 * Pure timing/mapping lives in `shared/turntable-scrub.ts`.
 */
export function useTurntableScrub(
  frames: Ref<readonly string[] | null | undefined>,
) {
  const activeFrames = computed(() => {
    const list = frames.value
    if (!list || list.length < 2) return null
    if (import.meta.dev && !isValidTurntableFrames(list)) {
      console.error('[useTurntableScrub] invalid turntable frame strip', list)
    }
    return list
  })

  const centerIndex = computed(() =>
    turntableCenterIndex(activeFrames.value?.length ?? 0),
  )

  const frameIndex = shallowRef(0)
  const scrubEnabled = shallowRef(false)
  const mediaHovered = shallowRef(false)
  const stackReady = shallowRef(false)

  let preloadPromise: Promise<void> | null = null
  let returnTimer: ReturnType<typeof setTimeout> | null = null
  let returnInitialDistance = 0

  const scrubProgress = computed(() => {
    const list = activeFrames.value
    if (!list || list.length < 2) return 0.5
    return frameIndex.value / (list.length - 1)
  })

  const scrubOffCenter = computed(
    () =>
      Boolean(activeFrames.value) && frameIndex.value !== centerIndex.value,
  )

  /** Single visibility flag: hover or springing back off-center. */
  const scrubVisible = computed(
    () => mediaHovered.value || scrubOffCenter.value,
  )

  function canScrub() {
    if (!import.meta.client || !activeFrames.value) return false
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }

  function preloadFrames() {
    if (!activeFrames.value || !import.meta.client) {
      return Promise.resolve()
    }
    if (stackReady.value) return Promise.resolve()
    if (preloadPromise) return preloadPromise

    const list = activeFrames.value
    preloadPromise = Promise.all(
      list.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image()
            img.decoding = 'async'
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          }),
      ),
    ).then(() => {
      stackReady.value = true
    })

    return preloadPromise
  }

  function stopReturnToCenter() {
    if (returnTimer == null) return
    clearTimeout(returnTimer)
    returnTimer = null
    returnInitialDistance = 0
  }

  function stepTowardCenter() {
    const target = centerIndex.value
    const current = frameIndex.value
    if (current === target || returnInitialDistance <= 0) {
      returnTimer = null
      returnInitialDistance = 0
      return
    }

    frameIndex.value = current + (current < target ? 1 : -1)

    const remaining = Math.abs(frameIndex.value - target)
    if (remaining === 0) {
      returnTimer = null
      returnInitialDistance = 0
      return
    }

    const delay = returnStepDelayMs(remaining, returnInitialDistance)
    returnTimer = setTimeout(stepTowardCenter, delay)
  }

  function startReturnToCenter() {
    stopReturnToCenter()
    const distance = Math.abs(frameIndex.value - centerIndex.value)
    if (distance === 0) return

    returnInitialDistance = distance
    const delay = returnStepDelayMs(distance, returnInitialDistance)
    returnTimer = setTimeout(stepTowardCenter, delay)
  }

  function onPointerEnter() {
    mediaHovered.value = true
    stopReturnToCenter()
    scrubEnabled.value = canScrub()
    if (!scrubEnabled.value || !activeFrames.value) return
    void preloadFrames()
  }

  function onPointerMove(event: PointerEvent) {
    if (!scrubEnabled.value || !activeFrames.value || !stackReady.value) return
    stopReturnToCenter()
    const el = event.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    frameIndex.value = pointerXToFrameIndex(x, activeFrames.value.length)
  }

  function onPointerLeave() {
    mediaHovered.value = false
    if (!activeFrames.value) return
    scrubEnabled.value = false
    startReturnToCenter()
  }

  onMounted(() => {
    frameIndex.value = centerIndex.value
  })

  onBeforeUnmount(() => {
    stopReturnToCenter()
  })

  watch(centerIndex, (index) => {
    stopReturnToCenter()
    frameIndex.value = index
  })

  watch(
    activeFrames,
    (list) => {
      stackReady.value = false
      preloadPromise = null
      if (list) frameIndex.value = turntableCenterIndex(list.length)
    },
    { flush: 'sync' },
  )

  return {
    frames: activeFrames,
    frameIndex,
    centerIndex,
    scrubProgress,
    scrubOffCenter,
    scrubVisible,
    stackReady,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
  }
}
