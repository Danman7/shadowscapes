import { AZARAN_BOOST } from 'src/modules/cards/bases/constants'
import type { ChaosBaseMap } from 'src/modules/cards/types'

export const chaosCardBases: ChaosBaseMap = {
  zombie: {
    type: 'Character',
    name: 'Zombie',
    strength: 3,
    cost: 1,
    faction: 'Chaos',
    categories: ['Undead'],
    description: [
      'If this card is in your discard pile when a Necromancer is played, bring it back to your board.',
    ],
    flavor:
      "The zombie's antipathy for all living creatures is both its strength and weakness.",
  },
  haunt: {
    type: 'Character',
    name: 'Haunt',
    strength: 7,
    cost: 3,
    faction: 'Chaos',
    categories: ['Undead', 'Hammerite'],
    description: [
      'Whenever your opponent plays a character, if this card is on board it attacks that character.',
    ],
    flavor:
      'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
  },
  azaranTheCruel: {
    type: 'Character',
    name: 'Azaran the Cruel',
    strength: 5,
    cost: 5,
    isElite: true,
    faction: 'Chaos',
    categories: ['Necromancer'],
    onPlayDescription: `Boost self by ${AZARAN_BOOST} for each Undead card in your discard pile.`,
    flavor:
      "Be warned! The truth is hidden from the unworthy. Blacken thy heart, or face the prisoners of flesh. -- Azaran's last mortal written words",
  },
  bookOfAsh: {
    type: 'Instant',
    name: 'The Book of Ash',
    cost: 5,
    isElite: true,
    faction: 'Chaos',
    categories: ['Artifact'],
    onPlayDescription:
      'Summon 2 copies of the top non-elite character in your discard pile.',
    flavor:
      'I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. -- Azaran the Cruel',
  },
}
