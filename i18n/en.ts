import {
  BROTHER_SACHELMAN_BOOST,
  CardDefinitionIds,
  ELEVATED_ACOLYTE_SELF_DAMAGE,
  TEMPLE_GUARD_BOOST,
  YORA_SKULL_BOOST,
} from '@/data/cardConstants'
import { CardDefinitionId } from '@/types'

type DefinitionText = {
  name: string
  flavor: string
  description: string | string[]
}

export const en = {
  duel: {
    duel: 'Duel',
    vs: 'VS',
    firstPlayer: '{playerName} plays first.',
    contextError:
      'Duel context is not available. Please ensure you are within a DuelProvider.',
  },

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
      description: [
        `+${TEMPLE_GUARD_BOOST} strength on play if you control fewer cards than your opponent.`,
        'Retaliates when attacked.',
      ],
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

    [CardDefinitionIds.ElevatedAcolyte]: {
      name: 'Elevated Acolyte',
      flavor:
        'He will endure a standard three-year contract of service, at the end of which he will be considered for indoctrination as an Elevated Acolyte.',
      description: `-${ELEVATED_ACOLYTE_SELF_DAMAGE} on play if not played next to a stronger Hammerite.`,
    },

    [CardDefinitionIds.BrotherSachelman]: {
      name: 'Brother Sachelman',
      flavor:
        'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
      description: `Boost all controlled Hammerites with lower strength than this card by ${BROTHER_SACHELMAN_BOOST}.`,
    },

    [CardDefinitionIds.Zombie]: {
      name: 'Zombie',
      flavor:
        "The zombie's antipathy for all living creatures is both its strength and weakness.",
      description:
        'On play also play all copies of this card from your discard.',
    },

    [CardDefinitionIds.Apparition]: {
      name: 'Apparition',
      flavor: '',
      description: '',
    },

    [CardDefinitionIds.AzaranTheCruel]: {
      name: 'Azaran the Cruel',
      flavor:
        "Be warned! The truth is hidden from the unworthy. Blacken thy heart, or face the prisoners of flesh. -- Azaran's last mortal written words",
      description: 'On play, play an artifact from your hand or deck.',
    },
  },
} satisfies {
  duel: Record<string, string>
  definitions: Record<CardDefinitionId, DefinitionText>
}
