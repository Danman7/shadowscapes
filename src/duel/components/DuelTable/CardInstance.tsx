import { Card } from '../../../cards'
import {
  useCombatInteraction,
  useDuelDispatch,
  useDuelState,
} from '../../hooks'
import { playCard } from '../../state'
import type { CardInstance as CardInstanceType } from '../../types'
import { canCardBePlayed, isPlayerHumanControlled } from '../../utils'
import { getDisplayCardFromInstance } from './getDisplayCardFromInstance'

interface CardInstanceProps {
  instance: CardInstanceType
}

export const CardInstance = ({ instance }: CardInstanceProps) => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const combatInteraction = useCombatInteraction()
  const isOnBoard = instance.stack === 'board'
  const card = getDisplayCardFromInstance(instance)

  const getOnClick = () => {
    if (isOnBoard) {
      return combatInteraction.getBoardCardOnClick(instance)
    }

    if (instance.stack !== 'hand') return undefined
    if (!isPlayerHumanControlled(duelState, instance.ownerId)) return undefined

    const payload = {
      playerId: instance.ownerId,
      cardInstanceId: instance.id,
      cardBaseId: instance.baseId,
    }

    if (!canCardBePlayed({ state: duelState, ...payload })) return undefined

    return () => dispatch(playCard(payload))
  }

  return (
    <Card
      card={card}
      isCompact={isOnBoard}
      className={
        isOnBoard
          ? combatInteraction.getBoardCardClassName(instance)
          : undefined
      }
      isSelected={isOnBoard && combatInteraction.isCardSelected(instance)}
      onClick={getOnClick()}
    />
  )
}
