import { CARD_BASES } from '@/constants/cardBases'
import {
  drawTopCard,
  getPlayer,
  updatePlayer,
} from '@/game-engine/initialization'
import type { CardBaseId, Duel, DuelAction, PlayerId } from '@/types'

type CardEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: number,
) => Duel

const cookEffect: CardEffect = (state, playerId) => {
  return drawTopCard(state, playerId)
}

const zombieEffect: CardEffect = (state, playerId) => {
  const player = getPlayer(state, playerId)

  const zombiesInDiscard = player.discard.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === 'zombie'
  })

  if (zombiesInDiscard.length === 0) return state

  const newCards = { ...state.cards }

  for (const id of zombiesInDiscard) {
    const card = newCards[id]
    if (!card) continue

    const base = CARD_BASES[card.baseId]
    newCards[id] = {
      ...card,
      strength: base.type === 'character' ? base.strength : card.strength,
    }
  }

  return {
    ...updatePlayer(state, playerId, {
      discard: player.discard.filter((id) => !zombiesInDiscard.includes(id)),
      board: [...player.board, ...zombiesInDiscard],
    }),
    cards: newCards,
  }
}

const noviceEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const playedStrength = playedCard.strength ?? 0

  const hasStrongerHammerite = player.board.some((id) => {
    if (id === cardInstanceId) return false

    const card = state.cards[id]
    if (!card) return false

    const base = CARD_BASES[card.baseId]
    return (
      base.categories.includes('Hammerite') &&
      (card.strength ?? 0) > playedStrength
    )
  })

  if (!hasStrongerHammerite) return state

  const noviceCopiesInHand = player.hand.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === ('novice' as CardBaseId)
  })

  const noviceCopiesInDeck = player.deck.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === ('novice' as CardBaseId)
  })

  const allCopiesToSummon = [...noviceCopiesInHand, ...noviceCopiesInDeck]

  if (allCopiesToSummon.length === 0) return state

  const newHand = player.hand.filter((id) => !noviceCopiesInHand.includes(id))
  const newDeck = player.deck.filter((id) => !noviceCopiesInDeck.includes(id))
  const newBoard = [...player.board, ...allCopiesToSummon]

  return updatePlayer(state, playerId, {
    hand: newHand,
    deck: newDeck,
    board: newBoard,
  })
}

const sachelmanEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const sachelmanStrength = playedCard.strength ?? 0
  const newCards = { ...state.cards }

  for (const id of player.board) {
    if (id === cardInstanceId) continue

    const card = newCards[id]
    if (!card || card.strength === undefined) continue

    const base = CARD_BASES[card.baseId]
    if (!base.categories.includes('Hammerite')) continue
    if (card.strength >= sachelmanStrength) continue

    newCards[id] = {
      ...card,
      strength: card.strength + 1,
    }
  }

  return { ...state, cards: newCards }
}

const onPlayEffects: Partial<Record<CardBaseId, CardEffect>> = {
  cook: cookEffect,
  zombie: zombieEffect,
  novice: noviceEffect,
  sachelman: sachelmanEffect,
}

const applyHauntReactiveEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: number,
): Duel => {
  const opponentId: PlayerId = playerId === 'player1' ? 'player2' : 'player1'
  const opponent = getPlayer(state, opponentId)

  const hauntCount = opponent.board.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === 'haunt'
  }).length

  if (hauntCount === 0) return state

  const playedCard = state.cards[cardInstanceId]
  if (!playedCard || playedCard.strength === undefined) return state

  const newStrength = playedCard.strength - hauntCount
  const newCards = { ...state.cards }

  if (newStrength <= 0) {
    newCards[cardInstanceId] = { ...playedCard, strength: 0 }
    const player = getPlayer(state, playerId)

    return {
      ...updatePlayer(state, playerId, {
        board: player.board.filter((id) => id !== cardInstanceId),
        discard: [...player.discard, cardInstanceId],
      }),
      cards: newCards,
    }
  }

  newCards[cardInstanceId] = { ...playedCard, strength: newStrength }
  return { ...state, cards: newCards }
}

const applyBurrickAttackEffect = (
  state: Duel,
  prevState: Duel,
  attackerId: number,
  defenderId: number,
): Duel => {
  const attacker = state.cards[attackerId]
  if (!attacker || attacker.baseId !== 'burrick') return state
  if (attacker.strength === undefined) return state

  const inactiveBoard = getPlayer(prevState, prevState.inactivePlayerId).board
  const defenderIndex = inactiveBoard.indexOf(defenderId)
  if (defenderIndex === -1) return state

  const adjacentIds: number[] = []

  if (defenderIndex > 0) {
    const leftId = inactiveBoard[defenderIndex - 1]
    if (leftId !== undefined) adjacentIds.push(leftId)
  }

  if (defenderIndex < inactiveBoard.length - 1) {
    const rightId = inactiveBoard[defenderIndex + 1]
    if (rightId !== undefined) adjacentIds.push(rightId)
  }

  let result = state
  const newCards = { ...result.cards }
  const attackStrength = attacker.strength

  for (const adjId of adjacentIds) {
    const adjCard = newCards[adjId]
    if (!adjCard || adjCard.strength === undefined) continue

    const adjNewStrength = adjCard.strength - attackStrength

    if (adjNewStrength <= 0) {
      newCards[adjId] = { ...adjCard, strength: 0 }
      const currentInactive = getPlayer(result, state.inactivePlayerId)
      result = updatePlayer(result, state.inactivePlayerId, {
        board: currentInactive.board.filter((id) => id !== adjId),
        discard: [...currentInactive.discard, adjId],
      })
    } else {
      newCards[adjId] = { ...adjCard, strength: adjNewStrength }
    }
  }

  const burrickStrength = attackStrength - 1

  if (burrickStrength <= 0) {
    newCards[attackerId] = { ...newCards[attackerId]!, strength: 0 }
    const activePlayer = getPlayer(result, state.activePlayerId)
    result = updatePlayer(result, state.activePlayerId, {
      board: activePlayer.board.filter((id) => id !== attackerId),
      discard: [...activePlayer.discard, attackerId],
    })
  } else {
    newCards[attackerId] = {
      ...newCards[attackerId]!,
      strength: burrickStrength,
    }
  }

  return { ...result, cards: newCards }
}

export function applyCardEffects(
  state: Duel,
  action: DuelAction,
  prevState: Duel,
): Duel {
  if (action.type === 'PLAY_CARD') {
    const { playerId, cardInstanceId } = action.payload
    const card = state.cards[cardInstanceId]
    if (!card) return state

    const effect = onPlayEffects[card.baseId]
    let result = effect ? effect(state, playerId, cardInstanceId) : state

    result = applyHauntReactiveEffect(result, playerId, cardInstanceId)

    return result
  }

  if (action.type === 'ATTACK_CARD') {
    const { attackerId, defenderId } = action.payload
    return applyBurrickAttackEffect(state, prevState, attackerId, defenderId)
  }

  return state
}
