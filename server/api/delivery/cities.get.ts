import { isCarrierConfigured } from '../../utils/delivery/config'
import { searchNovaCities } from '../../utils/delivery/nova'

export default defineEventHandler(async (event) => {
  if (!isCarrierConfigured('nova')) {
    throw createError({
      statusCode: 503,
      message: 'Автокомпліт міст потребує ключа Нової Пошти (NUXT_NP_API_KEY)',
    })
  }

  const query = String(getQuery(event).q || '').trim()
  if (query.length < 2) return []

  return await searchNovaCities(query)
})
