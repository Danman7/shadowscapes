import { useGameDispatch } from 'src/contexts'
import {
  activateCharacterAbility,
  applyFlashBomb,
  applySpeedPotion,
  attackCard,
  attackPlayer,
  playCard,
  redrawCard,
} from 'src/game-engine/duel'
import type {
  CardInstance,
  PendingCharacterAbility,
  PendingInstant,
  Phase,
  Player,
} from 'src/game-engine'

import type { AttackAnimationRequest } from 'src/components/DuelView/attackAnimation'
import {
  type BoardCardClickCommand,
  getBoardCardClickCommand,
  getHandCardClickCommand,
  type HandCardClickCommand,
} from 'src/components/DuelView/cardClickActions'
import type { ScopedSelectionController } from 'src/components/DuelView/useScopedSelection'

const getAnimationRequest = (
  command: BoardCardClickCommand,
): AttackAnimationRequest | undefined => {
  return 'animationRequest' in command ? command.animationRequest : undefined
}

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
  requestAttackAnimation,
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
  requestAttackAnimation: (request: AttackAnimationRequest) => void
}): {
  getOnCardClick: (cardId: string) => (() => void) | undefined
  getOnBoardCardClick: (
    cardId: string,
    isActiveBoard: boolean,
  ) => (() => void) | undefined
} => {
  const dispatch = useGameDispatch()

  const executeHandCommand = (command: HandCardClickCommand): void => {
    switch (command.type) {
      case 'redraw-card':
        dispatch(
          redrawCard({
            playerId: command.playerId,
            cardInstanceId: command.cardInstanceId,
          }),
        )
        return

      case 'apply-speed-potion':
        dispatch(
          applySpeedPotion({
            targetCardInstanceId: command.targetCardInstanceId,
          }),
        )
        return

      case 'play-card':
        dispatch(
          playCard({
            playerId: command.playerId,
            cardInstanceId: command.cardInstanceId,
          }),
        )
        return
    }
  }

  const executeBoardCommand = (command: BoardCardClickCommand): void => {
    const animationRequest = getAnimationRequest(command)
    if (animationRequest !== undefined) requestAttackAnimation(animationRequest)

    switch (command.type) {
      case 'apply-flash-bomb':
        dispatch(
          applyFlashBomb({
            targetCardInstanceId: command.targetCardInstanceId,
          }),
        )
        return

      case 'activate-character-ability':
        dispatch(
          activateCharacterAbility({ cardInstanceId: command.cardInstanceId }),
        )
        return

      case 'attack-player':
        dispatch(attackPlayer({ attackerId: command.attackerId }))
        return

      case 'select-attacker':
        selectedAttackerSelection.select(command.attackerId)
        return

      case 'attack-card':
        dispatch(
          attackCard({
            attackerId: command.attackerId,
            defenderId: command.defenderId,
          }),
        )
        selectedAttackerSelection.clear()
        return
    }
  }

  const getOnCardClick = (cardId: string): (() => void) | undefined => {
    const command = getHandCardClickCommand({
      cardId,
      phase,
      activePlayer,
      activePlayerCoins,
      activeHand,
      pendingInstant,
    })

    if (command === undefined) return undefined

    return () => executeHandCommand(command)
  }

  const getOnBoardCardClick = (
    cardId: string,
    isActiveBoard: boolean,
  ): (() => void) | undefined => {
    const command = getBoardCardClickCommand({
      cardId,
      isActiveBoard,
      phase,
      activeBoard,
      inactiveBoard,
      pendingCharacterAbility,
      pendingInstant,
      selectedAttackerId: selectedAttackerSelection.selectedId,
    })

    if (command === undefined) return undefined

    return () => executeBoardCommand(command)
  }

  return { getOnCardClick, getOnBoardCardClick }
}
