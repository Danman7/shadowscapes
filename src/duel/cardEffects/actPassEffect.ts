import type { CardBaseId } from '../../cards'
import { passActTurn } from '../state/duelSlice'
import type { CardInstanceId, PlayerId } from '../types'
import { canActPlayerPass, getReadyCharacters } from '../utils'
import type {
  ActionEffectContext,
  ActionEffectRegistration,
} from './actionEffectsMiddleware'
import type { CardEffectsState } from './onPlayEffect'

export interface ActPassEffectContext
  extends ActionEffectContext<CardEffectsState> {
  cardInstanceId: CardInstanceId
  playerId: PlayerId
}

type ActPassEffect = (context: ActPassEffectContext) => void

export const getPassedActCharacterIds = (
  context: ActionEffectContext<CardEffectsState>,
): CardInstanceId[] => {
  if (!passActTurn.match(context.action)) return []
  if (!canActPlayerPass(context.previousState.duel)) return []

  const playerId = context.previousState.duel.actPlayerId
  const player = playerId ? context.state.duel.players[playerId] : undefined

  if (!playerId || !player?.hasActedThisPhase) return []

  return getReadyCharacters(context.previousState.duel, playerId).map(
    (card) => card.id,
  )
}

export const createActPassCardEffect = (
  cardBaseId: CardBaseId,
  effect: ActPassEffect,
): ActionEffectRegistration<CardEffectsState> => ({
  matches: passActTurn.match,
  run: (context) => {
    const playerId = context.previousState.duel.actPlayerId

    if (!playerId) return

    getPassedActCharacterIds(context).forEach((cardInstanceId) => {
      const card = context.previousState.duel.cards[cardInstanceId]

      if (card?.baseId !== cardBaseId) return

      effect({ ...context, cardInstanceId, playerId })
    })
  },
})
