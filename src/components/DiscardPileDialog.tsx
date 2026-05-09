import { useEffect, useRef } from 'react'

import { Button } from 'src/components/Button'
import { Card } from 'src/components/Card'
import type { CardInstance } from 'src/game-engine'

export interface DiscardPileDialogProps {
  isOpen: boolean
  cards: CardInstance[]
  title: string
  closeLabel: string
  noValidTargetsLabel: string
  isCardSelectable: (card: CardInstance) => boolean
  onSelectCard: (cardId: string) => void
  onClose: () => void
}

export const DiscardPileDialog: React.FC<DiscardPileDialogProps> = ({
  isOpen,
  cards,
  title,
  closeLabel,
  noValidTargetsLabel,
  isCardSelectable,
  onSelectCard,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal()
        } else {
          dialog.setAttribute('open', 'true')
        }
      }
      return
    }

    if (dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const hasSelectableCards = cards.some((card) => isCardSelectable(card))

  return (
    <dialog
      ref={dialogRef}
      className="m-auto rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 p-4 w-[min(960px,95vw)]"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      data-testid="discard-pile-dialog"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button isSecondary onClick={onClose}>
          {closeLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[70vh] overflow-auto pr-1">
        {cards.map((card) => {
          const selectable = isCardSelectable(card)

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectCard(card.id)}
              disabled={!selectable}
              className={selectable ? '' : 'opacity-60 cursor-not-allowed'}
              aria-label={`select-discard-card-${card.id}`}
            >
              <Card card={card} isOnBoard isClickable={selectable} />
            </button>
          )
        })}
      </div>

      {!hasSelectableCards && (
        <p className="mt-3 text-sm text-neutral-300">{noValidTargetsLabel}</p>
      )}
    </dialog>
  )
}
