import type { DuelAction, Phase, PlayerId, Stack } from 'src/types'

export type GameEvent =
  | {
      type: 'ACTION_DISPATCHED'
      action: DuelAction
    }
  | {
      type: 'PHASE_CHANGED'
      from: Phase
      to: Phase
    }
  | {
      type: 'TURN_SWITCHED'
      activePlayerId: PlayerId
    }
  | {
      type: 'PLAYER_COINS_CHANGED'
      playerId: PlayerId
      from: number
      to: number
    }
  | {
      type: 'CARD_ZONE_CHANGED'
      cardId: number
      playerId: PlayerId
      from: Stack | null
      to: Stack | null
    }
  | {
      type: 'CARD_STATS_CHANGED'
      cardId: number
      changes: {
        life?: { from: number | undefined; to: number | undefined }
        strength?: { from: number | undefined; to: number | undefined }
        charges?: { from: number | undefined; to: number | undefined }
        stunned?: { from: boolean | undefined; to: boolean | undefined }
        haste?: { from: boolean | undefined; to: boolean | undefined }
      }
    }
  | {
      type: 'CARD_DESTROYED'
      cardId: number
      playerId: PlayerId
    }
