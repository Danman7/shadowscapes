import { templeGuardOutnumberedLifeBuff } from '../cards/bases/orderConstants'
import type { CardBaseId } from '../cards/bases'

type CardMessage = {
  name: string
  description: string
  flavor: string
}

export const cardsText = {
  cards: {
    zombie: {
      name: 'Zombie',
      description: 'On play, summon all Zombies from your discard pile.',
      flavor:
        "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    },

    haunt: {
      name: 'Haunt',
      description:
        'When Haunt defeats a character, gain 1 charge. Spend 1 charge: Haunt gains +1 strength for its next attack.',
      flavor:
        'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    },

    bookOfAsh: {
      name: 'Book of Ash',
      description:
        'Create and summon a copy of a common undead from your discard pile.',
      flavor:
        "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    },

    novice: {
      name: 'Novice',
      description:
        'On play, summon all Novices, not in your discard, if you have a stronger Hammerite on board.',
      flavor:
        'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    },

    templeGuard: {
      name: 'Temple Guard',
      description: `Gain ${templeGuardOutnumberedLifeBuff} life on play if you control fewer cards than your foe.`,
      flavor:
        'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    },

    yoraSkull: {
      name: "Saint Yora's Skull",
      description: 'Give {buff} life to all Hammerites you control.',
      flavor: 'Yora was a builder of vision and devout keeper of the faith.',
    },
  },
} as const satisfies {
  cards: Record<CardBaseId, CardMessage>
}
