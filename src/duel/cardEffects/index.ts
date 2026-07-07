import { createActionEffectsMiddleware } from './actionEffectsMiddleware'
import type { CardEffectsState } from './onPlayEffect'
import { chaosEffects } from './chaosEffects'
import { orderEffects } from './orderEffects'

export * from './actPassEffect'
export * from './actionEffectsMiddleware'
export * from './chaosEffects'
export * from './onPlayEffect'
export * from './orderEffects'
export * from './targetedCardEffect'

export const cardEffectsMiddleware =
  createActionEffectsMiddleware<CardEffectsState>([
    ...orderEffects,
    ...chaosEffects,
  ])
