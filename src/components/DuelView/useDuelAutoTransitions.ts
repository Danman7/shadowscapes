import { useEffect } from 'react'

import { useGameDispatch } from 'src/contexts'
import type {
  CardInstance,
  PendingInstant,
  Phase,
  Player,
} from 'src/game-engine'
import {
  goToEndOfTurn,
  goToRedraw,
  skipRedraw,
  startFirstPlayerTurn,
  startInitialDraw,
  switchTurn,
} from 'src/game-engine/duel'

export const useDuelAutoTransitions = ({
  phase,
  activePlayer,
  inactivePlayer,
  activeHandCount,
  activeDeckCount,
  activeBoard,
  inactiveBoardCount,
  pendingInstant,
}: {
  phase: Phase
  activePlayer: Player
  inactivePlayer: Player
  activeHandCount: number
  activeDeckCount: number
  activeBoard: CardInstance[]
  inactiveBoardCount: number
  pendingInstant: PendingInstant | null
}): void => {
  const dispatch = useGameDispatch()

  useEffect(() => {
    if (phase === 'intro') dispatch(startInitialDraw())
    if (phase === 'initial-draw') dispatch(goToRedraw())
  }, [dispatch, phase])

  useEffect(() => {
    if (phase === 'redraw') {
      dispatch(skipRedraw({ playerId: inactivePlayer.id }))
    }
  }, [dispatch, inactivePlayer.id, phase])

  useEffect(() => {
    if (
      phase === 'redraw' &&
      activePlayer.playerReady &&
      inactivePlayer.playerReady
    ) {
      dispatch(startFirstPlayerTurn())
    }
  }, [activePlayer.playerReady, dispatch, inactivePlayer.playerReady, phase])

  useEffect(() => {
    if (
      phase === 'player-turn' &&
      activeHandCount === 0 &&
      activeDeckCount === 0
    ) {
      dispatch(goToEndOfTurn())
    }
  }, [dispatch, phase, activeHandCount, activeDeckCount])

  useEffect(() => {
    if (phase !== 'turn-end') return

    const allActiveCardsActed = activeBoard.every(
      (card) => card.didAct || card.attributes.isStunned,
    )

    if (pendingInstant !== null) return

    if (activeBoard.length === 0) {
      dispatch(switchTurn())
    } else if (inactiveBoardCount === 0) {
      if (allActiveCardsActed) {
        dispatch(switchTurn())
      }
    } else if (allActiveCardsActed) {
      dispatch(switchTurn())
    }
  }, [dispatch, phase, activeBoard, inactiveBoardCount, pendingInstant])
}
