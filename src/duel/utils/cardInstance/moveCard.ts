import { getCardBase, isCharacter } from '../../../cards'
import { DEFAULT_CHARACTER_STRENGTH } from '../../constants'
import type {
  CardInstance,
  CardInstanceId,
  CharacterCardInstance,
  DuelState,
  PlayerId,
  Stack,
} from '../../types'
import { applyBoardEntryStun } from './applyBoardEntryStun'
import { isCharacterInstance } from './isCharacterInstance'

interface MoveCardOptions {
  state: DuelState
  playerId: PlayerId
  from: Stack
  to: Stack
  amount?: number
  cardId?: CardInstanceId
}

const canMoveToStack = (card: CardInstance, stack: Stack): boolean => {
  if (stack !== 'discard' || !isCharacterInstance(card)) return true

  return isCharacter(getCardBase(card.baseId))
}

const updateCharacterForStack = (
  card: CharacterCardInstance,
  stack: Stack,
) => {
  if (stack === 'board') {
    applyBoardEntryStun(card)
    card.didAct = false
    return
  }

  if (stack !== 'discard') return

  const base = getCardBase(card.baseId)

  if (!isCharacter(base)) return

  card.cost = base.cost
  card.life = base.life
  card.strength = base.strength ?? DEFAULT_CHARACTER_STRENGTH
  card.traits = { ...base.traits }
  card.didAct = false
}

export const moveCard = ({
  state,
  playerId,
  from,
  to,
  amount = 1,
  cardId,
}: MoveCardOptions): CardInstanceId[] => {
  const player = state.players[playerId]

  if (!player || from === to) return []

  const source = player[from]
  const cardIds = cardId ? [cardId] : source.slice(0, amount)
  const movableCardIds = cardIds.filter((id) => {
    const card = state.cards[id]

    return Boolean(
      card &&
        card.ownerId === playerId &&
        card.stack === from &&
        source.includes(id) &&
        canMoveToStack(card, to),
    )
  })

  movableCardIds.forEach((id) => {
    const card = state.cards[id]
    const sourceIndex = source.indexOf(id)

    source.splice(sourceIndex, 1)
    player[to].push(id)
    card.stack = to

    if (isCharacterInstance(card)) updateCharacterForStack(card, to)
  })

  return movableCardIds
}
