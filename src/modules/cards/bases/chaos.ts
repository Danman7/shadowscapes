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
}
