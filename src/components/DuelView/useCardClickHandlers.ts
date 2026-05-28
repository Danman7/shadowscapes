import { useGameDispatch } from 'src/contexts'
import type {
  CardInstance,
  PendingCharacterAbility,
  PendingInstant,
  Phase,
  Player,
} from 'src/game-engine'
import {
  activateCharacterAbility,
  applyFlashBomb,
  applySpeedPotion,
  attackCard,
  attackPlayer,
  playCard,
  redrawCard,
} from 'src/game-engine/duel'

import type { ScopedSelectionController } from 'src/components/DuelView/useScopedSelection'

export const useCardClickHandlers = ({
  phase,
  activePlayer,
  activePlayerCoins,
  activeHand,
  activeBoard,
  inactiveBoard,
  pendingCharacterAbility,
  pendingInstant,
  selectedAttackerSelection,
  triggerAttackAnimation,
}: {
  phase: Phase
  activePlayer: Player
  activePlayerCoins: number
  activeHand: CardInstance[]
  activeBoard: CardInstance[]
  inactiveBoard: CardInstance[]
  pendingCharacterAbility: PendingCharacterAbility | null
  pendingInstant: PendingInstant | null
  selectedAttackerSelection: ScopedSelectionController
  triggerAttackAnimation: (attackerId: string) => void
}): {
  getOnCardClick: (cardId: string) => (() => void) | undefined
  getOnBoardCardClick: (
    cardId: string,
    isActiveBoard: boolean,
  ) => (() => void) | undefined
} => {
  const dispatch = useGameDispatch()

  const getOnCardClick = (cardId: string): (() => void) | undefined => {
    if (phase === 'redraw') {
      if (activePlayer.playerReady) return undefined

      return () => {
        dispatch(
          redrawCard({ playerId: activePlayer.id, cardInstanceId: cardId }),
        )
      }
    }

    if (phase === 'turn-end' && pendingInstant === 'SPEED_POTION') {
      const cardInstance = activeHand.find((c) => c.id === cardId)
      if (!cardInstance) return undefined
      if (cardInstance.base.type !== 'Character') return undefined

      return () => {
        dispatch(applySpeedPotion({ targetCardInstanceId: cardId }))
      }
    }

    if (phase === 'player-turn') {
      const cardInstance = activeHand.find((c) => c.id === cardId)
      if (!cardInstance) return undefined

      if (cardInstance.attributes.cost > activePlayerCoins) return undefined

      return () => {
        dispatch(
          playCard({ playerId: activePlayer.id, cardInstanceId: cardId }),
        )
      }
    }

    return undefined
  }

  const getOnBoardCardClick = (
    cardId: string,
    isActiveBoard: boolean,
  ): (() => void) | undefined => {
    if (pendingInstant === 'FLASH_BOMB') {
      return () => {
        dispatch(applyFlashBomb({ targetCardInstanceId: cardId }))
      }
    }

    if (phase === 'player-turn') {
      if (!isActiveBoard && pendingCharacterAbility !== null) {
        return () => {
          triggerAttackAnimation(pendingCharacterAbility.sourceCardInstanceId)
          dispatch(activateCharacterAbility({ cardInstanceId: cardId }))
        }
      }

      if (!isActiveBoard) return undefined

      return () => {
        dispatch(activateCharacterAbility({ cardInstanceId: cardId }))
      }
    }

    if (phase !== 'turn-end') return undefined

    if (isActiveBoard) {
      const cardInstance = activeBoard.find((c) => c.id === cardId)
      if (
        !cardInstance ||
        cardInstance.attributes.cannotAttack === true ||
        cardInstance.didAct ||
        cardInstance.attributes.isStunned
      )
        return undefined

      if (inactiveBoard.length === 0) {
        return () => {
          triggerAttackAnimation(cardId)
          dispatch(attackPlayer({ attackerId: cardId }))
        }
      }

      return () => {
        selectedAttackerSelection.select(cardId)
      }
    }

    const selectedAttackerId = selectedAttackerSelection.selectedId
    if (selectedAttackerId === null) return undefined

    const selectedCard = activeBoard.find((c) => c.id === selectedAttackerId)
    if (!selectedCard || selectedCard.didAct) return undefined

    const cardInstance = inactiveBoard.find((c) => c.id === cardId)
    if (!cardInstance) return undefined

    return () => {
      triggerAttackAnimation(selectedAttackerId)
      dispatch(
        attackCard({
          attackerId: selectedAttackerId,
          defenderId: cardId,
        }),
      )
      selectedAttackerSelection.clear()
    }
  }

  return { getOnCardClick, getOnBoardCardClick }
}
