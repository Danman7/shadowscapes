import { balancing } from 'src/game-engine/constants'
import type { CardBaseId, Duel, PlayerId } from 'src/game-engine/types'
import {
  addLog,
  drawCards,
  getCardsInStack,
  getOpponentId,
  hasCardInStack,
  updatePlayers,
} from 'src/game-engine/utils'
import { formatString, messages } from 'src/i18n'

import {
  removeIdFromStack,
  removeIdsFromStack,
} from 'src/game-engine/duel/effects/stack'
import type { CardEffect } from 'src/game-engine/duel/effects/types'

const cookEffect: CardEffect = (state, playerId) => {
  const sourcePlayer = state.players[playerId]
  const player = {
    ...sourcePlayer,
    deck: [...sourcePlayer.deck],
    hand: [...sourcePlayer.hand],
  }
  drawCards(player)

  const nextState = {
    ...state,
    players: { ...state.players, [playerId]: player },
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.cookDraw, {
      playerName: player.name,
    }),
  )

  return nextState
}

const zombieEffect: CardEffect = (state, playerId) => {
  const player = state.players[playerId]

  const zombiesInDiscard = getCardsInStack(
    player.discard,
    state.cards,
    (card) => {
      return card.base.id === 'zombie'
    },
  )

  if (zombiesInDiscard.length === 0) return state

  const newCards = { ...state.cards }
  for (const zombieId of zombiesInDiscard) {
    const zombieCard = newCards[zombieId]
    if (!zombieCard) continue

    newCards[zombieId] = {
      ...zombieCard,
      attributes: {
        ...zombieCard.attributes,
        isStunned: true,
      },
    }
  }

  const nextState = {
    ...state,
    cards: newCards,
    players: updatePlayers(state.players, playerId, (p) => ({
      ...p,
      discard: removeIdsFromStack(p.discard, zombiesInDiscard),
      board: [...p.board, ...zombiesInDiscard],
    })),
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.zombieResurrect, {
      count: zombiesInDiscard.length,
    }),
  )

  return nextState
}

const noviceEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = state.players[playerId]
  const playedCard = state.cards[cardInstanceId]

  if (!playedCard) return state

  const playedLife = playedCard.attributes.life ?? 0

  const boardWithoutPlayedCard = removeIdFromStack(player.board, cardInstanceId)

  const hasStrongerHammerite = hasCardInStack(
    boardWithoutPlayedCard,
    state.cards,
    (card) => {
      return (
        card.base.categories.includes('Hammerite') &&
        (card.attributes.life ?? 0) > playedLife
      )
    },
  )

  if (!hasStrongerHammerite) return state

  const noviceCopiesInHand = getCardsInStack(
    player.hand,
    state.cards,
    (card) => {
      return card.base.id === 'novice'
    },
  )

  const noviceCopiesInDeck = getCardsInStack(
    player.deck,
    state.cards,
    (card) => {
      return card.base.id === 'novice'
    },
  )

  const allCopiesToSummon = [...noviceCopiesInHand, ...noviceCopiesInDeck]

  if (allCopiesToSummon.length === 0) return state

  const newCards = { ...state.cards }
  for (const noviceId of allCopiesToSummon) {
    const noviceCard = newCards[noviceId]
    if (!noviceCard) continue

    newCards[noviceId] = {
      ...noviceCard,
      attributes: {
        ...noviceCard.attributes,
        isStunned: true,
      },
    }
  }

  const nextState = {
    ...state,
    cards: newCards,
    players: updatePlayers(state.players, playerId, (p) => ({
      ...p,
      hand: removeIdsFromStack(p.hand, noviceCopiesInHand),
      deck: removeIdsFromStack(p.deck, noviceCopiesInDeck),
      board: [...p.board, ...allCopiesToSummon],
    })),
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.noviceSummon, {
      playerName: player.name,
      count: allCopiesToSummon.length,
    }),
  )

  return nextState
}

const acolyteEffect: CardEffect = (state, playerId, cardInstanceId) => {
  const player = state.players[playerId]
  const aliveAlliedCharacters = getCardsInStack(
    player.board,
    state.cards,
    (card) => {
      return card.base.type === 'Character' && (card.attributes.life ?? 0) > 0
    },
  )

  const shouldGainBuff =
    aliveAlliedCharacters.length === 1 &&
    aliveAlliedCharacters[0] === cardInstanceId

  if (!shouldGainBuff) return state

  const card = state.cards[cardInstanceId]
  if (!card || card.attributes.strength === undefined) return state

  const opponentId = getOpponentId(state.playerOrder, playerId)
  const opponent = state.players[opponentId]
  const updatedStrength: number = opponent.board.length
    ? card.attributes.strength + 1
    : card.attributes.strength

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardInstanceId]: {
        ...card,
        attributes: {
          ...card.attributes,
          hasHaste: true,
          isStunned: false,
          strength: updatedStrength,
        },
      },
    },
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

  const nextState = {
    ...state,
    cards: newCards,
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.buffOnBoard, {
      buff: balancing.SACHELMAN_BUFF_ON_PLAY,
      count: weakerHammeritesCount,
    }),
  )

  return nextState
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

  const nextState = {
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
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.templeGuardBuff, {
      buff: balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS,
      opponentName: opponent.name,
    }),
  )

  return nextState
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

  const nextState = {
    ...state,
    cards: newCards,
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.buffOnBoard, {
      buff: balancing.YORA_SKULL_BUFF_ON_PLAY,
      count: boostedCardsCount,
    }),
  )

  return nextState
}

const onPlayEffects: Partial<Record<CardBaseId, CardEffect>> = {
  cook: cookEffect,
  zombie: zombieEffect,
  novice: noviceEffect,
  elevatedAcolyte: acolyteEffect,
  sachelman: sachelmanEffect,
  mysticsSoul: mysticsSoulEffect,
  templeGuard: templeGuardEffect,
  yoraSkull: yoraSkullEffect,
}

export const applyMarkanderReactiveEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: string,
): Duel => {
  const playedCard = state.cards[cardInstanceId]
  if (!playedCard) return state

  if (!playedCard.base.categories.includes('Hammerite')) return state

  const player = state.players[playerId]
  const markanderIds = getCardsInStack(
    [...player.hand, ...player.deck],
    state.cards,
    (card) => {
      return card.base.id === 'markander'
    },
  )

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
        hand: removeIdsFromStack(p.hand, idsToSummon),
        deck: removeIdsFromStack(p.deck, idsToSummon),
        board: [...p.board, ...idsToSummon],
      })),
    }

    addLog(result, messages.cardEffects.markanderSummoned)
  }

  return result
}

export const applyOnPlayEffects = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: string,
): Duel => {
  const card = state.cards[cardInstanceId]
  if (!card) return state

  const effect = onPlayEffects[card.base.id]
  const result = effect ? effect(state, playerId, cardInstanceId) : state

  return applyMarkanderReactiveEffect(result, playerId, cardInstanceId)
}
