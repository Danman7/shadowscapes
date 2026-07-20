import { getCardBase } from '../../../cards'
import type { DisplayCard } from '../../../cards'
import type { CardInstance } from '../../types'

export const getDisplayCardFromInstance = (
  instance: CardInstance,
): DisplayCard => {
  const base = getCardBase(instance.baseId)

  if (instance.type === 'character' && base.type === 'character') {
    return {
      ...base,
      cost: instance.cost,
      life: instance.life,
      strength: instance.strength,
      traits: instance.traits,
    }
  }

  return { ...base, cost: instance.cost }
}
