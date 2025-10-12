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
  },
} satisfies {
  ui: Record<string, string>
  definitions: Record<CardDefinitionId, DefinitionText>
}
