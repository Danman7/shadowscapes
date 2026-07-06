import { isAction } from '@reduxjs/toolkit'
import type { Middleware, UnknownAction } from '@reduxjs/toolkit'

export interface ActionEffectContext<TState> {
  action: UnknownAction
  previousState: TState
  state: TState
  dispatch: (action: UnknownAction) => unknown
  getState: () => TState
}

export interface ActionEffectRegistration<TState> {
  matches: (action: UnknownAction) => boolean
  run: (context: ActionEffectContext<TState>) => void
}

export const createActionEffectsMiddleware = <TState>(
  registrations: readonly ActionEffectRegistration<TState>[],
): Middleware<object, TState> =>
  (api) => (next) => (action) => {
    const previousState = api.getState()
    const result = next(action)
    const state = api.getState()

    if (!isAction(action)) return result

    registrations.forEach((registration) => {
      if (!registration.matches(action)) return

      registration.run({
        action,
        previousState,
        state,
        dispatch: api.dispatch,
        getState: api.getState,
      })
    })

    return result
  }
