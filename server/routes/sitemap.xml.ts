import { FIGURKY_CATALOG } from '../../shared/figurky-catalog'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const requestUrl = getRequestURL(event)
  const configured = String(config.public.siteUrl || '').trim().replace(/\/$/, '')
  const origin = configured || requestUrl.origin

  const urls = [
    { loc: `${origin}/figurky`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/detali`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/figurky/zamovyty`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${origin}/detali/zamovyty`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${origin}/delivery`, changefreq: 'monthly', priority: '0.5' },
    ...FIGURKY_CATALOG.map((product) => ({
      loc: `${origin}/figurky/${product.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
