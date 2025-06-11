import { chaosCardBases } from 'src/modules/cards/bases/chaos'
import { orderCardBases } from 'src/modules/cards/bases/order'
import type { CardBaseMap } from 'src/modules/cards/types'
// import { shadowCardBases } from './shadow'
// import { neutralCardBases } from './neutral'

export const allCardBases: CardBaseMap = {
  ...orderCardBases,
  ...chaosCardBases,
  // ...shadowCardBases,
  // ...neutralCardBases,
}
