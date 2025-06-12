import { GiBackForth } from 'react-icons/gi'
import { ImEyeBlocked } from 'react-icons/im'

import { messages } from 'src/i18n/indext'
import { CharacterTrait, TraitInfo } from 'src/modules/cards/types'

export const traitInfoMap: Record<CharacterTrait, TraitInfo> = {
  retaliates: {
    icon: GiBackForth,
    title: messages.card.traits.retaliatesTitle,
    description: messages.card.traits.retaliatesDescription,
  },
  hidden: {
    icon: ImEyeBlocked,
    title: messages.card.traits.hiddenTitle,
    description: messages.card.traits.hiddenDescription,
  },
}
