import { DOWNWINDER_BOOST } from 'src/modules/cards/bases/constants'
import type { ShadowBaseMap } from 'src/modules/cards/types'

export const shadowCardBases: ShadowBaseMap = {
  downwinderThief: {
    type: 'Character',
    name: 'Downwinder Thief',
    strength: 2,
    cost: 1,
    faction: 'Shadow',
    categories: ['Thief'],
    description: `When stealing coins from opponent boost self by ${DOWNWINDER_BOOST}.`,
    flavor:
      "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets. -- excerpt from the Downwinders Creed",
  },
  garrettMasterThief: {
    type: 'Character',
    name: 'Garrett: Master Thief',
    strength: 4,
    cost: 5,
    isElite: true,
    faction: 'Shadow',
    categories: ['Thief'],
    description: 'This card never looses its Hidden trait.',
    flavor:
      'His heart was clouded, and his balance was lost, but his abilities were unmatched. -- Keeper Annals',
    traits: ['hidden'],
  },
}
