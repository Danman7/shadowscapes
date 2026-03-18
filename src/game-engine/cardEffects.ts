import { CARD_BASES } from 'src/constants/cardBases'
import {
  drawTopCard,
  getOpponentId,
  getPlayer,
  updatePlayer,
} from 'src/game-engine/initialization'
import { formatNoun } from 'src/game-engine/utils'
import type { CardBaseId, Duel, DuelAction, PlayerId } from 'src/types'
import * as balancing from 'src/constants/balancing'

type CardEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: number,
) => Duel

const cookEffect: CardEffect = (state, playerId) => {
  const stateAfterDraw = drawTopCard(state, playerId)
  const playerAfterDraw = getPlayer(stateAfterDraw, playerId)

  return {
    ...stateAfterDraw,
    logs: [
      ...state.logs,
      `${playerAfterDraw.name} draw another card because of Cook. They have ${formatNoun(
        playerAfterDraw.hand.length,
        'card',
      )} in hand and ${formatNoun(
        playerAfterDraw.deck.length,
        'card',
      )} left in deck.`,
    ],
  }
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
      life: base.type === 'character' ? base.life : card.life,
    }
  }

  return {
    ...updatePlayer(state, playerId, {
      discard: player.discard.filter((id) => !zombiesInDiscard.includes(id)),
      board: [...player.board, ...zombiesInDiscard],
    }),
    cards: newCards,
    logs: [
      ...state.logs,
      `${player.name} resurrects another ${formatNoun(zombiesInDiscard.length, 'Zombie')} from their discard.`,
    ],
  }
}

const noviceEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const playedLife = playedCard.life ?? 0

  const hasStrongerHammerite = player.board.some((id) => {
    if (id === cardInstanceId) return false

    const card = state.cards[id]
    if (!card) return false

    const base = CARD_BASES[card.baseId]
    return (
      base.categories.includes('Hammerite') && (card.life ?? 0) > playedLife
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

  return {
    ...updatePlayer(state, playerId, {
      hand: newHand,
      deck: newDeck,
      board: newBoard,
    }),
    logs: [
      ...state.logs,
      `${player.name} summons ${formatNoun(
        allCopiesToSummon.length,
        'Novice',
      )} in addition because they have a stronger Hammerite on board.`,
    ],
  }
}

const sachelmanEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const sachelmanLife = playedCard.life ?? 0
  const newCards = { ...state.cards }
  let weakerHammeritesCount = 0

  for (const id of player.board) {
    if (id === cardInstanceId) continue

    const card = newCards[id]
    if (!card || card.life === undefined) continue

    const base = CARD_BASES[card.baseId]
    if (!base.categories.includes('Hammerite')) continue
    if (card.life >= sachelmanLife) continue

    newCards[id] = {
      ...card,
      life: card.life + balancing.SACHELMAN_BUFF_ON_PLAY,
    }
    weakerHammeritesCount++
  }

  return {
    ...state,
    cards: newCards,
    logs: [
      ...state.logs,
      `Brother Sachelman gives ${balancing.SACHELMAN_BUFF_ON_PLAY} life to ${formatNoun(weakerHammeritesCount, 'hammerite')} on board.`,
    ],
  }
}

const mysticsSoulEffect: CardEffect = (state, playerId) => {
  const player = getPlayer(state, playerId)
  const newCards = { ...state.cards }

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.charges === undefined) continue

    newCards[id] = {
      ...card,
      charges: card.charges + balancing.MYSTICS_SOUL_BONUS_CHARGES,
    }
  }

  return { ...state, cards: newCards }
}

const templeGuardEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = getPlayer(state, playerId)
  const opponentId = getOpponentId(state, playerId)
  const opponent = getPlayer(state, opponentId)

  if (opponent.board.length <= player.board.length) return state

  const card = state.cards[cardInstanceId]
  if (!card || card.life === undefined) return state

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardInstanceId]: {
        ...card,
        life: card.life + balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS,
      },
    },
    logs: [
      ...state.logs,
      `Temple Guard gains ${balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS} life because ${opponent.name} controls more cards on board.`,
    ],
  }
}

