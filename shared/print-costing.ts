/**
 * Internal workshop cost model for pricing reviews.
 *
 * - Print (resin / MSLA): gram rate + printer/IPA/gloves
 * - Paint / post: labor hours + paint-booth kit amort (compressor, ventilation, box)
 *
 * Public /detali rates live in `print-services.ts`.
 *
 * ## Print job
 *
 *   C_var     = m_total * c_resin + IPA_сеанс + рукавички [+ електрика]
 *   C_var_adj = C_var * (1 + w)
 *   C_machine = амортизація_принтера   // місяць/N АБО грн/год * t_print
 *   C_labor   = t_post * c_hour        // опційно
 *   C_job     = C_var_adj + C_machine + C_labor
 *   c_g       = C_job / m_total        // m = model + supports
 *
 * ## Paint / finish (hands)
 *
 *   C_paint_kit_month = (compressor + ventilation + booth) / (lifeYears * 12)
 *   c_paint_kit_h     = C_paint_kit_month / hoursPerMonth   // 5/2 × 6h
 *   C_hands           = (t_post + t_paint) * (c_labor_h + c_paint_kit_h)
 *
 *   Full figurine ≈ m * sellUahPerG + C_hands
 *
 * Do not amortize the same asset twice on one job.
 */

/** Payback horizon for all workshop capital (owner target). */
export const WORKSHOP_PAYBACK_YEARS = 1

/** 5/2 week, 6 h/day → average month capacity for hands. */
export const LABOR_SCHEDULE = {
  workdaysPerWeek: 5,
  hoursPerDay: 6,
  /** 52 × 5 / 12 */
  avgWorkdaysPerMonth: (52 * 5) / 12,
  /** Profit target from sold hand hours (UAH / month). */
  targetProfitUahPerMonth: 25_000,
} as const

export function laborHoursPerMonth(
  schedule: typeof LABOR_SCHEDULE = LABOR_SCHEDULE,
): number {
  return schedule.avgWorkdaysPerMonth * schedule.hoursPerDay
}

/** ≈ 192 ₴/год if every scheduled hour is billed toward 25k profit. */
export function laborUahPerHourForProfitTarget(
  schedule: typeof LABOR_SCHEDULE = LABOR_SCHEDULE,
): number {
  return schedule.targetProfitUahPerMonth / laborHoursPerMonth(schedule)
}

/** Workshop defaults captured 2026-11 (electricity often skipped). */
export const PRINT_COSTING_DEFAULTS = {
  printerUah: 25_000,
  /** Straight-line payback for the printer (owner target: ≤ 1 year). */
  printerLifeYears: WORKSHOP_PAYBACK_YEARS,
  /**
   * Alternative life in useful print hours (pick one amort method per job).
   * Aligned with ~1 year payback.
   */
  printerUsefulHours: 1_000,
  ipaLitersPerMonth: 2,
  ipaUahPerLiter: 460,
  glovePairsPerSession: 2,
  gloveUahPerPair: 7,
  /** Failed jobs / successful jobs. */
  scrapRate: 0.1,
  /**
   * Resin purchase UAH/g - set when known (bag price / grams).
   * Left null until measured; callers must pass cResinUahPerG for a full job.
   */
  resinUahPerG: null as number | null,
  /**
   * Locked sell rates for print-only (UAH/g, slicer mass with supports).
   * Public /detali table should stay in sync via `print-services.ts`.
   */
  sellUahPerG: 15,
  /** Engineering resin = 2× standard. */
  sellUahPerGEngineering: 30,
  /** Market farm corridor for resin print only (benchmark). */
  farmBenchmarkUahPerG: { min: 15, max: 25 },
} as const

/** Paint-booth capital (amortized separately from the printer). */
export const PAINT_KIT_DEFAULTS = {
  compressorUah: 6_000,
  ventilationUah: 2_000,
  boothUah: 5_000,
  lifeYears: WORKSHOP_PAYBACK_YEARS,
} as const

/** Public labels for locked print rates. */
export const PRINT_SELL_RATE_LABEL = `${PRINT_COSTING_DEFAULTS.sellUahPerG} грн/г`
export const PRINT_SELL_RATE_ENGINEERING_LABEL = `${PRINT_COSTING_DEFAULTS.sellUahPerGEngineering} грн/г`

export function paintKitTotalUah(
  kit: typeof PAINT_KIT_DEFAULTS = PAINT_KIT_DEFAULTS,
): number {
  return kit.compressorUah + kit.ventilationUah + kit.boothUah
}

