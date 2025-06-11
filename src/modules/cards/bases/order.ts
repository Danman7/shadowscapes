import {
  BROTHER_SACHELMAN_BOOST,
  TEMPLE_GUARD_BOOST,
} from 'src/modules/cards/bases/constants'
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
  houseGuard: {
    type: 'Character',
    name: 'House Guard',
    strength: 2,
    cost: 2,
    faction: 'Order',
    categories: ['Guard'],
    onDiscardDescription: `Play all copies of this card from your hand or deck.`,
    flavor:
      'The Sir will be taking his dinner and evening out tonight. The house guard is not to find this an opportunity to shirk, and lapses will be brought up with the Sir.',
  },
  brotherSachelman: {
    type: 'Character',
    name: 'Brother Sachelman',
    strength: 4,
    cost: 6,
    isElite: true,
    faction: 'Order',
    categories: ['Hammerite'],
    onPlayDescription: `Boost all allied Hammerites on board with lower strength than this card's strength by ${BROTHER_SACHELMAN_BOOST}`,
    flavor:
      'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
  },
  yoraSkull: {
    type: 'Instant',
    name: "Saint Yora's Skull",
    cost: 5,
    isElite: true,
    faction: 'Order',
    categories: ['Artifact'],
    onPlayDescription: `Boost every Hammerite on the board by 1. If staring deck contains only Order cards boost all Hammerites in hand also.`,
    flavor: 'Yora was a builder of vision and devout keeper of the faith.',
  },
}
