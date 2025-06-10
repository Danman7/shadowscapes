import type { CardBaseMap } from 'src/modules/cards/types'
import { orderCardBases } from 'src/modules/cards/bases/order'
import { chaosCardBases } from './chaos'
// import { shadowCardBases } from './shadow'
// import { neutralCardBases } from './neutral'

export const allCardBases: CardBaseMap = {
  ...orderCardBases,
  ...chaosCardBases,
  // ...shadowCardBases,
  // ...neutralCardBases,
}
