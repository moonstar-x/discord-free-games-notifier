export type GameOfferType = 'game' | 'dlc' | 'bundle' | 'other';

export interface GameOffer {
  storefront: string
  id: string
  url: string
  title: string
  description: string
  type: GameOfferType
  publisher: string | null
  original_price: number | null
  original_price_fmt: string | null
  thumbnail: string | null
}
