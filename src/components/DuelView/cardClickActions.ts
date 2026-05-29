import {
  createAttackAnimationRequest,
  type AttackAnimationRequest,
} from 'src/components/DuelView/attackAnimation'
import type {
  CardInstance,
  PendingCharacterAbility,
  PendingInstant,
  Phase,
  Player,
} from 'src/game-engine'

export type HandCardClickCommand =
  | {
      type: 'redraw-card'
      playerId: string
      cardInstanceId: string
    }
  | {
      type: 'apply-speed-potion'
      targetCardInstanceId: string
    }
  | {
      type: 'play-card'
      playerId: string
      cardInstanceId: string
    }

export type BoardCardClickCommand =
  | {
      type: 'apply-flash-bomb'
      targetCardInstanceId: string
    }
  | {
      type: 'activate-character-ability'
      cardInstanceId: string
      animationRequest?: AttackAnimationRequest
    }
  | {
      type: 'attack-player'
      attackerId: string
      animationRequest: AttackAnimationRequest
    }
  | {
      type: 'select-attacker'
      attackerId: string
    }
  | {
      type: 'attack-card'
      attackerId: string
      defenderId: string
      animationRequest: AttackAnimationRequest
    }

export const getHandCardClickCommand = ({
  cardId,
  phase,
  activePlayer,
  activePlayerCoins,
  activeHand,
  pendingInstant,
}: {
  cardId: string
  phase: Phase
  activePlayer: Player
  activePlayerCoins: number
  activeHand: CardInstance[]
  pendingInstant: PendingInstant | null
}): HandCardClickCommand | undefined => {
  if (phase === 'redraw') {
    if (activePlayer.playerReady) return undefined

    return {
      type: 'redraw-card',
      playerId: activePlayer.id,
      cardInstanceId: cardId,
    }
  }

  if (phase === 'turn-end' && pendingInstant === 'SPEED_POTION') {
    const cardInstance = activeHand.find((card) => card.id === cardId)
    if (!cardInstance) return undefined
    if (cardInstance.base.type !== 'Character') return undefined

    return {
      type: 'apply-speed-potion',
      targetCardInstanceId: cardId,
    }
  }

  if (phase === 'player-turn') {
    const cardInstance = activeHand.find((card) => card.id === cardId)
    if (!cardInstance) return undefined
    if (cardInstance.attributes.cost > activePlayerCoins) return undefined

    return {
      type: 'play-card',
      playerId: activePlayer.id,
      cardInstanceId: cardId,
    }
  }

  return undefined
}

export const getBoardCardClickCommand = ({
  cardId,
  isActiveBoard,
  phase,
  activeBoard,
  inactiveBoard,
  pendingCharacterAbility,
  pendingInstant,
  selectedAttackerId,
}: {
  cardId: string
  isActiveBoard: boolean
  phase: Phase
  activeBoard: CardInstance[]
  inactiveBoard: CardInstance[]
  pendingCharacterAbility: PendingCharacterAbility | null
  pendingInstant: PendingInstant | null
  selectedAttackerId: string | null
}): BoardCardClickCommand | undefined => {
  if (pendingInstant === 'FLASH_BOMB') {
    return {
      type: 'apply-flash-bomb',
      targetCardInstanceId: cardId,
    }
  }

  if (phase === 'player-turn') {
    if (!isActiveBoard && pendingCharacterAbility !== null) {
      return {
        type: 'activate-character-ability',
        cardInstanceId: cardId,
        animationRequest: createAttackAnimationRequest(
          pendingCharacterAbility.sourceCardInstanceId,
        ),
      }
    }

    if (!isActiveBoard) return undefined

    return {
      type: 'activate-character-ability',
      cardInstanceId: cardId,
    }
  }

  if (phase !== 'turn-end') return undefined

  if (isActiveBoard) {
    const cardInstance = activeBoard.find((card) => card.id === cardId)
    if (
      !cardInstance ||
      cardInstance.attributes.cannotAttack === true ||
      cardInstance.didAct ||
      cardInstance.attributes.isStunned
    )
      return undefined

    if (inactiveBoard.length === 0) {
      return {
        type: 'attack-player',
        attackerId: cardId,
        animationRequest: createAttackAnimationRequest(cardId),
      }
    }

    return {
      type: 'select-attacker',
      attackerId: cardId,
    }
  }

  if (selectedAttackerId === null) return undefined

  const selectedCard = activeBoard.find(
    (card) => card.id === selectedAttackerId,
  )
  if (!selectedCard || selectedCard.didAct) return undefined

  const cardInstance = inactiveBoard.find((card) => card.id === cardId)
  if (!cardInstance) return undefined

  return {
    type: 'attack-card',
    attackerId: selectedAttackerId,
    defenderId: cardId,
    animationRequest: createAttackAnimationRequest(selectedAttackerId),
  }
}
