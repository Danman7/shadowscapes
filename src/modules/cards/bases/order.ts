import { TEMPLE_GUARD_BOOST } from 'src/modules/cards/bases/constants'
import type { OrderBaseMap } from 'src/modules/cards/types'

export const orderCardBases: OrderBaseMap = {
  templeGuard: {
    type: 'Character',
    name: 'Temple Guard',
    cost: 5,
    strength: 4,
    faction: 'Order',
    categories: ['Guard', 'Hammerite'],
    onPlayDescription: `Gain +${TEMPLE_GUARD_BOOST} strength if you have less cards on the board than your opponent.`,
    flavor:
      'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    isElite: false,
  },
}
