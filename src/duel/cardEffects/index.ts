import { createActionEffectsMiddleware } from './actionEffectsMiddleware'
import type { CardEffectsState } from './onPlayEffect'
import { orderEffects } from './orderEffects'

export * from './actionEffectsMiddleware'
export * from './onPlayEffect'
export * from './orderEffects'

export const cardEffectsMiddleware =
  createActionEffectsMiddleware<CardEffectsState>(orderEffects)
