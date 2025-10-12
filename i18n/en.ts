import {
  CardDefinitionIds,
  TEMPLE_GUARD_BOOST,
  YORA_SKULL_BOOST,
} from '@/data/constants'
import { CardDefinitionId } from '@/types'

type DefinitionText = {
  name: string
  flavor: string
  description: string | string[]
}

export const en = {
  ui: {},
  definitions: {
    [CardDefinitionIds.Novice]: {
      name: 'Novice',
      flavor:
        'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
      description:
        'On play, if you control a stronger Hammerite, play all copies of this from hand and deck for free.',
    },

    [CardDefinitionIds.TempleGuard]: {
      name: 'Temple Guard',
      flavor:
        'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
      description: `On play, gain +${TEMPLE_GUARD_BOOST} strength if you control fewer cards than your opponent.`,
    },

    [CardDefinitionIds.YoraSkull]: {
      name: "Saint Yora's Skull",
      flavor: 'Yora was a builder of vision and devout keeper of the faith.',
      description: `+${YORA_SKULL_BOOST} strength to all controlled Hammerites. If starting deck includes only Order cards, +${YORA_SKULL_BOOST} strength to all Hammerites in hand and deck.`,
    },

    [CardDefinitionIds.Haunt]: {
      name: 'Haunt',
      description:
        'Whenever your opponent plays a character, if this card is on board it attacks that character.',
      flavor:
        'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    },

    [CardDefinitionIds.Downwinder]: {
      name: 'Downwinder',
      flavor:
        "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets. -- Excerpt from Downwinders' Creed",
      description: '',
    },

    [CardDefinitionIds.Cook]: {
      name: 'Cook',
      flavor:
        "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced.",
      description: 'On play draw a card.',
    },
  },
} satisfies {
  ui: Record<string, string>
  definitions: Record<CardDefinitionId, DefinitionText>
}
