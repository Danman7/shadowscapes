import type { CardInstanceId, DuelState, PlayerId } from '../types'
import { DEFAULT_CHARACTER_STRENGTH } from '../constants'
import { canCharacterAttack } from './actPhase/canCharacterAttack'
import { getAdjacentBoardCardIds } from './cardInstance/getAdjacentBoardCardIds'
import { isCharacterInstance } from './cardInstance/isCharacterInstance'
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

const hasTwoAdjacentCharacters = (
  state: DuelState,
  cardInstanceId: CardInstanceId,
): boolean => {
  const card = state.cards[cardInstanceId]
  const adjacentCardIds = getAdjacentBoardCardIds(state, cardInstanceId)

  return (
    isCharacterInstance(card) &&
    adjacentCardIds.length === 2 &&
    adjacentCardIds.every((adjacentCardId) =>
      isCharacterInstance(state.cards[adjacentCardId]),
    )
  )
}

const getFirstNonEmptyTier = <TItem>(
  tiers: readonly (readonly TItem[])[],
): TItem[] => {
  const tier = tiers.find((items) => items.length > 0)

  return tier ? [...tier] : []
}

export const getPreferredRandomAiPlayableCardIds = (
  state: DuelState,
  playerId: PlayerId,
): CardInstanceId[] => {
  const playableCardIds = getRandomAiPlayableCardIds(state, playerId)
  const player = state.players[playerId]
  const opponentId = getOpponentPlayerId(state, playerId)
  const opponent = opponentId ? state.players[opponentId] : undefined

  if (!player) return playableCardIds

  const nonMarkanderCardIds = playableCardIds.filter(
    (cardId) => state.cards[cardId]?.baseId !== 'markander',
  )
  const markanderCardIds = playableCardIds.filter(
    (cardId) => state.cards[cardId]?.baseId === 'markander',
  )

  if (!opponent) {
    return getFirstNonEmptyTier([nonMarkanderCardIds, markanderCardIds])
  }

  const hasYoraTripleTarget =
    opponent.board.length > player.board.length &&
    player.board.some((cardId) =>
      hasTwoAdjacentCharacters(state, cardId),
    )
  const hasDiscardedZombie = player.discard.some((cardId) => {
    const card = state.cards[cardId]

    return isCharacterInstance(card) && card.baseId === 'zombie'
  })
  const hasBurrickTripleTarget = opponent.board.some((cardId) =>
    hasTwoAdjacentCharacters(state, cardId),
  )

  return getFirstNonEmptyTier([
    playableCardIds.filter(
      (cardId) =>
        state.cards[cardId]?.baseId === 'yoraSkull' && hasYoraTripleTarget,
    ),
    playableCardIds.filter(
      (cardId) =>
        state.cards[cardId]?.baseId === 'bookOfAsh' && hasDiscardedZombie,
    ),
    playableCardIds.filter(
      (cardId) =>
        state.cards[cardId]?.baseId === 'burrick' && hasBurrickTripleTarget,
    ),
    playableCardIds.filter((cardId) =>
      isCharacterInstance(state.cards[cardId]) &&
      state.cards[cardId]?.baseId !== 'markander',
    ),
    nonMarkanderCardIds,
    markanderCardIds,
  ])
}

export const getPreferredRandomAiEffectTargetIds = (
  state: DuelState,
): CardInstanceId[] => {
  const targetCardIds = getRandomAiEffectTargetIds(state)
  const pendingCard = state.pendingPlayedCardId
    ? state.cards[state.pendingPlayedCardId]
    : undefined

  if (!pendingCard) return targetCardIds

  if (
    pendingCard.baseId === 'speedPotion' ||
    pendingCard.baseId === 'flashBomb'
  ) {
    const strongTargetIds = targetCardIds.filter((cardId) => {
      const card = state.cards[cardId]

      return (
        isCharacterInstance(card) &&
        card.strength > DEFAULT_CHARACTER_STRENGTH
      )
    })

    if (strongTargetIds.length > 0) return strongTargetIds

    if (pendingCard.baseId === 'speedPotion') {
      const burrickTargetIds = targetCardIds.filter(
        (cardId) => state.cards[cardId]?.baseId === 'burrick',
      )

      if (burrickTargetIds.length > 0) return burrickTargetIds
    }
  }

  if (pendingCard.baseId === 'yoraSkull') {
    const player = state.players[pendingCard.ownerId]
    const opponentId = getOpponentPlayerId(state, pendingCard.ownerId)
    const opponent = opponentId ? state.players[opponentId] : undefined
    const interiorTargetIds = targetCardIds.filter((cardId) =>
      hasTwoAdjacentCharacters(state, cardId),
    )

    if (
      player &&
      opponent &&
      opponent.board.length > player.board.length - 1 &&
      interiorTargetIds.length > 0
    ) {
      return interiorTargetIds
    }
  }

  if (pendingCard.baseId === 'bookOfAsh') {
    const zombieTargetIds = targetCardIds.filter(
      (cardId) => state.cards[cardId]?.baseId === 'zombie',
    )

    if (zombieTargetIds.length > 0) return zombieTargetIds
  }

  return targetCardIds
}

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

export const getPreferredRandomAiAttackPairs = (
  state: DuelState,
  playerId: PlayerId,
): RandomAiAttackPair[] => {
  const attackPairs = getRandomAiAttackPairs(state, playerId)
  const isLethal = ({ attackerId, defenderId }: RandomAiAttackPair) => {
    const attacker = state.cards[attackerId]
    const defender = state.cards[defenderId]

    return (
      isCharacterInstance(attacker) &&
      isCharacterInstance(defender) &&
      attacker.strength >= defender.life
    )
  }
  const burrickSplashPairs = attackPairs.filter(
    ({ attackerId, defenderId }) => {
      const attacker = state.cards[attackerId]

      return (
        isCharacterInstance(attacker) &&
        attacker.baseId === 'burrick' &&
        (attacker.traits.charges ?? 0) > 0 &&
        hasTwoAdjacentCharacters(state, defenderId)
      )
    },
  )
  const lethalBurrickSplashPairs = burrickSplashPairs.filter(isLethal)

  return getFirstNonEmptyTier([
    lethalBurrickSplashPairs,
    burrickSplashPairs,
    attackPairs.filter(isLethal),
    attackPairs,
  ])
}
