import { listDeliveryMethods } from '../../utils/delivery/config'

export default defineEventHandler(() => {
  return listDeliveryMethods()
})
