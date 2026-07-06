import { templeGuardOutnumberedLifeBuff } from '../../cards/bases/orderConstants'
import {
  adjustCharacterLife,
  summonAllCopies,
} from '../state/duelSlice'
import { isCharacterInstance } from '../utils'
import { createOnPlayCardEffect } from './onPlayEffect'

const noviceOnPlay = createOnPlayCardEffect(
  'novice',
  ({ cardInstanceId, dispatch, getState, playerId }) => {
    const state = getState().duel
    const novice = state.cards[cardInstanceId]
    const player = state.players[playerId]

    if (!isCharacterInstance(novice) || !player) return

    const hasHigherLifeAlly = player.board.some((allyId) => {
      if (allyId === cardInstanceId) return false

      const ally = state.cards[allyId]

      return isCharacterInstance(ally) && ally.life > novice.life
    })

    if (!hasHigherLifeAlly) return

    dispatch(
      summonAllCopies({
        playerId,
        cardBaseId: 'novice',
        from: 'hand',
      }),
    )
  },
)

const templeGuardOnPlay = createOnPlayCardEffect(
  'templeGuard',
  ({ cardInstanceId, dispatch, getState, playerId }) => {
    const state = getState().duel
    const player = state.players[playerId]
    const opponentId = state.playerOrder.find((id) => id !== playerId)
    const opponent = opponentId ? state.players[opponentId] : undefined

    if (!player || !opponent || opponent.board.length <= player.board.length) {
      return
    }

    dispatch(
      adjustCharacterLife({
        cardInstanceId,
        amount: templeGuardOutnumberedLifeBuff,
      }),
    )
  },
)

export const orderEffects = [noviceOnPlay, templeGuardOnPlay] as const
