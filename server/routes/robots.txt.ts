export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const requestUrl = getRequestURL(event)
  const configured = String(config.public.siteUrl || '').trim().replace(/\/$/, '')
  const origin = configured || requestUrl.origin

  const body = `User-Agent: *
Allow: /

Disallow: /admin
Disallow: /koshyk

Sitemap: ${origin}/sitemap.xml
`

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
