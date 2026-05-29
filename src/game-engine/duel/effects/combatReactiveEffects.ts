import type { Duel } from 'src/game-engine/types'
import { addLog, resetCharacterAttributes } from 'src/game-engine/utils'
import { formatString, messages } from 'src/i18n'

import { removeIdFromStack } from 'src/game-engine/duel/effects/stack'

type AttackSource = 'burrick-ability'

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

  const newCards = { ...state.cards }
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

  const nextState = {
    ...state,
    cards: newCards,
  }

  addLog(
    nextState,
    formatString(messages.cardEffects.burrickSplash, {
      count: affectedAdjacentCount,
      damage: attackDamage,
    }),
  )

  return nextState
}

const applyRetaliationEffect = (
  state: Duel,
  prevState: Duel,
  attackerId: string,
  defenderId: string,
): Duel => {
  const defenderBeforeAttack = prevState.cards[defenderId]
  const attacker = state.cards[attackerId]

  if (!defenderBeforeAttack || !attacker) return state
  if (defenderBeforeAttack.attributes.retaliates !== true) return state
  if ((defenderBeforeAttack.attributes.life ?? 0) <= 0) return state

  const retaliationDamage = defenderBeforeAttack.attributes.strength
  if (
    retaliationDamage === undefined ||
    attacker.attributes.life === undefined
  ) {
    return state
  }

  const attackerLifeAfterRetaliation =
    attacker.attributes.life - retaliationDamage
  const activePlayerId = prevState.playerOrder[0]

  if (attackerLifeAfterRetaliation <= 0) {
    const attackerOwner = state.players[activePlayerId]

    return {
      ...state,
      cards: {
        ...state.cards,
        [attackerId]: resetCharacterAttributes(attacker),
      },
      players: {
        ...state.players,
        [activePlayerId]: {
          ...attackerOwner,
          board: removeIdFromStack(attackerOwner.board, attackerId),
          discard: [...attackerOwner.discard, attackerId],
        },
      },
    }
  }

  return {
    ...state,
    cards: {
      ...state.cards,
      [attackerId]: {
        ...attacker,
        attributes: {
          ...attacker.attributes,
          life: attackerLifeAfterRetaliation,
        },
      },
    },
  }
}

const applyMinesGuardianFinalAttackEffect = (
  state: Duel,
  prevState: Duel,
  attackerId: string,
  defenderId: string,
  source?: AttackSource,
): Duel => {
  if (source !== undefined) return state

  const defenderBeforeAttack = prevState.cards[defenderId]
  const attacker = state.cards[attackerId]
  const inactivePlayerId = prevState.playerOrder[1]
  const defenderWasOnBoard =
    prevState.players[inactivePlayerId].board.includes(defenderId)
  const defenderIsOnBoard =
    state.players[inactivePlayerId].board.includes(defenderId)

  if (!defenderBeforeAttack || !attacker) return state
  if (defenderBeforeAttack.base.id !== 'minesGuardian') return state
  if (!defenderWasOnBoard || defenderIsOnBoard) return state

  const attackDamage = defenderBeforeAttack.attributes.strength
  if (attackDamage === undefined || attacker.attributes.life === undefined) {
    return state
  }

  const attackerLifeAfterFinalAttack = attacker.attributes.life - attackDamage
  const activePlayerId = prevState.playerOrder[0]

  if (attackerLifeAfterFinalAttack <= 0) {
    const attackerOwner = state.players[activePlayerId]

    return {
      ...state,
      cards: {
        ...state.cards,
        [attackerId]: resetCharacterAttributes(attacker),
      },
      players: {
        ...state.players,
        [activePlayerId]: {
          ...attackerOwner,
          board: removeIdFromStack(attackerOwner.board, attackerId),
          discard: [...attackerOwner.discard, attackerId],
        },
      },
    }
  }

  return {
    ...state,
    cards: {
      ...state.cards,
      [attackerId]: {
        ...attacker,
        attributes: {
          ...attacker.attributes,
          life: attackerLifeAfterFinalAttack,
        },
      },
    },
  }
}

export const applyCombatReactiveEffects = ({
  state,
  prevState,
  attackerId,
  defenderId,
  source,
}: {
  state: Duel
  prevState: Duel
  attackerId: string
  defenderId: string
  source?: AttackSource
}): Duel => {
  let result = applyBurrickAttackEffect(
    state,
    prevState,
    attackerId,
    defenderId,
  )
  result = applyRetaliationEffect(result, prevState, attackerId, defenderId)

  return applyMinesGuardianFinalAttackEffect(
    result,
    prevState,
    attackerId,
    defenderId,
    source,
  )
}
