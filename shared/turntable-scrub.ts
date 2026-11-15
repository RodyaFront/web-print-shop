/**
 * Pointer → turntable frame mapping + return-spring timing.
 *
 * Frame contract (catalog / Blender pipeline):
 * - Odd-length list, left → right by yaw.
 * - Middle index = front (0°).
 * - Both ends = same back plate URL (±180°).
 *
 * Scrub bands are wider at the edges and tighter near the front:
 *   [==== back ====] … [= near =][= front =][= near =] … [==== back ====]
 *
 * Thumb progress is linear in frame index (step position), not pointer X.
 */

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t)
}

/** Front frame index for an odd-length turntable strip. */
export function turntableCenterIndex(frameCount: number): number {
  if (frameCount <= 1) return 0
  return Math.floor((frameCount - 1) / 2)
}

/**
 * Validate catalog/render contract. Throws if the strip cannot scrub safely.
 */
export function assertTurntableFrames(frames: readonly string[]): void {
  if (frames.length < 2) {
    throw new Error('turntable: need at least 2 frames')
  }
  if (frames.length % 2 === 0) {
    throw new Error(
      `turntable: expected odd frame count for a unique front, got ${frames.length}`,
    )
  }
  const first = frames[0]
  const last = frames[frames.length - 1]
  if (first !== last) {
    throw new Error(
      'turntable: first and last frames must be the same back plate (±180°)',
    )
  }
}

/** True when `assertTurntableFrames` would pass. */
export function isValidTurntableFrames(frames: readonly string[]): boolean {
  try {
    assertTurntableFrames(frames)
    return true
  } catch {
    return false
  }
}

/**
 * Relative band widths for `count` frames (left → right).
 * Center ≈ 1, edges ≈ 1 + edgeBoost (default ~3× center).
 */
export function turntableBandWeights(
  count: number,
  edgeBoost = 2,
  falloff = 1.35,
): number[] {
  if (count <= 0) return []
  if (count === 1) return [1]

  const mid = (count - 1) / 2
  return Array.from({ length: count }, (_, i) => {
    const edge = Math.abs(i - mid) / mid // 0 center → 1 edge
    return 1 + edgeBoost * edge ** falloff
  })
}

/** Inclusive cumulative edges: length = count + 1, values in [0, 1]. */
export function turntableBandEdges(count: number): number[] {
  const weights = turntableBandWeights(count)
  const total = weights.reduce((sum, w) => sum + w, 0)
  const edges = [0]
  let acc = 0
  for (const w of weights) {
    acc += w / total
    edges.push(acc)
  }
  edges[edges.length - 1] = 1
  return edges
}

/**
 * Map normalized pointer X ∈ [0, 1] to a frame index.
 * Uses edge-heavy bands (tighter near the front).
 */
export function pointerXToFrameIndex(x: number, frameCount: number): number {
  if (frameCount <= 1) return 0

  const edges = turntableBandEdges(frameCount)
  const t = clamp01(x)

  for (let i = 0; i < frameCount - 1; i++) {
    if (t < edges[i + 1]!) return i
  }
  return frameCount - 1
}

/**
 * Return-to-center spring knobs. Edit here while tuning.
 *
 * - `tension`: 1 = default. Try 0.6 (softer) … 1.5–2 (snappier).
 * - `*MidMs`: hop delay at the fastest point (middle of the return).
 * - `*EdgeMs`: hop delay at release and arrival (ease-in-out poles).
 */
export const RETURN_SPRING = {
  tension: 2,
  weakMidMs: 78,
  weakEdgeMs: 110,
  strongMidMs: 28,
  strongEdgeMs: 72,
  /** Floor so steps never become invisible. */
  minStepMs: 16,
}

/**
 * Delay before the next frame while springing back to center.
 *
 * Ease-in-out: slower at release and arrival, faster through the middle.
 * Stronger pull → shorter delays overall (more inertia).
 */
export function returnStepDelayMs(
  remaining: number,
  initialDistance: number,
): number {
  const pull = Math.max(1, initialDistance)
  const left = Math.max(1, remaining)
  const {
    tension,
    weakMidMs,
    weakEdgeMs,
    strongMidMs,
    strongEdgeMs,
    minStepMs,
  } = RETURN_SPRING

  // 0 = just released, 1 = about to land on front.
  const traveled = clamp01((pull - left) / pull)
  // Peak speed in the middle of an ease-in-out (0 at both ends).
  const midBoost = Math.sin(traveled * Math.PI)

  const inertia = clamp01((pull - 1) / Math.max(1, pull))
  const edgeMs = lerp(weakEdgeMs, strongEdgeMs, inertia)
  const midMs = lerp(weakMidMs, strongMidMs, inertia)
  const raw = lerp(edgeMs, midMs, midBoost)

  const safeTension = Math.max(0.05, tension)
  return Math.round(Math.max(minStepMs, raw / safeTension))
}
