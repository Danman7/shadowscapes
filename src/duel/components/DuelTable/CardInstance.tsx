import { Card, getCardBase } from '../../../cards'
import type { DisplayCard } from '../../../cards'
import {
  useCombatInteraction,
  useDuelDispatch,
  useDuelState,
} from '../../hooks'
import { playCard } from '../../state'
import type { CardInstance as CardInstanceType } from '../../types'
import { canCardBePlayed } from '../../utils'

interface CardInstanceProps {
  instance: CardInstanceType
}

const populateCardFromInstance = (
  instance: CardInstanceType,
): DisplayCard => {
  const base = getCardBase(instance.baseId)

  if (instance.type === 'character' && base.type === 'character') {
    return {
      ...base,
      cost: instance.cost,
      life: instance.life,
      strength: instance.strength,
      charges: instance.charges,
      turnsStunned: instance.turnsStunned,
    }
  }

  return { ...base, cost: instance.cost }
}

export const CardInstance = ({ instance }: CardInstanceProps) => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const combatInteraction = useCombatInteraction()
  const isOnBoard = instance.stack === 'board'
  const card = populateCardFromInstance(instance)

  const getOnClick = () => {
    if (isOnBoard) {
      return combatInteraction.getBoardCardOnClick(instance)
    }

    if (instance.stack !== 'hand') return undefined

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
