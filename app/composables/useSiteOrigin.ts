/**
 * Absolute site origin for canonical URLs, sitemap, and JSON-LD.
 * Prefers NUXT_PUBLIC_SITE_URL, falls back to the current request host.
 */
export function useSiteOrigin() {
  const config = useRuntimeConfig()
  const url = useRequestURL()

  return computed(() => {
    const configured = String(config.public.siteUrl || '').trim().replace(/\/$/, '')
    return configured || url.origin
  })
}
