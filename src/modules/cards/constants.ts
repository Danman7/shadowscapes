import { GiBackForth, GiSemiClosedEye } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { CharacterTrait, TraitInfo } from 'src/modules/cards/types'

export const traitInfoMap: Record<CharacterTrait, TraitInfo> = {
  retaliates: {
    icon: GiBackForth,
    title: messages.card.traits.retaliatesTitle,
    description: messages.card.traits.retaliatesDescription,
  },
  hidden: {
    icon: GiSemiClosedEye,
    title: messages.card.traits.hiddenTitle,
    description: messages.card.traits.hiddenDescription,
  },
}
