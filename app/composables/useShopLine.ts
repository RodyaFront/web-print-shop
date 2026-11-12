export type ShopLine = 'figurky' | 'detali'

/** Which product line the route belongs to (drives html[data-line] / --primary). */
export function resolveShopLine(path: string): ShopLine | undefined {
  if (path.startsWith('/detali')) return 'detali'
  if (
    path.startsWith('/figurky') ||
    path.startsWith('/koshyk') ||
    path.startsWith('/delivery')
  ) {
    return 'figurky'
  }
  return undefined
}

/** Sets html[data-line] so CSS --primary follows the page product line. */
export function useShopLine() {
  const route = useRoute()
  const line = computed(() => resolveShopLine(route.path))

  useHead(() => ({
    htmlAttrs: {
      'data-line': line.value,
    },
  }))

  return { line }
}
