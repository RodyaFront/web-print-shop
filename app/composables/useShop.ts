import { SHOP_NAME, SHOP_TAGLINE } from '../../shared/shop'

export function useShop() {
  return {
    shopName: SHOP_NAME,
    shopTagline: SHOP_TAGLINE,
  }
}
