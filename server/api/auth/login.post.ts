export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const password = String(body?.password || '')
  if (!password || !verifyAdminPassword(password)) {
    throw createError({ statusCode: 401, message: 'Невірний пароль' })
  }
  setAdminSessionCookie(event)
  return { ok: true }
})
