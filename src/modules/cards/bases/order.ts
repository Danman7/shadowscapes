import {
  BROTHER_SACHELMAN_BOOST,
  ELEVATED_ACOLYTE_SELF_DAMAGE,
  HIGH_PRIEST_MAKANDER_COUNTER,
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
    traits: [{ type: 'retaliates', value: true }],
  },
  houseGuard: {
    type: 'Character',
    name: 'House Guard',
    strength: 2,
    cost: 2,
    faction: 'Order',
    categories: ['Guard'],
    onDiscardDescription: `Play all copies of this card from your hand or deck for free.`,
    flavor:
      'The Sir will be taking his dinner and evening out tonight. The house guard is not to find this an opportunity to shirk, and lapses will be brought up with the Sir.',
  },
  hammeriteNovice: {
    type: 'Character',
    name: 'Hammerite Novice',
    strength: 2,
    cost: 2,
    faction: 'Order',
    categories: ['Hammerite'],
    onPlayDescription: `If another Hammerite is on your board, play all copies of this card from your hand or deck for free.`,
    flavor:
      'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
  },
  elevatedAcolyte: {
    type: 'Character',
    name: 'Elevated Acolyte',
    strength: 3,
    cost: 2,
    faction: 'Order',
    categories: ['Hammerite'],
    onPlayDescription: `On play, take ${ELEVATED_ACOLYTE_SELF_DAMAGE} damage unless played next to a stronger Hammerite.`,
    flavor:
      'He will endure a standard three-year contract of service, at the end of which he will be considered for indoctrination as an Elevated Acolyte.',
  },
  hammeritePriest: {
    type: 'Character',
    name: 'Hammerite Priest',
    strength: 3,
    cost: 5,
    faction: 'Order',
    categories: ['Hammerite'],
    onPlayDescription: `Choose a card from your board to discard and immediately recover its cost.`,
    flavor:
      'The priest did tarry. And was the priest crushed beneath the great gears, for the path of righteousness leads ever upwards, to where it is perilous to fall.',
  },
  brotherSachelman: {
    type: 'Character',
    name: 'Brother Sachelman',
    strength: 4,
    cost: 6,
    isElite: true,
    faction: 'Order',
    categories: ['Hammerite'],
    onPlayDescription: `Boost all allied Hammerites on board with lower strength than this card's strength by ${BROTHER_SACHELMAN_BOOST}.`,
    flavor:
      'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
  },
  highPriestMarkander: {
    type: 'Character',
    name: 'High Priest Markander',
    strength: 4,
    cost: 7,
    isElite: true,
    faction: 'Order',
    categories: ['Hammerite'],
    description:
      'When a Hammerite is played, lose 1 counter. At 0 counters, if in hand or deck, play for free.',
    flavor:
      "He is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
    traits: [{ type: 'counter', value: HIGH_PRIEST_MAKANDER_COUNTER }],
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
