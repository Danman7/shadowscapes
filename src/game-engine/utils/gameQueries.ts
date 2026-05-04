import type {
  CardInstance,
  Duel,
  DuelCards,
  DuelPlayerOrder,
  PendingInstant,
  PlayerId,
} from 'src/game-engine/types'

export const getOpponentId = (
  playerOrder: DuelPlayerOrder,
  playerId: PlayerId,
): PlayerId => (playerOrder[0] === playerId ? playerOrder[1] : playerOrder[0])

export const getCardsInStack = (
  stack: string[],
  cards: DuelCards,
  predicate: (card: CardInstance) => boolean,
): string[] =>
  stack.filter((id) => {
    const card = cards[id]
    return card !== undefined && predicate(card)
  })

export const hasCardInStack = (
  stack: string[],
  cards: DuelCards,
  predicate: (card: CardInstance) => boolean,
): boolean =>
  stack.some((id) => {
    const card = cards[id]
    return card !== undefined && predicate(card)
  })

export const getPendingInstant = (
  card: CardInstance,
  hand: string[],
  state: Readonly<Duel>,
): PendingInstant | null => {
  if (
    card.base.id === 'speedPotion' &&
    hasCardInStack(hand, state.cards, (stackCard) => {
      return stackCard.base.type === 'Character'
    })
  )
    return 'SPEED_POTION'
  if (
    card.base.id === 'flashBomb' &&
    Object.values(state.players).some((player) => {
      return hasCardInStack(player.board, state.cards, () => true)
    })
  )
    return 'FLASH_BOMB'
  return null
}
