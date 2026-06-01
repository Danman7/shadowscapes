export type CardShellFeedback = 'damage' | 'life-boost'

export interface CardFeedbackSnapshot {
  cardId: string
  charges?: number
  life?: number
}

export interface CardFeedbackEvents {
  chargesChanged: boolean
  shellFeedback?: CardShellFeedback
}

export const getCardFeedbackEvents = (
  previous: CardFeedbackSnapshot,
  current: CardFeedbackSnapshot,
): CardFeedbackEvents => {
  if (previous.cardId !== current.cardId) {
    return { chargesChanged: false }
  }

  let shellFeedback: CardShellFeedback | undefined

  if (
    previous.life !== undefined &&
    current.life !== undefined &&
    previous.life !== current.life
  ) {
    shellFeedback = current.life < previous.life ? 'damage' : 'life-boost'
  }

  return {
    shellFeedback,
    chargesChanged: previous.charges !== current.charges,
  }
}
