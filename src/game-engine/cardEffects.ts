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

const mysticsSoulEffect: CardEffect = (state, playerId) => {
  const player = getPlayer(state, playerId)
  const newCards = { ...state.cards }

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.counter === undefined) continue

    newCards[id] = {
      ...card,
      counter: card.counter + 1,
    }
  }

  return { ...state, cards: newCards }
}

const templeGuardEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const opponentId: PlayerId = playerId === 'player1' ? 'player2' : 'player1'
  const opponent = getPlayer(state, opponentId)

  if (opponent.board.length <= player.board.length) return state

  const card = state.cards[cardInstanceId]
  if (!card || card.strength === undefined) return state

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardInstanceId]: { ...card, strength: card.strength + 1 },
    },
  }
}

const yoraSkullEffect: CardEffect = (state, playerId) => {
  const player = getPlayer(state, playerId)
  const newCards = { ...state.cards }

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.strength === undefined) continue

    const base = CARD_BASES[card.baseId]
    if (!base.categories.includes('Hammerite')) continue

    newCards[id] = { ...card, strength: card.strength + 1 }
  }

  return { ...state, cards: newCards }
}

const onPlayEffects: Partial<Record<CardBaseId, CardEffect>> = {
  cook: cookEffect,
  zombie: zombieEffect,
  novice: noviceEffect,
  sachelman: sachelmanEffect,
  mysticsSoul: mysticsSoulEffect,
  templeGuard: templeGuardEffect,
  yoraSkull: yoraSkullEffect,
}

const applyHauntReactiveEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: number,
): Duel => {
  const opponentId: PlayerId = playerId === 'player1' ? 'player2' : 'player1'
  const opponent = getPlayer(state, opponentId)

  const hauntsWithCounter = opponent.board.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === 'haunt' && (card.counter ?? 0) > 0
  })

  if (hauntsWithCounter.length === 0) return state

  const playedCard = state.cards[cardInstanceId]
  if (!playedCard || playedCard.strength === undefined) return state

  const newCards = { ...state.cards }

  for (const hauntId of hauntsWithCounter) {
    const hauntCard = newCards[hauntId]
    if (!hauntCard) continue

    newCards[hauntId] = {
      ...hauntCard,
      counter: Math.max(0, (hauntCard.counter ?? 0) - 1),
    }
  }

  const damage = hauntsWithCounter.length
  const newStrength = playedCard.strength - damage

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
  if ((attacker.counter ?? 0) <= 0) return state

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

  const currentAttacker = newCards[attackerId]!
  const burrickStrength = attackStrength - 1
  const newCounter = Math.max(0, (currentAttacker.counter ?? 0) - 1)

  if (burrickStrength <= 0) {
    newCards[attackerId] = {
      ...currentAttacker,
      strength: 0,
      counter: newCounter,
    }
    const activePlayer = getPlayer(result, state.activePlayerId)
    result = updatePlayer(result, state.activePlayerId, {
      board: activePlayer.board.filter((id) => id !== attackerId),
      discard: [...activePlayer.discard, attackerId],
    })
  } else {
    newCards[attackerId] = {
      ...currentAttacker,
      strength: burrickStrength,
      counter: newCounter,
    }
  }

  return { ...result, cards: newCards }
}

const applyTempleGuardRetaliationEffect = (
  state: Duel,
  attackerId: number,
  defenderId: number,
): Duel => {
  const defender = state.cards[defenderId]
  if (!defender || defender.baseId !== 'templeGuard') return state
  if (defender.strength === undefined || defender.strength <= 0) return state

  const attacker = state.cards[attackerId]
  if (!attacker || attacker.strength === undefined) return state

  const newCards = { ...state.cards }
  const attackerNewStrength = attacker.strength - defender.strength

  if (attackerNewStrength <= 0) {
    newCards[attackerId] = { ...attacker, strength: 0 }
    const activePlayer = getPlayer(state, state.activePlayerId)
    return {
      ...updatePlayer(state, state.activePlayerId, {
        board: activePlayer.board.filter((id) => id !== attackerId),
        discard: [...activePlayer.discard, attackerId],
      }),
      cards: newCards,
    }
  }

  newCards[attackerId] = { ...attacker, strength: attackerNewStrength }
  return { ...state, cards: newCards }
}

const applyMarkanderReactiveEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: number,
): Duel => {
  const playedCard = state.cards[cardInstanceId]
  if (!playedCard) return state

  const base = CARD_BASES[playedCard.baseId]
  if (!base.categories.includes('Hammerite')) return state

  const player = getPlayer(state, playerId)
  const markanderIds = [...player.hand, ...player.deck].filter((id) => {
    const card = state.cards[id]
    return card?.baseId === 'highPriestMarkander'
  })

  if (markanderIds.length === 0) return state

  const newCards = { ...state.cards }
  const idsToSummon: number[] = []

  for (const id of markanderIds) {
    const card = newCards[id]
    if (!card) continue

    const newCounter = Math.max(0, (card.counter ?? 0) - 1)
    newCards[id] = { ...card, counter: newCounter }

    if (newCounter <= 0) {
      idsToSummon.push(id)
    }
  }

  let result: Duel = { ...state, cards: newCards }

  if (idsToSummon.length > 0) {
    const currentPlayer = getPlayer(result, playerId)
    result = updatePlayer(result, playerId, {
      hand: currentPlayer.hand.filter((id) => !idsToSummon.includes(id)),
      deck: currentPlayer.deck.filter((id) => !idsToSummon.includes(id)),
      board: [...currentPlayer.board, ...idsToSummon],
    })
  }

  return result
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
    result = applyMarkanderReactiveEffect(result, playerId, cardInstanceId)

    return result
  }

  if (action.type === 'ATTACK_CARD') {
    const { attackerId, defenderId } = action.payload
    let result = applyBurrickAttackEffect(
      state,
      prevState,
      attackerId,
      defenderId,
    )
    result = applyTempleGuardRetaliationEffect(result, attackerId, defenderId)
    return result
  }

  return state
}
