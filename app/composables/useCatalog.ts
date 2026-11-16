import type { FigurineProduct } from '../../shared/figurky-catalog'
import { findFigurineByParam } from '../../shared/figurky-catalog'

/**
 * Shared public catalog (published items only).
 * Call sites that need data before render should `await useAsyncData`/`useFetch`
 * with the same key, or await `refresh()` after mount is not required on SSR
 * when the parent already triggered the shared fetch.
 */
export function useCatalog() {
  const state = useFetch<FigurineProduct[]>('/api/figurky', {
    key: 'figurky-catalog',
  })

  const catalog = computed(() => state.data.value ?? [])

  function byId(id: string) {
    return catalog.value.find((item) => item.id === id)
  }

  function byParam(param: string) {
    return findFigurineByParam(catalog.value, param)
  }

  return {
    ...state,
    catalog,
    byId,
    byParam,
  }
}
