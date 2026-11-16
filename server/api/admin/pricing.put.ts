export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{
    standardUahPerG?: number
    engineeringUahPerG?: number
    partsMinOrderUah?: number
  }>(event)

  return await setPartsPricing({
    standardUahPerG: body?.standardUahPerG,
    engineeringUahPerG: body?.engineeringUahPerG,
    partsMinOrderUah: body?.partsMinOrderUah,
  })
})
