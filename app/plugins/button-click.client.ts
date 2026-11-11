/**
 * UI press sounds:
 * - Buttons: analog down + up (btn-down / btn-up)
 * - Links (non-button): soft tap on pointerdown only
 */
export default defineNuxtPlugin(() => {
  let ctx: AudioContext | null = null
  let downBuffer: AudioBuffer | null = null
  let upBuffer: AudioBuffer | null = null
  let linkTapBuffer: AudioBuffer | null = null
  let pressed = false
  let loadPromise: Promise<void> | null = null

  const BUTTON_VOLUME = 0.15
  const LINK_VOLUME = 0.1

  function getContext(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null
    if (!ctx) {
      ctx = new AudioContext()
    }
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    return ctx
  }

  async function ensureLoaded() {
    const audio = getContext()
    if (!audio || (downBuffer && upBuffer && linkTapBuffer)) return
    if (!loadPromise) {
      loadPromise = (async () => {
        const [downRes, upRes, linkRes] = await Promise.all([
          fetch('/sounds/btn-down.mp3'),
          fetch('/sounds/btn-up.mp3'),
          fetch('/sounds/link-tap.mp3'),
        ])
        const [downData, upData, linkData] = await Promise.all([
          downRes.arrayBuffer(),
          upRes.arrayBuffer(),
          linkRes.arrayBuffer(),
        ])
        downBuffer = await audio.decodeAudioData(downData.slice(0))
        upBuffer = await audio.decodeAudioData(upData.slice(0))
        linkTapBuffer = await audio.decodeAudioData(linkData.slice(0))
      })().catch(() => {
        loadPromise = null
      })
    }
    await loadPromise
  }

  function play(buffer: AudioBuffer | null, volume: number) {
    const audio = getContext()
    if (!audio || !buffer) return
    const source = audio.createBufferSource()
    source.buffer = buffer
    const gain = audio.createGain()
    gain.gain.value = volume
    source.connect(gain)
    gain.connect(audio.destination)
    source.start(0)
  }

  function isPressControl(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null
    const el = target.closest(
      '.btn, button, .checkbox, input[type="checkbox"], input[type="submit"], input[type="button"], input[type="reset"]',
    )
    if (!(el instanceof HTMLElement)) return null
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
      return null
    }
    const input =
      el instanceof HTMLInputElement && el.type === 'checkbox'
        ? el
        : el.querySelector('input[type="checkbox"]')
    if (input instanceof HTMLInputElement && input.disabled) {
      return null
    }
    return el
  }

  function isPlainLink(target: EventTarget | null): HTMLAnchorElement | null {
    if (!(target instanceof Element)) return null
    if (isPressControl(target)) return null
    const el = target.closest('a[href]')
    if (!(el instanceof HTMLAnchorElement)) return null
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
      return null
    }
    return el
  }

  async function onDown(event: PointerEvent) {
    if (event.button !== 0) return

    if (isPressControl(event.target)) {
      pressed = true
      await ensureLoaded()
      play(downBuffer, BUTTON_VOLUME)
      return
    }

    if (isPlainLink(event.target)) {
      await ensureLoaded()
      play(linkTapBuffer, LINK_VOLUME)
    }
  }

  async function onUp() {
    if (!pressed) return
    pressed = false
    await ensureLoaded()
    play(upBuffer, BUTTON_VOLUME)
  }

  void ensureLoaded()

  document.addEventListener('pointerdown', onDown, { capture: true, passive: true })
  document.addEventListener('pointerup', onUp, { capture: true, passive: true })
  document.addEventListener('pointercancel', onUp, { capture: true, passive: true })
})
