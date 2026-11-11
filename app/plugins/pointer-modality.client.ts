/**
 * Hybrid devices report (hover: hover) even while the user taps.
 * Track the active pointer so CSS can disable sticky hover after touch.
 */
export default defineNuxtPlugin(() => {
  const root = document.documentElement

  function setPointer(type: string) {
    root.dataset.pointer = type === 'touch' ? 'touch' : 'fine'
  }

  document.addEventListener(
    'pointerdown',
    (event) => {
      setPointer(event.pointerType)
    },
    { capture: true, passive: true },
  )

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        setPointer(event.pointerType)
      }
    },
    { capture: true, passive: true },
  )
})
