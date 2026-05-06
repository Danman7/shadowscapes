import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import {
  drawCards,
  getPendingInstant,
  resetCharacterAttributes,
} from 'src/game-engine/utils'
import type {
  Duel,
  PendingCharacterAbility,
  PlayerId,
} from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

export const playCard: CaseReducer<
  Duel,
  PayloadAction<{ playerId: PlayerId; cardInstanceId: string }>
> = (state, action) => {
  const { playerId, cardInstanceId } = action.payload
  const player = state.players[playerId]
  const card = state.cards[cardInstanceId]

  player.hand = player.hand.filter((id) => id !== cardInstanceId)
  player.coins -= card.attributes.cost
  state.pendingCharacterAbility = null

  state.phase = 'turn-end'
  state.logs.push(
    formatString(messages.reducer.playCard, {
      playerName: player.name,
      cardName: card.base.name,
    }),
  )

  if (card.base.type === 'Instant') {
    state.pendingInstant = getPendingInstant(card, player.hand, state)
    player.discard.push(cardInstanceId)
    return
  }

  player.board.push(cardInstanceId)
  card.attributes.isStunned = !card.attributes.hasHaste
}

export const redrawCard: CaseReducer<
  Duel,
  PayloadAction<{ playerId: PlayerId; cardInstanceId: string }>
> = (state, action) => {
  const { playerId, cardInstanceId } = action.payload
  const player = state.players[playerId]

  player.hand = player.hand.filter((id) => id !== cardInstanceId)
  player.deck.push(cardInstanceId)
  player.playerReady = true

  drawCards(player)

  state.logs.push(
    formatString(messages.reducer.redrawCard, {
      playerName: player.name,
    }),
  )
}

export const skipRedraw: CaseReducer<
  Duel,
  PayloadAction<{ playerId: PlayerId }>
> = (state, action) => {
  const { playerId } = action.payload
  const player = state.players[playerId]

  if (player.playerReady) return

  player.playerReady = true
  state.pendingCharacterAbility = null
  state.logs.push(
    formatString(messages.reducer.skipRedraw, {
      playerName: player.name,
    }),
  )
}

export const attackCard: CaseReducer<
  Duel,
  PayloadAction<{
    attackerId: string
    defenderId: string
    source?: 'burrick-ability'
  }>
> = (state, action) => {
  const { attackerId, defenderId } = action.payload
  const attacker = state.cards[attackerId]
  const defender = state.cards[defenderId]

  if (
    !attacker ||
    !defender ||
    attacker.attributes.strength === undefined ||
    defender.attributes.life === undefined ||
    attacker.attributes.isStunned
  )
    return

  attacker.didAct = true

  const defenderNewLife =
    defender.attributes.life - attacker.attributes.strength
  const isDefenderDefeated = defenderNewLife <= 0

  if (isDefenderDefeated) {
    state.cards[defenderId] = resetCharacterAttributes(defender)

    const inactivePlayer = state.players[state.playerOrder[1]]
    inactivePlayer.board = inactivePlayer.board.filter(
      (id) => id !== defenderId,
    )
    inactivePlayer.discard.push(defenderId)
  } else {
    defender.attributes.life = defenderNewLife
  }

  state.logs.push(
    isDefenderDefeated
      ? formatString(messages.reducer.attackCardDefeated, {
          attackerName: attacker.base.name,
          defenderName: defender.base.name,
        })
      : formatString(messages.reducer.attackCardDamage, {
          attackerName: attacker.base.name,
          defenderName: defender.base.name,
          damage: attacker.attributes.strength,
        }),
  )
}

export const attackPlayer: CaseReducer<
  Duel,
  PayloadAction<{ attackerId: string }>
> = (state, action) => {
  const { attackerId } = action.payload
  const attacker = state.cards[attackerId]

  if (!attacker || attacker.attributes.isStunned) return

  attacker.didAct = true

  const inactiveId = state.playerOrder[1]
  const inactivePlayer = state.players[inactiveId]
  inactivePlayer.coins = Math.max(0, inactivePlayer.coins - 1)

  state.logs.push(
    formatString(messages.reducer.attackPlayer, {
      attackerName: attacker.base.name,
      playerName: inactivePlayer.name,
      coins: inactivePlayer.coins,
    }),
  )
}

export const activateCharacterAbility: CaseReducer<
  Duel,
  PayloadAction<{ cardInstanceId: string }>
> = (state) => state

export const setPendingCharacterAbility: CaseReducer<
  Duel,
  PayloadAction<{ pendingCharacterAbility: PendingCharacterAbility | null }>
> = (state, action) => {
  state.pendingCharacterAbility = action.payload.pendingCharacterAbility
}

export const cleanupDefeatedCharacters: CaseReducer<Duel> = (state) => {
  for (const player of Object.values(state.players)) {
    const defeatedCharacterIds = player.board.filter((id) => {
      const card = state.cards[id]

      return (
        card !== undefined &&
        card.base.type === 'Character' &&
        card.attributes.life !== undefined &&
        card.attributes.life <= 0
      )
    })

    if (defeatedCharacterIds.length === 0) continue

    player.board = player.board.filter(
      (id) => !defeatedCharacterIds.includes(id),
    )

    for (const defeatedId of defeatedCharacterIds) {
      const defeatedCard = state.cards[defeatedId]
      if (!defeatedCard) continue

      state.cards[defeatedId] = resetCharacterAttributes(defeatedCard)
      player.discard.push(defeatedId)
    }
  }
}
