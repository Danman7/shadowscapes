import { DiscardPileDialog } from 'src/components'
import { useGameDispatch } from 'src/contexts'
import type { CardInstance, PendingInstant } from 'src/game-engine'
import { applyBookOfAsh, setPendingInstant } from 'src/game-engine/duel'
import { messages } from 'src/i18n'

const isBookOfAshSelectable = (card: CardInstance): boolean => {
  return card.base.isElite !== true
}

export const DiscardTargetDialog: React.FC<{
  cards: CardInstance[]
  pendingInstant: PendingInstant | null
}> = ({ cards, pendingInstant }) => {
  const dispatch = useGameDispatch()
  const isBookOfAshPending = pendingInstant === 'BOOK_OF_ASH'

  const onCloseDiscardDialog = (): void => {
    dispatch(setPendingInstant({ pendingInstant: null }))
  }

  const onSelectDiscardCard = (cardId: string): void => {
    if (!isBookOfAshPending) return

    const card = cards.find((discardCard) => discardCard.id === cardId)
    if (!card || !isBookOfAshSelectable(card)) return

    dispatch(applyBookOfAsh({ targetCardInstanceId: cardId }))
  }

  return (
    <DiscardPileDialog
      isOpen={isBookOfAshPending}
      cards={cards}
      title={messages.cards.bookOfAsh.name}
      closeLabel={messages.ui.close}
      noValidTargetsLabel={messages.ui.noValidTargets}
      isCardSelectable={isBookOfAshSelectable}
      onSelectCard={onSelectDiscardCard}
      onClose={onCloseDiscardDialog}
    />
  )
}
