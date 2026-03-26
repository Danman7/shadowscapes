import { balancing } from 'src/game-engine/constants'
import {
  addLogEntry,
  drawTopCard,
  getOpponentId,
  updatePlayers,
} from 'src/game-engine/helpers'
import { formatNoun } from 'src/utils'
import type { Duel, DuelAction, PlayerId } from 'src/game-engine/types'

type CardEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: string,
) => Duel

const cookEffect: CardEffect = (state, playerId) => {
  const player = state.players[playerId]
  const playerAfterDraw = drawTopCard(player)

  return {
    ...state,
    players: { ...state.players, [playerId]: playerAfterDraw },
    logs: addLogEntry(
      state.logs,
      `${playerAfterDraw.name} draw another card because of Cook. They have ${formatNoun(
        playerAfterDraw.hand.length,
        'card',
      )} in hand and ${formatNoun(
        playerAfterDraw.deck.length,
        'card',
      )} left in deck.`,
    ),
  }
}

const zombieEffect: CardEffect = (state, playerId) => {
  const player = state.players[playerId]

  const zombiesInDiscard = player.discard.filter((id) => {
    const card = state.cards[id]
    return card?.base.id === 'zombie'
  })

  if (zombiesInDiscard.length === 0) return state

  const newCards = { ...state.cards }

  for (const id of zombiesInDiscard) {
    const card = newCards[id]
    if (!card) continue

    newCards[id] = {
      ...card,
      attributes: {
        ...card.attributes,
        life:
          card.base.type === 'character'
            ? card.base.attributes.life
            : card.attributes.life,
      },
    }
  }

  return {
    ...state,
    players: updatePlayers(state.players, playerId, (p) => ({
      ...p,
      discard: p.discard.filter((id) => !zombiesInDiscard.includes(id)),
      board: [...p.board, ...zombiesInDiscard],
    })),
    cards: newCards,
    logs: addLogEntry(
      state.logs,
      `${player.name} resurrects another ${formatNoun(zombiesInDiscard.length, 'Zombie')} from their discard.`,
    ),
  }
}

const noviceEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = state.players[playerId]
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const playedLife = playedCard.attributes.life ?? 0

  const hasStrongerHammerite = player.board.some((id) => {
    if (id === cardInstanceId) return false

    const card = state.cards[id]
    if (!card) return false

    return (
      card.base.categories.includes('Hammerite') &&
      (card.attributes.life ?? 0) > playedLife
    )
  })

  if (!hasStrongerHammerite) return state

  const noviceCopiesInHand = player.hand.filter((id) => {
    const card = state.cards[id]
    return card?.base.id === 'novice'
  })

  const noviceCopiesInDeck = player.deck.filter((id) => {
    const card = state.cards[id]
    return card?.base.id === 'novice'
  })

  const allCopiesToSummon = [...noviceCopiesInHand, ...noviceCopiesInDeck]

  if (allCopiesToSummon.length === 0) return state

  return {
    ...state,
    players: updatePlayers(state.players, playerId, (p) => ({
      ...p,
      hand: p.hand.filter((id) => !noviceCopiesInHand.includes(id)),
      deck: p.deck.filter((id) => !noviceCopiesInDeck.includes(id)),
      board: [...p.board, ...allCopiesToSummon],
    })),
    logs: addLogEntry(
      state.logs,
      `${player.name} summons ${formatNoun(
        allCopiesToSummon.length,
        'Novice',
      )} in addition because they have a stronger Hammerite on board.`,
    ),
  }
}

const sachelmanEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = state.players[playerId]
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const sachelmanLife = playedCard.attributes.life ?? 0
  const newCards = { ...state.cards }
  let weakerHammeritesCount = 0

  for (const id of player.board) {
    if (id === cardInstanceId) continue

    const card = newCards[id]
    if (!card || card.attributes.life === undefined) continue

    if (!card.base.categories.includes('Hammerite')) continue
    if (card.attributes.life >= sachelmanLife) continue

    newCards[id] = {
      ...card,
      attributes: {
        ...card.attributes,
        life: card.attributes.life + balancing.SACHELMAN_BUFF_ON_PLAY,
      },
    }
    weakerHammeritesCount++
  }

  return {
    ...state,
    cards: newCards,
    logs: addLogEntry(
      state.logs,
      `Brother Sachelman gives ${balancing.SACHELMAN_BUFF_ON_PLAY} life to ${formatNoun(weakerHammeritesCount, 'hammerite')} on board.`,
    ),
  }
}

