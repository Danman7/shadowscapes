import { useEffect, useRef } from 'react'
import { IoMdClose } from 'react-icons/io'

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
      className="box m-auto w-[min(760px,calc(100vw-2rem))] max-h-[min(80vh,720px)] p-3 text-foreground shadow-xl animate-fade-in-scale backdrop:bg-background/70"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      data-testid="discard-pile-dialog"
    >
      <div className="relative font-bold py-1 pr-8">
        <h2>{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-1 cursor-pointer text-2xl leading-none hover:text-primary"
          aria-label={closeLabel}
        >
          <IoMdClose />
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(13.75rem,13.75rem))] justify-start gap-2 max-h-[min(62vh,36rem)] overflow-auto pt-2">
        {cards.map((card) => {
          const selectable = isCardSelectable(card)

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectCard(card.id)}
              disabled={!selectable}
              className={`w-55 rounded-2xl text-left transition-opacity ${
                selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              aria-label={`select-discard-card-${card.id}`}
            >
              <Card card={card} isOnBoard isClickable={selectable} />
            </button>
          )
        })}
      </div>

      {!hasSelectableCards && (
        <p className="mt-3 text-sm text-foreground/70">{noValidTargetsLabel}</p>
      )}
    </dialog>
  )
}