export function paintKitAmortUahPerMonth(
  kit: typeof PAINT_KIT_DEFAULTS = PAINT_KIT_DEFAULTS,
): number {
  const months = Math.max(1, kit.lifeYears * 12)
  return paintKitTotalUah(kit) / months
}

/** Spread paint-kit amort across scheduled hand hours (5/2 × 6h). */
export function paintKitAmortUahPerLaborHour(
  kit: typeof PAINT_KIT_DEFAULTS = PAINT_KIT_DEFAULTS,
  schedule: typeof LABOR_SCHEDULE = LABOR_SCHEDULE,
): number {
  return paintKitAmortUahPerMonth(kit) / laborHoursPerMonth(schedule)
}

/**
 * Fully loaded hand rate: profit-target labor + paint-kit amort per hour.
 * Use for post-process + paint time only (not for idle print-machine hours).
 */
export function loadedHandUahPerHour(
  schedule: typeof LABOR_SCHEDULE = LABOR_SCHEDULE,
  kit: typeof PAINT_KIT_DEFAULTS = PAINT_KIT_DEFAULTS,
): number {
  return (
    laborUahPerHourForProfitTarget(schedule)
    + paintKitAmortUahPerLaborHour(kit, schedule)
  )
}

export type HandsJobCostInput = {
  /** Support removal / wash / cleanup hours. */
  postHours?: number
  /** Prime + paint + varnish hours. */
  paintHours?: number
  /** Override base labor ₴/h (default = profit-target rate). */
  laborUahPerHour?: number
  /** Include paint-kit amort in the hourly load (default true). */
  includePaintKitAmort?: boolean
}

export type HandsJobCostBreakdown = {
  postHours: number
  paintHours: number
  handHours: number
  laborUahPerHour: number
  paintKitUahPerHour: number
  loadedUahPerHour: number
  laborUah: number
  paintKitUah: number
  handsUah: number
}

export function estimateHandsJobCost(
  input: HandsJobCostInput = {},
): HandsJobCostBreakdown {
  const postHours = Math.max(0, input.postHours ?? 0)
  const paintHours = Math.max(0, input.paintHours ?? 0)
  const handHours = postHours + paintHours
  const laborUahPerHour =
    input.laborUahPerHour ?? laborUahPerHourForProfitTarget()
  const includeKit = input.includePaintKitAmort !== false
  const paintKitUahPerHour = includeKit ? paintKitAmortUahPerLaborHour() : 0
  const loadedUahPerHour = laborUahPerHour + paintKitUahPerHour
  const laborUah = handHours * laborUahPerHour
  const paintKitUah = handHours * paintKitUahPerHour

  return {
    postHours,
    paintHours,
    handHours,
    laborUahPerHour,
    paintKitUahPerHour,
    loadedUahPerHour,
    laborUah,
    paintKitUah,
    handsUah: laborUah + paintKitUah,
  }
}

export type PrintCostingDefaults = typeof PRINT_COSTING_DEFAULTS

export type AmortMethod = 'monthly_sessions' | 'print_hours'

export type PrintJobCostInput = {
  /** Slicer mass: model + supports, grams. */
  massG: number
  /** Purchase price of resin, UAH per gram. */
  resinUahPerG: number
  /** Wall-clock print hours for machine amort when method = print_hours. */
  printHours?: number
  /** Sessions this month - required for monthly_sessions amort + IPA split. */
  sessionsPerMonth?: number
  amortMethod?: AmortMethod
  /** Override scrap; default PRINT_COSTING_DEFAULTS.scrapRate. */
  scrapRate?: number
  /** Optional electricity for this job, UAH. */
  electricityUah?: number
  /** Optional post-process labor hours × hourly rate. */
  postHours?: number
  laborUahPerHour?: number
  /** Override workshop kit (printer, IPA, gloves). */
  kit?: Partial<{
    printerUah: number
    printerLifeYears: number
    printerUsefulHours: number
    ipaLitersPerMonth: number
    ipaUahPerLiter: number
    glovePairsPerSession: number
    gloveUahPerPair: number
  }>
}

export type PrintJobCostBreakdown = {
  resinUah: number
  ipaUah: number
  glovesUah: number
  electricityUah: number
  variableBeforeScrapUah: number
  scrapRate: number
  variableAdjUah: number
  machineUah: number
  laborUah: number
  jobUah: number
  /** UAH per gram of slicer mass (model + supports). */
  uahPerG: number
  amortMethod: AmortMethod
}

export function ipaUahPerMonth(
  kit: Pick<
    PrintCostingDefaults,
    'ipaLitersPerMonth' | 'ipaUahPerLiter'
  > = PRINT_COSTING_DEFAULTS,
): number {
  return kit.ipaLitersPerMonth * kit.ipaUahPerLiter
}

