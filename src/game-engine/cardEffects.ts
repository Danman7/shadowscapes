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
  novice: noviceEffect,
  sachelman: sachelmanEffect,
}

export function applyCardEffects(state: Duel, action: DuelAction): Duel {
  if (action.type !== 'PLAY_CARD') return state

  const { playerId, cardInstanceId } = action.payload
  const card = state.cards[cardInstanceId]

  if (!card) return state

  const effect = onPlayEffects[card.baseId]

  if (!effect) return state

  return effect(state, playerId, cardInstanceId)
}
