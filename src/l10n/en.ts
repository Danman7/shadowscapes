import {
  acolyteGainIncome,
  templeGuardOutnumberedLifeBuff,
  yoraDirectBuff,
  yoraIndirectBuff,
} from '../cards/bases/orderConstants'
import type { CardBaseId } from '../cards/bases'
import type { Phase } from '../duel/types'
import { viktoriaLifeBuff } from '../cards/bases/chaosConstants'
import { FLASH_BOMB_STUN_TURNS } from '../cards/bases/neutralConstants'

type CardMessage = {
  name: string
  description: string
  flavor: string
}

export const messages = {
  ui: {
    closeLabel: 'Close',
    deckLabel: 'Deck',
    discardLabel: 'Disc.',
    duelCompleteMessage: 'The duel is over.',
    duelWinnerTitle: '{name} wins!',
    passLabel: 'Pass',
  },
  phase: {
    setup: 'Setup phase',
    draw: 'Draw phase',
    play: 'Play phase',
    act: 'Act phase',
    refresh: 'Refresh phase',
  },
} satisfies {
  ui: Record<string, string>
  phase: Record<Phase, string>
}

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

    viktoriaQueen: {
      name: 'Viktoria - Maw Queen',
      description: `Every time you play a Beast, Viktoria gains ${viktoriaLifeBuff} life.`,
      flavor:
        'Bow to the Woodsie Lord and offer up your flesheye so that his Eye of Stone may see, Manfool! Bids he then the spruces to singer him an anthems! And the Woodsie Lord binders them fleshes to stone!',
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

    markander: {
      name: 'Markander',
      description:
        'Every time you play a Hammerite, Markander loses a charge. On 0 charges, summon Markander for free.',
      flavor:
        "Our master is old, and the Master Forgers do jostle each other for precedence. But, I spy not on my betters. 'Tis in The Builder's Hands.",
    },

    cook: {
      name: 'Cook',
      description: 'On play, draw a card',
      flavor:
        "Please speak to Cook about last night's dinner. I am in no way fooled by his practice of warming the salad to disguise wilting. If he is incapable of finding adequate ingredients, he can be replaced.",
    },

    speedPotion: {
      name: 'Speed Potion',
      description: 'Target ally in hand gains Haste.',
      flavor:
        "When it saw me, it flew right out the doors and off the balcony. I've never seen anything move like that. It couldn't have been human.",
    },

    flashBomb: {
      name: 'Flash Bomb',
      description: `Target enemy on board is stripped, then stunned for ${FLASH_BOMB_STUN_TURNS}.`,
      flavor:
        'Obtain a bolt of Spring Wiring, a Steel Plate, and a canister of Acidic Mixture. Put the Spring Wiring and the Acidic Mixture through the Fusing Machine in Bay E. A Flux Spheroid will be manufactured. Put the Flux Spheroid and the Steel Plate through the Fusing Machine in Bay E. A Flash Bomb will be manufactured.',
    },
  },
} as const satisfies {
  cards: Record<CardBaseId, CardMessage>
}
