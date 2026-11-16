export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  return await createFigurine(body ?? {})
})
