import { join } from 'node:path'
import { createError } from 'h3'
import { PRINT_COSTING_DEFAULTS } from '../../shared/print-costing'
import { readJsonFile, writeJsonFile } from './json-store'

export type PartsPricing = {
  standardUahPerG: number
  engineeringUahPerG: number
  partsMinOrderUah: number
}

export const DEFAULT_PARTS_PRICING: PartsPricing = {
  standardUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerG,
  engineeringUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerGEngineering,
  partsMinOrderUah: 250,
}

function pricingPath() {
  return join(process.cwd(), 'data', 'settings', 'pricing.json')
}

function normalizePricing(raw: unknown): PartsPricing {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const standardUahPerG = Number(row.standardUahPerG)
  const engineeringUahPerG = Number(row.engineeringUahPerG)
  const partsMinOrderUah = Number(row.partsMinOrderUah)

  return {
    standardUahPerG:
      Number.isFinite(standardUahPerG) && standardUahPerG > 0
        ? standardUahPerG
        : DEFAULT_PARTS_PRICING.standardUahPerG,
    engineeringUahPerG:
      Number.isFinite(engineeringUahPerG) && engineeringUahPerG > 0
        ? engineeringUahPerG
        : DEFAULT_PARTS_PRICING.engineeringUahPerG,
    partsMinOrderUah:
      Number.isFinite(partsMinOrderUah) && partsMinOrderUah > 0
        ? Math.round(partsMinOrderUah)
        : DEFAULT_PARTS_PRICING.partsMinOrderUah,
  }
}

export async function getPartsPricing(): Promise<PartsPricing> {
  const existing = await readJsonFile<unknown>(pricingPath())
  if (existing == null) {
    await writeJsonFile(pricingPath(), DEFAULT_PARTS_PRICING)
    return { ...DEFAULT_PARTS_PRICING }
  }
  return normalizePricing(existing)
}

export async function setPartsPricing(
  input: Partial<PartsPricing>,
): Promise<PartsPricing> {
  const current = await getPartsPricing()
  const next = normalizePricing({ ...current, ...input })

  if (next.standardUahPerG <= 0 || next.engineeringUahPerG <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Ставки за грам мають бути більшими за 0',
    })
  }
  if (next.partsMinOrderUah <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Мінімальне замовлення має бути більшим за 0',
    })
  }

  await writeJsonFile(pricingPath(), next)
  return next
}
