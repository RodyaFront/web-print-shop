// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'uk' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    adminPassword: '',
    sessionSecret: '',
    npApiKey: '',
    meestLogin: '',
    meestPassword: '',
    ukrposhtaBearer: '',
  },
  nitro: {
    // STL and reference packs for custom orders
    maxRequestBodySize: 30 * 1024 * 1024,
  },
})

