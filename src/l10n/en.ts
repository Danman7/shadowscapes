import {
  acolyteGainIncome,
  templeGuardOutnumberedLifeBuff,
  yoraDirectBuff,
  yoraIndirectBuff,
} from '../cards/bases/orderConstants'
import type { CardBaseId } from '../cards/bases'

type CardMessage = {
  name: string
  description: string
  flavor: string
}

export const messages = {
  ui: {
    deckLabel: 'Deck',
    discardLabel: 'Disc.',
  },
} satisfies Record<string, Record<string, string>>

export const cardsText = {
  cards: {
    zombie: {
      name: 'Zombie',
      description: 'On play, summon the top Zombie from your discard pile.',
      flavor:
        "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    },

    burrick: {
      name: 'Burrick',
      description:
        "On attacking, if the Burrick has a charge, also damage the target's adjacent cards. On passing, gain a charge.",
      flavor:
        'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
    },

    haunt: {
      name: 'Haunt',
      description:
        'When Haunt is attacked by a damaged foe, it deals damage first.',
      flavor:
        'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    },

    bookOfAsh: {
      name: 'Book of Ash',
      description:
        'Select a discarded character and summon a 1-life copy of it.',
      flavor:
        "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    },

    novice: {
      name: 'Novice',
      description:
        'On play, summon all Novices from hand if you have an ally with more life.',
      flavor:
        'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    },

    acolyte: {
      name: 'Elevated Acolyte',
      description: `Draw a card on play, if Elevated Acolyte is alone on your board, or gain ${acolyteGainIncome} income instead, if he isn't.`,
      flavor:
        'He will endure a standard three-year contract of service, at the end of which he will be considered for indoctrination as an Elevated Acolyte.',
    },

    templeGuard: {
      name: 'Temple Guard',
      description: `+${templeGuardOutnumberedLifeBuff} life on play, if opponent has more cards on board.`,
      flavor:
        'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    },

    yoraSkull: {
      name: "Saint Yora's Skull",
      description: `Select an ally on board. It gains ${yoraDirectBuff} life. Also, adjacent allies gain ${yoraIndirectBuff} life if opponent has more cards on board.`,
      flavor: 'Yora was a builder of vision and devout keeper of the faith.',
    },
  },
} as const satisfies {
  cards: Record<CardBaseId, CardMessage>
}
