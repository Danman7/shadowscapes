import { chaosCardBases } from 'src/modules/cards/bases/chaos'
import { neutralCardBases } from 'src/modules/cards/bases/neutral'
import { orderCardBases } from 'src/modules/cards/bases/order'
import { shadowCardBases } from 'src/modules/cards/bases/shadow'
import type { CardBaseMap } from 'src/modules/cards/types'

export const allCardBases: CardBaseMap = {
  ...orderCardBases,
  ...chaosCardBases,
  ...shadowCardBases,
  ...neutralCardBases,
}
