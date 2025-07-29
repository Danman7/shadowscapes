import { AnimatePresence } from 'motion/react'

import { FullScreenLoader } from 'src/components/FullScreenLoader'
import { messages } from 'src/i18n'
import { DuelContent } from 'src/modules/duel/components/Board/DuelContent'
import { useDrawInitialCards } from 'src/modules/duel/hooks/useDrawInitialCards'
import { useIntroScreenTimer } from 'src/modules/duel/hooks/useIntroScreenTimer'
import { useStartFirstTurn } from 'src/modules/duel/hooks/useStartFirstTurn'
import { useStartRedraw } from 'src/modules/duel/hooks/useStartRedraw'
import { useUser } from 'src/modules/user/hooks'

export const Board: React.FC = () => {
  const {
    state: { isUserLoaded },
  } = useUser()

  useIntroScreenTimer()

  useDrawInitialCards()

  useStartRedraw()

  useStartFirstTurn()

  return (
    <AnimatePresence>
      {isUserLoaded ? (
        <DuelContent />
      ) : (
        <FullScreenLoader message={messages.user.loadingUser} />
      )}
    </AnimatePresence>
  )
}
