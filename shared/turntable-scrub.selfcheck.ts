/**
 * Lightweight checks for turntable math (no test runner in the repo yet).
 * Run: npx tsx shared/turntable-scrub.selfcheck.ts
 */
import {
  assertTurntableFrames,
  isValidTurntableFrames,
  pointerXToFrameIndex,
  returnStepDelayMs,
  RETURN_SPRING,
  turntableBandEdges,
  turntableCenterIndex,
} from './turntable-scrub.ts'

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message)
}

const n = 25
assert(turntableCenterIndex(n) === 12, 'center index for 25 frames')

const edges = turntableBandEdges(n)
assert(edges.length === n + 1, 'band edges length')
assert(edges[0] === 0 && edges[n] === 1, 'band edges span 0..1')
assert(edges[1]! - edges[0]! > edges[13]! - edges[12]!, 'edge band wider than center')

assert(pointerXToFrameIndex(0, n) === 0, 'x=0 → first frame')
assert(pointerXToFrameIndex(1, n) === n - 1, 'x=1 → last frame')
assert(pointerXToFrameIndex(0.5, n) === 12, 'x=0.5 → front')

const strip = Array.from({ length: n }, (_, i) =>
  i === 0 || i === n - 1 ? 'back.png' : `f${i}.png`,
)
assertTurntableFrames(strip)
assert(isValidTurntableFrames(strip), 'valid strip')
assert(!isValidTurntableFrames(strip.slice(0, 24)), 'even length invalid')

const farEarly = returnStepDelayMs(12, 12)
const farMid = returnStepDelayMs(6, 12)
const farLate = returnStepDelayMs(1, 12)
assert(farMid <= farEarly, 'ease-in-out: mid ≤ start for strong pull')
assert(farMid <= farLate, 'ease-in-out: mid ≤ end for strong pull')

const near = returnStepDelayMs(1, 1)
assert(near >= farMid, 'weak pull not faster than strong mid')

console.log('turntable-scrub selfcheck OK', {
  center: turntableCenterIndex(n),
  tension: RETURN_SPRING.tension,
  delays: { farEarly, farMid, farLate, near },
})
