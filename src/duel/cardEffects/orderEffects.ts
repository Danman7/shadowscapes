import {
  acolyteGainIncome,
  templeGuardOutnumberedLifeBuff,
  yoraDirectBuff,
  yoraIndirectBuff,
} from '../../cards/bases/orderConstants'
import {
  adjustCharacterCharges,
  adjustCharacterLife,
  adjustPlayerIncome,
  drawCard,
  summonAllCopies,
  summonCard,
} from '../state/duelSlice'
import { getAdjacentBoardCardIds, isCharacterInstance } from '../utils'
import {
  createOnPlayCardEffect,
  createOnPlayCategoryEffect,
} from './onPlayEffect'
import { createTargetedCardEffect } from './targetedCardEffect'

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

const acolyteOnPlay = createOnPlayCardEffect(
  'acolyte',
  ({ cardInstanceId, dispatch, getState, playerId }) => {
    const player = getState().duel.players[playerId]

    if (!player?.board.includes(cardInstanceId)) return

    if (player.board.length === 1) {
      dispatch(drawCard({ playerId }))
      return
    }

    dispatch(adjustPlayerIncome({ playerId, amount: acolyteGainIncome }))
  },
)

const yoraSkullTargetedEffect = createTargetedCardEffect(
  'yoraSkull',
  ({ cardInstanceId, dispatch, getState, targetCardInstanceId }) => {
    const state = getState().duel
    const skull = state.cards[cardInstanceId]
    const target = state.cards[targetCardInstanceId]
    const player = skull ? state.players[skull.ownerId] : undefined
    const opponentId = state.playerOrder.find((id) => id !== skull?.ownerId)
    const opponent = opponentId ? state.players[opponentId] : undefined

    if (!player || !opponent || !isCharacterInstance(target)) return

    dispatch(
      adjustCharacterLife({
        cardInstanceId: targetCardInstanceId,
        amount: yoraDirectBuff,
      }),
    )

    const alliedBoard = player.board.filter((id) => id !== cardInstanceId)

    if (opponent.board.length <= alliedBoard.length) return

    getAdjacentBoardCardIds(state, targetCardInstanceId).forEach(
      (adjacentCardId) => {
        const adjacentCard = state.cards[adjacentCardId]

        if (
          !isCharacterInstance(adjacentCard) ||
          adjacentCard.ownerId !== player.id
        ) {
          return
        }

        dispatch(
          adjustCharacterLife({
            cardInstanceId: adjacentCardId,
            amount: yoraIndirectBuff,
          }),
        )
      },
    )
  },
)

const markanderHammeriteOnPlay = createOnPlayCategoryEffect(
  'hammerite',
  ({ dispatch, getState, playerId }) => {
    const state = getState().duel
    const player = state.players[playerId]

    if (!player) return

    const markanderIds = player.hand.filter((cardId) => {
      const card = state.cards[cardId]

      return (
        isCharacterInstance(card) &&
        card.baseId === 'markander' &&
        (card.traits.charges ?? 0) > 0
      )
    })

    markanderIds.forEach((markanderId) => {
      const markander = getState().duel.cards[markanderId]

      if (
        !isCharacterInstance(markander) ||
        markander.stack !== 'hand' ||
        (markander.traits.charges ?? 0) <= 0
      ) {
        return
      }

      const shouldSummon = markander.traits.charges === 1

      dispatch(
        adjustCharacterCharges({
          cardInstanceId: markanderId,
          amount: -1,
          stack: 'hand',
        }),
      )

      if (!shouldSummon) return

      dispatch(
        summonCard({
          playerId,
          cardInstanceId: markanderId,
          from: 'hand',
        }),
      )
    })
  },
)

export const orderEffects = [
  noviceOnPlay,
  templeGuardOnPlay,
  acolyteOnPlay,
  yoraSkullTargetedEffect,
  markanderHammeriteOnPlay,
] as const
