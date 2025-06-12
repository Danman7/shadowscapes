import { NeutralBaseMap } from 'src/modules/cards/types'

export const neutralCardBases: NeutralBaseMap = {
  cook: {
    type: 'Character',
    name: 'Cook',
    categories: ['Servant'],
    cost: 2,
    strength: 1,
    onDiscardDescription: 'Draw a card.',
    flavor:
      "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced.",
  },
}
