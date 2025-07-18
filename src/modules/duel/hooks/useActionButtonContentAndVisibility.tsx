import { GiCardDiscard } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'

export const useActionButtonContentAndVisibility = () => {
  let buttonContent: React.ReactNode = ''
  let isButtonVisible = false

  const {
    state: { phase },
  } = useDuel()

  switch (phase) {
    case 'Redrawing':
      buttonContent = (
        <>
          <GiCardDiscard /> {messages.duel.skipRedraw}
        </>
      )
      isButtonVisible = true
      break

    default:
      break
  }

  return { isButtonVisible, buttonContent }
}
