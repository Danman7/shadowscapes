import { DuelBuilder } from '@/state/duelBuilder'
import { DuelPhases } from '@/state/duelConstants'
import { flipCoinForFirstPlayer } from '@/state/utils'
import { DuelAction, DuelState } from '@/types'

export const duelReducer = (
  state: Readonly<DuelState>,
  action: DuelAction,
): DuelState => {
  switch (action.type) {
    case 'START_DUEL': {
      const [player1, player2] = action.players

      return new DuelBuilder()
        .updatePlayer('Player1', {
          name: player1.name,
          userId: player1.id,
        })
        .updatePlayer('Player2', {
          name: player2.name,
          userId: player2.id,
        })
        .putCardsInZone(
          'Player1',
          'Deck',
          player1.deck.map((definitionId) => ({ definitionId })),
        )
        .putCardsInZone(
          'Player2',
          'Deck',
          player2.deck.map((definitionId) => ({ definitionId })),
        )
        .build()
    }

    case 'FLIP_COIN_FOR_FIRST_PLAYER': {
      return {
        ...state,
        activePlayerId: flipCoinForFirstPlayer(),
      }
    }

    case 'START_INITIAL_DRAW':
      return {
        ...state,
        phase: DuelPhases.InitialDraw,
      }

    default:
      return state
  }
}