const yoraSkullEffect: CardEffect = (state, playerId) => {
  const player = getPlayer(state, playerId)
  const newCards = { ...state.cards }
  let boostedCardsCount = 0

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.life === undefined) continue

    const base = CARD_BASES[card.baseId]
    if (!base.categories.includes('Hammerite')) continue

    newCards[id] = {
      ...card,
      life: card.life + balancing.YORA_SKULL_BUFF_ON_PLAY,
    }
    boostedCardsCount++
  }

  return {
    ...state,
    cards: newCards,
    logs: [
      ...state.logs,
      `Yora Skull gives ${balancing.YORA_SKULL_BUFF_ON_PLAY} life to ${formatNoun(boostedCardsCount, 'hammerite')} on board.`,
    ],
  }
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
  const opponentId = getOpponentId(state, playerId)
  const opponent = getPlayer(state, opponentId)

  const hauntsWithCharges = opponent.board.filter((id) => {
    const card = state.cards[id]
    return card?.baseId === 'haunt' && (card.charges ?? 0) > 0
  })

  if (hauntsWithCharges.length === 0) return state

  const playedCard = state.cards[cardInstanceId]
  if (!playedCard || playedCard.life === undefined) return state

  const newCards = { ...state.cards }

  for (const hauntId of hauntsWithCharges) {
    const hauntCard = newCards[hauntId]
    if (!hauntCard) continue

    newCards[hauntId] = {
      ...hauntCard,
      charges: Math.max(0, (hauntCard.charges ?? 0) - 1),
    }
  }

  const damage = hauntsWithCharges.reduce((total, hauntId) => {
    const hauntCard = newCards[hauntId]
    return total + (hauntCard?.strength ?? 0)
  }, 0)
  const newLife = playedCard.life - damage

  if (newLife <= 0) {
    newCards[cardInstanceId] = { ...playedCard, life: 0 }
    const player = getPlayer(state, playerId)

    return {
      ...updatePlayer(state, playerId, {
        board: player.board.filter((id) => id !== cardInstanceId),
        discard: [...player.discard, cardInstanceId],
      }),
      cards: newCards,
      logs: [
        ...state.logs,
        `${formatNoun(hauntsWithCharges.length, 'Haunt')} reacts and defeats ${CARD_BASES[playedCard.baseId].name}.`,
      ],
    }
  }

  newCards[cardInstanceId] = { ...playedCard, life: newLife }
  return {
    ...state,
    cards: newCards,
    logs: [
      ...state.logs,
      `${formatNoun(hauntsWithCharges.length, 'Haunt')} reacts. ${CARD_BASES[playedCard.baseId].name} loses ${damage} life.`,
    ],
  }
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
  if ((attacker.charges ?? 0) <= 0) return state

  const inactiveBoard = getPlayer(prevState, prevState.playerOrder[1]).board
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
  const attackDamage = attacker.strength
  let affectedAdjacentCount = 0

  for (const adjId of adjacentIds) {
    const adjCard = newCards[adjId]
    if (!adjCard || adjCard.life === undefined) continue
    affectedAdjacentCount++

    const adjNewLife = adjCard.life - attackDamage

    if (adjNewLife <= 0) {
      newCards[adjId] = { ...adjCard, life: 0 }
      const currentInactive = getPlayer(result, state.playerOrder[1])
      result = updatePlayer(result, state.playerOrder[1], {
        board: currentInactive.board.filter((id) => id !== adjId),
        discard: [...currentInactive.discard, adjId],
      })
    } else {
      newCards[adjId] = { ...adjCard, life: adjNewLife }
    }
  }

  const currentAttacker = newCards[attackerId]!
  const newCharges = Math.max(0, (currentAttacker.charges ?? 0) - 1)
  const attackerName = CARD_BASES[currentAttacker.baseId].name
  let burrickLog: string

  newCards[attackerId] = {
    ...currentAttacker,
    charges: newCharges,
  }

  burrickLog = `${attackerName} splashes ${formatNoun(
    affectedAdjacentCount,
    'adjacent card',
  )} for ${formatNoun(attackDamage, 'damage')} loosing a charge.`

  return {
    ...result,
    cards: newCards,
    logs: [...result.logs, burrickLog],
  }
}