export function glovesUahPerSession(
  kit: Pick<
    PrintCostingDefaults,
    'glovePairsPerSession' | 'gloveUahPerPair'
  > = PRINT_COSTING_DEFAULTS,
): number {
  return kit.glovePairsPerSession * kit.gloveUahPerPair
}

export function printerAmortUahPerMonth(
  kit: Pick<
    PrintCostingDefaults,
    'printerUah' | 'printerLifeYears'
  > = PRINT_COSTING_DEFAULTS,
): number {
  const months = Math.max(1, kit.printerLifeYears * 12)
  return kit.printerUah / months
}

export function printerAmortUahPerHour(
  kit: Pick<
    PrintCostingDefaults,
    'printerUah' | 'printerUsefulHours'
  > = PRINT_COSTING_DEFAULTS,
): number {
  const hours = Math.max(1, kit.printerUsefulHours)
  return kit.printerUah / hours
}

function mergeKit(partial?: PrintJobCostInput['kit']) {
  return {
    printerUah: partial?.printerUah ?? PRINT_COSTING_DEFAULTS.printerUah,
    printerLifeYears:
      partial?.printerLifeYears ?? PRINT_COSTING_DEFAULTS.printerLifeYears,
    printerUsefulHours:
      partial?.printerUsefulHours ?? PRINT_COSTING_DEFAULTS.printerUsefulHours,
    ipaLitersPerMonth:
      partial?.ipaLitersPerMonth ?? PRINT_COSTING_DEFAULTS.ipaLitersPerMonth,
    ipaUahPerLiter:
      partial?.ipaUahPerLiter ?? PRINT_COSTING_DEFAULTS.ipaUahPerLiter,
    glovePairsPerSession:
      partial?.glovePairsPerSession
      ?? PRINT_COSTING_DEFAULTS.glovePairsPerSession,
    gloveUahPerPair:
      partial?.gloveUahPerPair ?? PRINT_COSTING_DEFAULTS.gloveUahPerPair,
  }
}

/**
 * Full job cost. Prefer one amort method:
 * - `monthly_sessions`: needs sessionsPerMonth (IPA + printer month / N)
 * - `print_hours`: needs printHours; IPA still needs sessionsPerMonth to split the monthly can
 */
export function estimatePrintJobCost(
  input: PrintJobCostInput,
): PrintJobCostBreakdown {
  const kit = mergeKit(input.kit)
  const method = input.amortMethod ?? 'monthly_sessions'
  const scrap = input.scrapRate ?? PRINT_COSTING_DEFAULTS.scrapRate
  const mass = Math.max(0, input.massG)

  const resinUah = mass * input.resinUahPerG
  const glovesUah = glovesUahPerSession(kit)

  const sessions = Math.max(1, input.sessionsPerMonth ?? 1)
  const ipaUah = ipaUahPerMonth(kit) / sessions
  const electricityUah = Math.max(0, input.electricityUah ?? 0)

  const variableBeforeScrapUah =
    resinUah + ipaUah + glovesUah + electricityUah
  const variableAdjUah = variableBeforeScrapUah * (1 + Math.max(0, scrap))

  let machineUah = 0
  if (method === 'monthly_sessions') {
    machineUah = printerAmortUahPerMonth(kit) / sessions
  } else {
    const hours = Math.max(0, input.printHours ?? 0)
    machineUah = printerAmortUahPerHour(kit) * hours
  }

  const postHours = Math.max(0, input.postHours ?? 0)
  const laborRate = Math.max(0, input.laborUahPerHour ?? 0)
  const laborUah = postHours * laborRate

  const jobUah = variableAdjUah + machineUah + laborUah
  const uahPerG = mass > 0 ? jobUah / mass : 0

  return {
    resinUah,
    ipaUah,
    glovesUah,
    electricityUah,
    variableBeforeScrapUah,
    scrapRate: scrap,
    variableAdjUah,
    machineUah,
    laborUah,
    jobUah,
    uahPerG,
    amortMethod: method,
  }
}

/** Suggested client floor from job cost. */
export function suggestPrintPriceFloor(
  jobUah: number,
  margin = 0.35,
  minOrderUah = 250,
): number {
  return Math.max(jobUah * (1 + margin), minOrderUah)
}

export function isWithinFarmBenchmark(
  uahPerG: number,
  band: { min: number; max: number } = PRINT_COSTING_DEFAULTS.farmBenchmarkUahPerG,
): boolean {
  return uahPerG >= band.min && uahPerG <= band.max
}
