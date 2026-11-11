export default defineEventHandler(async (event) => {
  clearAdminSessionCookie(event)
  return { ok: true }
})
