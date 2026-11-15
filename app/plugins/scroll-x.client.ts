/**
 * On `[data-scroll-x]` strips: map vertical wheel/trackpad delta to horizontal scroll.
 * At the start/end edge, vertical page scroll still works.
 */
export default defineNuxtPlugin(() => {
  function onWheel(event: WheelEvent) {
    if (event.defaultPrevented || event.ctrlKey) return

    const target = event.target
    if (!(target instanceof Element)) return

    const scroller = target.closest('[data-scroll-x]')
    if (!(scroller instanceof HTMLElement)) return

    const maxScroll = scroller.scrollWidth - scroller.clientWidth
    if (maxScroll <= 1) return

    // Prefer native horizontal / shift+wheel when the gesture is already sideways.
    const deltaX = event.deltaX
    const deltaY = event.deltaY
    if (Math.abs(deltaX) > Math.abs(deltaY)) return

    if (deltaY === 0) return

    const left = scroller.scrollLeft
    const goingLeft = deltaY < 0
    const atStart = left <= 0
    const atEnd = left >= maxScroll - 1

    if ((goingLeft && atStart) || (!goingLeft && atEnd)) return

    event.preventDefault()
    scroller.scrollLeft += deltaY
  }

  document.addEventListener('wheel', onWheel, { capture: true, passive: false })
})