const mysticsSoulEffect: CardEffect = (state, playerId) => {
  const player = state.players[playerId]
  const newCards = { ...state.cards }

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.attributes.charges === undefined) continue

    newCards[id] = {
      ...card,
      attributes: {
        ...card.attributes,
        charges: card.attributes.charges + balancing.MYSTICS_SOUL_BONUS_CHARGES,
      },
    }
  }

  return { ...state, cards: newCards }
}

const templeGuardEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = state.players[playerId]
  const opponentId = getOpponentId(state.playerOrder, playerId)
  const opponent = state.players[opponentId]

  if (opponent.board.length <= player.board.length) return state

  const card = state.cards[cardInstanceId]
  if (!card || card.attributes.life === undefined) return state

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardInstanceId]: {
        ...card,
        attributes: {
          ...card.attributes,
          life:
            card.attributes.life + balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS,
        },
      },
    },
    logs: addLogEntry(
      state.logs,
      `Temple Guard gains ${balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS} life because ${opponent.name} controls more cards on board.`,
    ),
  }
}

const yoraSkullEffect: CardEffect = (state, playerId) => {
  const player = state.players[playerId]
  const newCards = { ...state.cards }
  let boostedCardsCount = 0

  for (const id of player.board) {
    const card = newCards[id]
    if (!card || card.attributes.life === undefined) continue

    if (!card.base.categories.includes('Hammerite')) continue

    newCards[id] = {
      ...card,
      attributes: {
        ...card.attributes,
        life: card.attributes.life + balancing.YORA_SKULL_BUFF_ON_PLAY,
      },
    }
    boostedCardsCount++
  }

  return {
    ...state,
    cards: newCards,
    logs: addLogEntry(
      state.logs,
      `Yora Skull gives ${balancing.YORA_SKULL_BUFF_ON_PLAY} life to ${formatNoun(boostedCardsCount, 'hammerite')} on board.`,
    ),
  }
}

const onPlayEffects: Partial<Record<string, CardEffect>> = {
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
  cardInstanceId: string,
): Duel => {
  const opponentId = getOpponentId(state.playerOrder, playerId)
  const opponent = state.players[opponentId]

  const hauntsWithCharges = opponent.board.filter((id) => {
    const card = state.cards[id]
    return card?.base.id === 'haunt' && (card.attributes.charges ?? 0) > 0
  })

  if (hauntsWithCharges.length === 0) return state

  const playedCard = state.cards[cardInstanceId]
  if (!playedCard || playedCard.attributes.life === undefined) return state

  const newCards = { ...state.cards }

  for (const hauntId of hauntsWithCharges) {
    const hauntCard = newCards[hauntId]
    if (!hauntCard) continue

    newCards[hauntId] = {
      ...hauntCard,
      attributes: {
        ...hauntCard.attributes,
        charges: Math.max(0, (hauntCard.attributes.charges ?? 0) - 1),
      },
    }
  }

  const damage = hauntsWithCharges.reduce((total, hauntId) => {
    const hauntCard = newCards[hauntId]
    return total + (hauntCard?.attributes.strength ?? 0)
  }, 0)
  const newLife = playedCard.attributes.life - damage

  if (newLife <= 0) {
    newCards[cardInstanceId] = {
      ...playedCard,
      attributes: { ...playedCard.attributes, life: 0 },
    }

    return {
      ...state,
      players: updatePlayers(state.players, playerId, (p) => ({
        ...p,
        board: p.board.filter((id) => id !== cardInstanceId),
        discard: [...p.discard, cardInstanceId],
      })),
      cards: newCards,
      logs: addLogEntry(
        state.logs,
        `${formatNoun(hauntsWithCharges.length, 'Haunt')} reacts and defeats ${playedCard.base.name}.`,
      ),
    }
  }

  newCards[cardInstanceId] = {
    ...playedCard,
    attributes: { ...playedCard.attributes, life: newLife },
  }
  return {
    ...state,
    cards: newCards,
    logs: addLogEntry(
      state.logs,
      `${formatNoun(hauntsWithCharges.length, 'Haunt')} reacts. ${playedCard.base.name} loses ${damage} life.`,
    ),
  }
}

