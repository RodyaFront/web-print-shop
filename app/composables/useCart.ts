import type { FigurineProduct } from '../../shared/figurky-catalog'

const CART_COOKIE = 'figulyarnya-cart'
const CART_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Client cart for ready-made catalog figurines (unique pieces, qty = 1).
 * Persist via cookie so SSR and client share the same ids.
 */
export function useCart() {
  const { byId, catalog } = useCatalog()

  const idsCookie = useCookie<string[]>(CART_COOKIE, {
    default: () => [],
    maxAge: CART_MAX_AGE,
    sameSite: 'lax',
    secure: !import.meta.dev,
    watch: true,
  })

  function sanitizeIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    const seen = new Set<string>()
    const ids: string[] = []
    for (const value of raw) {
      if (typeof value !== 'string' || !value) continue
      if (seen.has(value)) continue
      const product = byId(value)
      if (!product || product.status !== 'in_stock') continue
      seen.add(value)
      ids.push(value)
    }
    return ids
  }

  const ids = computed(() => sanitizeIds(idsCookie.value))

  const items = computed<FigurineProduct[]>(() =>
    ids.value
      .map((id) => byId(id))
      .filter((item): item is FigurineProduct => Boolean(item)),
  )

  const count = computed(() => items.value.length)

  const totalUah = computed(() =>
    items.value.reduce((sum, item) => sum + item.priceUah, 0),
  )

  function persist(next: string[]) {
    idsCookie.value = sanitizeIds(next)
  }

  function has(id: string) {
    return ids.value.includes(id)
  }

  function add(id: string) {
    const product = byId(id)
    if (!product || product.status !== 'in_stock') return false
    if (has(id)) return true
    persist([...ids.value, id])
    return true
  }

  function remove(id: string) {
    persist(ids.value.filter((item) => item !== id))
  }

  function clear() {
    persist([])
  }

  watch(catalog, () => {
    const next = sanitizeIds(idsCookie.value)
    if (next.join('|') !== (idsCookie.value ?? []).join('|')) {
      idsCookie.value = next
    }
  })

  return {
    ids,
    items,
    count,
    totalUah,
    has,
    add,
    remove,
    clear,
  }
}
