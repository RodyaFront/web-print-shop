import type { PartsPricingInput } from '../../shared/print-services'
import {
  availablePrintTechnologies,
  formatPartsMinOrder,
} from '../../shared/print-services'
import { PRINT_COSTING_DEFAULTS } from '../../shared/print-costing'

const FALLBACK: PartsPricingInput = {
  standardUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerG,
  engineeringUahPerG: PRINT_COSTING_DEFAULTS.sellUahPerGEngineering,
  partsMinOrderUah: 250,
}

export function usePricing() {
  const state = useFetch<PartsPricingInput>('/api/pricing', {
    key: 'parts-pricing',
  })

  const pricing = computed(() => state.data.value ?? FALLBACK)

  const technologies = computed(() =>
    availablePrintTechnologies(pricing.value),
  )

  const minOrderLabel = computed(() =>
    formatPartsMinOrder(pricing.value.partsMinOrderUah),
  )

  return {
    ...state,
    pricing,
    technologies,
    minOrderLabel,
  }
}
