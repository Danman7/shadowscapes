import type { CardInstanceId, DuelState, PlayerId } from '../types'
import { canCharacterAttack } from './actPhase/canCharacterAttack'
import { canCardBeEffectTarget } from './playPhase/cardEffectTarget'
import { canCardBePlayed } from './playPhase/canCardBePlayed'
import { getOpponentPlayerId } from './duelMode'

export interface RandomAiAttackPair {
  attackerId: CardInstanceId
  defenderId: CardInstanceId
}

export const selectRandomItem = <TItem>(
  items: readonly TItem[],
): TItem | undefined => {
  if (items.length === 0) return undefined

  const index = Math.min(
    items.length - 1,
    Math.floor(Math.random() * items.length),
  )

  return items[index]
}

export const getRandomAiPlayableCardIds = (
  state: DuelState,
  playerId: PlayerId,
): CardInstanceId[] => {
  const player = state.players[playerId]

  if (!player) return []

  return player.hand.filter((cardInstanceId) => {
    const card = state.cards[cardInstanceId]

    return Boolean(
      card &&
        canCardBePlayed({
          state,
          playerId,
          cardInstanceId,
          cardBaseId: card.baseId,
        }),
    )
  })
}

export const getRandomAiEffectTargetIds = (
  state: DuelState,
): CardInstanceId[] =>
  Object.keys(state.cards).filter((cardInstanceId) =>
    canCardBeEffectTarget(state, cardInstanceId),
  )

export const getRandomAiAttackPairs = (
  state: DuelState,
  playerId: PlayerId,
): RandomAiAttackPair[] => {
  if (state.phase !== 'act' || state.actPlayerId !== playerId) return []

  const player = state.players[playerId]
  const opponentId = getOpponentPlayerId(state, playerId)
  const opponent = opponentId ? state.players[opponentId] : undefined

  if (!player || !opponent) return []

  return player.board.flatMap((attackerId) =>
    opponent.board.flatMap((defenderId) =>
      canCharacterAttack(state, { attackerId, defenderId })
        ? [{ attackerId, defenderId }]
        : [],
    ),
  )
}

export const shouldRandomAiPassPlayTurn = (
  state: DuelState,
  playerId: PlayerId,
): boolean => {
  const player = state.players[playerId]
  const opponentId = getOpponentPlayerId(state, playerId)
  const opponent = opponentId ? state.players[opponentId] : undefined

  if (!player || !opponent) return false

  return player.board.length - opponent.board.length >= 3
}