const applyTempleGuardRetaliationEffect = (
  state: Duel,
  attackerId: number,
  defenderId: number,
): Duel => {
  const defender = state.cards[defenderId]
  if (!defender || defender.baseId !== 'templeGuard') return state
  if (defender.life === undefined || defender.life <= 0) return state

  const attacker = state.cards[attackerId]
  if (!attacker || attacker.life === undefined) return state
  if (defender.strength === undefined) return state

  const newCards = { ...state.cards }
  const attackerNewLife = attacker.life - defender.strength
  const attackerName = CARD_BASES[attacker.baseId].name

  if (attackerNewLife <= 0) {
    newCards[attackerId] = { ...attacker, life: 0 }
    const activePlayer = getPlayer(state, state.playerOrder[0])
    return {
      ...updatePlayer(state, state.playerOrder[0], {
        board: activePlayer.board.filter((id) => id !== attackerId),
        discard: [...activePlayer.discard, attackerId],
      }),
      cards: newCards,
      logs: [
        ...state.logs,
        `Temple Guard retaliates for ${formatNoun(
          defender.strength,
          'damage',
        )} and defeats ${attackerName}.`,
      ],
    }
  }

  newCards[attackerId] = { ...attacker, life: attackerNewLife }
  return {
    ...state,
    cards: newCards,
    logs: [
      ...state.logs,
      `Temple Guard retaliates for ${formatNoun(
        defender.strength,
        'damage',
      )}. ${attackerName} has ${formatNoun(attackerNewLife, 'life')} left.`,
    ],
  }
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

    const newCharges = Math.max(0, (card.charges ?? 0) - 1)
    newCards[id] = { ...card, charges: newCharges }

    if (newCharges <= 0) {
      idsToSummon.push(id)
    }
  }

  let result: Duel = { ...state, cards: newCards }

  if (idsToSummon.length > 0) {
    const currentPlayer = getPlayer(result, playerId)
    result = {
      ...updatePlayer(result, playerId, {
        hand: currentPlayer.hand.filter((id) => !idsToSummon.includes(id)),
        deck: currentPlayer.deck.filter((id) => !idsToSummon.includes(id)),
        board: [...currentPlayer.board, ...idsToSummon],
      }),
      logs: [
        ...state.logs,
        'Enough Hammerites were played for High Priest Markander to be summoned.',
      ],
    }
  }

  return result
}

const applyPriestDefeatRewardEffect = (state: Duel, prevState: Duel): Duel => {
  let result = state

  for (const playerId of state.playerOrder) {
    const prevPlayer = getPlayer(prevState, playerId)
    const currentPlayer = getPlayer(result, playerId)

    const newlyDiscardedCharacterCards = currentPlayer.discard.filter((id) => {
      if (prevPlayer.discard.includes(id)) return false

      const card = result.cards[id]
      if (!card) return false

      return CARD_BASES[card.baseId].type === 'character'
    })

    if (newlyDiscardedCharacterCards.length === 0) continue

    const priestsOnBoard = currentPlayer.board.filter((id) => {
      const card = result.cards[id]
      return card?.baseId === 'priest'
    }).length

    if (priestsOnBoard === 0) continue

    const gainedCoins =
      priestsOnBoard *
      newlyDiscardedCharacterCards.length *
      balancing.PRIEST_COINS_GAINED

    result = {
      ...updatePlayer(result, playerId, {
        coins: currentPlayer.coins + gainedCoins,
      }),
      logs: [
        ...result.logs,
        `${currentPlayer.name}'s ${formatNoun(
          priestsOnBoard,
          'Priest',
        )} grants ${formatNoun(gainedCoins)} because ${formatNoun(
          newlyDiscardedCharacterCards.length,
          'allied character',
        )} was defeated.`,
      ],
    }
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
    result = applyPriestDefeatRewardEffect(result, prevState)

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
    result = applyPriestDefeatRewardEffect(result, prevState)
    return result
  }

  return state
}