const applyBurrickAttackEffect = (
  state: Duel,
  prevState: Duel,
  attackerId: string,
  defenderId: string,
): Duel => {
  const attacker = state.cards[attackerId]
  if (!attacker || attacker.base.id !== 'burrick') return state
  if (attacker.attributes.strength === undefined) return state
  if ((attacker.attributes.charges ?? 0) <= 0) return state

  const inactiveBoard = prevState.players[prevState.playerOrder[1]].board
  const defenderIndex = inactiveBoard.indexOf(defenderId)
  if (defenderIndex === -1) return state

  const adjacentIds: string[] = []

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
  const attackDamage = attacker.attributes.strength
  let affectedAdjacentCount = 0

  for (const adjId of adjacentIds) {
    const adjCard = newCards[adjId]
    if (!adjCard || adjCard.attributes.life === undefined) continue
    affectedAdjacentCount++

    const adjNewLife = adjCard.attributes.life - attackDamage

    if (adjNewLife <= 0) {
      newCards[adjId] = {
        ...adjCard,
        attributes: { ...adjCard.attributes, life: 0 },
      }
      result = {
        ...result,
        players: updatePlayers(result.players, state.playerOrder[1], (p) => ({
          ...p,
          board: p.board.filter((id) => id !== adjId),
          discard: [...p.discard, adjId],
        })),
      }
    } else {
      newCards[adjId] = {
        ...adjCard,
        attributes: { ...adjCard.attributes, life: adjNewLife },
      }
    }
  }

  const currentAttacker = newCards[attackerId]!
  const newCharges = Math.max(0, (currentAttacker.attributes.charges ?? 0) - 1)

  newCards[attackerId] = {
    ...currentAttacker,
    attributes: { ...currentAttacker.attributes, charges: newCharges },
  }

  const burrickLog = `${currentAttacker.base.name} splashes ${formatNoun(
    affectedAdjacentCount,
    'adjacent card',
  )} for ${formatNoun(attackDamage, 'damage')} loosing a charge.`

  return {
    ...result,
    cards: newCards,
    logs: addLogEntry(result.logs, burrickLog),
  }
}

const applyTempleGuardRetaliationEffect = (
  state: Duel,
  attackerId: string,
  defenderId: string,
): Duel => {
  const defender = state.cards[defenderId]
  if (!defender || defender.base.id !== 'templeGuard') return state
  if (defender.attributes.life === undefined || defender.attributes.life <= 0)
    return state

  const attacker = state.cards[attackerId]
  if (!attacker || attacker.attributes.life === undefined) return state
  if (defender.attributes.strength === undefined) return state

  const newCards = { ...state.cards }
  const attackerNewLife =
    attacker.attributes.life - defender.attributes.strength

  if (attackerNewLife <= 0) {
    newCards[attackerId] = {
      ...attacker,
      attributes: { ...attacker.attributes, life: 0 },
    }
    return {
      ...state,
      players: updatePlayers(state.players, state.playerOrder[0], (p) => ({
        ...p,
        board: p.board.filter((id) => id !== attackerId),
        discard: [...p.discard, attackerId],
      })),
      cards: newCards,
      logs: addLogEntry(
        state.logs,
        `Temple Guard retaliates for ${formatNoun(
          defender.attributes.strength,
          'damage',
        )} and defeats ${attacker.base.name}.`,
      ),
    }
  }

  newCards[attackerId] = {
    ...attacker,
    attributes: { ...attacker.attributes, life: attackerNewLife },
  }
  return {
    ...state,
    cards: newCards,
    logs: addLogEntry(
      state.logs,
      `Temple Guard retaliates for ${formatNoun(
        defender.attributes.strength,
        'damage',
      )}. ${attacker.base.name} has ${formatNoun(attackerNewLife, 'life')} left.`,
    ),
  }
}

const applyMarkanderReactiveEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: string,
): Duel => {
  const playedCard = state.cards[cardInstanceId]
  if (!playedCard) return state

  if (!playedCard.base.categories.includes('Hammerite')) return state

  const player = state.players[playerId]
  const markanderIds = [...player.hand, ...player.deck].filter((id) => {
    const card = state.cards[id]
    return card?.base.id === 'markander'
  })

  if (markanderIds.length === 0) return state

  const newCards = { ...state.cards }
  const idsToSummon: string[] = []

  for (const id of markanderIds) {
    const card = newCards[id]
    if (!card) continue

    const newCharges = Math.max(0, (card.attributes.charges ?? 0) - 1)
    newCards[id] = {
      ...card,
      attributes: { ...card.attributes, charges: newCharges },
    }

    if (newCharges <= 0) {
      idsToSummon.push(id)
    }
  }

  let result: Duel = { ...state, cards: newCards }

  if (idsToSummon.length > 0) {
    result = {
      ...result,
      players: updatePlayers(result.players, playerId, (p) => ({
        ...p,
        hand: p.hand.filter((id) => !idsToSummon.includes(id)),
        deck: p.deck.filter((id) => !idsToSummon.includes(id)),
        board: [...p.board, ...idsToSummon],
      })),
      logs: addLogEntry(
        state.logs,
        'Enough Hammerites were played for High Priest Markander to be summoned.',
      ),
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

    const effect = onPlayEffects[card.base.id]
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
