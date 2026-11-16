/**
 * Run: npx tsx shared/print-costing.selfcheck.ts
 */
import {
  PRINT_COSTING_DEFAULTS,
  PRINT_SELL_RATE_ENGINEERING_LABEL,
  PRINT_SELL_RATE_LABEL,
  estimateHandsJobCost,
  estimatePrintJobCost,
  glovesUahPerSession,
  ipaUahPerMonth,
  laborHoursPerMonth,
  laborUahPerHourForProfitTarget,
  loadedHandUahPerHour,
  paintKitAmortUahPerMonth,
  paintKitTotalUah,
  printerAmortUahPerMonth,
  suggestPrintPriceFloor,
} from './print-costing.ts'

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message)
}

assert(ipaUahPerMonth() === 920, 'IPA month = 2 * 460')
assert(glovesUahPerSession() === 14, 'gloves = 2 * 7')
assert(
  Math.abs(printerAmortUahPerMonth() - 25_000 / 12) < 1e-9,
  '1y payback amort',
)

const job = estimatePrintJobCost({
  massG: 100,
  resinUahPerG: 3,
  sessionsPerMonth: 20,
  amortMethod: 'monthly_sessions',
})

assert(job.glovesUah === 14, 'job gloves')
assert(Math.abs(job.ipaUah - 46) < 1e-9, 'job IPA 920/20')
assert(job.resinUah === 300, 'job resin')
assert(job.uahPerG > 0, 'uah/g positive')
assert(
  suggestPrintPriceFloor(job.jobUah) >= 250,
  'floor respects min order default',
)
assert(PRINT_COSTING_DEFAULTS.sellUahPerG === 15, 'sell rate locked')
assert(PRINT_SELL_RATE_LABEL === '15 грн/г', 'sell label')
assert(
  PRINT_COSTING_DEFAULTS.sellUahPerGEngineering === 30,
  'engineering = 2×',
)
assert(PRINT_SELL_RATE_ENGINEERING_LABEL === '30 грн/г', 'engineering label')
assert(
  PRINT_COSTING_DEFAULTS.farmBenchmarkUahPerG.min === 15,
  'farm band min',
)

assert(paintKitTotalUah() === 13_000, 'paint kit 6+2+5k')
assert(
  Math.abs(paintKitAmortUahPerMonth() - 13_000 / 12) < 1e-9,
  'paint kit 1y amort',
)
assert(Math.abs(laborHoursPerMonth() - (52 * 5 * 6) / 12) < 1e-9, '5/2×6h')
const laborH = laborUahPerHourForProfitTarget()
const loadedH = loadedHandUahPerHour()
assert(laborH > 190 && laborH < 195, 'labor ~192')
assert(loadedH > laborH, 'loaded > labor')

const hands = estimateHandsJobCost({ postHours: 0.5, paintHours: 4 })
assert(Math.abs(hands.handHours - 4.5) < 1e-9, 'hand hours')
assert(hands.handsUah > 0, 'hands cost')

console.log('print-costing selfcheck OK', {
  uahPerG: Number(job.uahPerG.toFixed(2)),
  jobUah: Number(job.jobUah.toFixed(2)),
  laborUahPerHour: Number(laborH.toFixed(2)),
  paintKitUahPerMonth: Number(paintKitAmortUahPerMonth().toFixed(2)),
  loadedHandUahPerHour: Number(loadedH.toFixed(2)),
})
