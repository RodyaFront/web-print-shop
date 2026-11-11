/**
 * Scroll-linked shift for the global body dot grid (CSS --bg-parallax-y).
 */
export default defineNuxtPlugin(() => {
  const root = document.documentElement
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  /** Background lag vs scroll (0 = fixed, 1 = locked to content). */
  const FACTOR = 0.08

  let ticking = false

  function paint(y: number) {
    root.style.setProperty('--bg-parallax-y', `${y}px`)
  }

  function clear() {
    root.style.removeProperty('--bg-parallax-y')
  }

  function update() {
    ticking = false
    if (reduceMotion.matches) {
      clear()
      return
    }
    // Negative: pattern drifts up slower than content (lags behind).
    paint(-window.scrollY * FACTOR)
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  function onMotionChange() {
    if (reduceMotion.matches) {
      clear()
      return
    }
    update()
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  reduceMotion.addEventListener('change', onMotionChange)
  update()
})
