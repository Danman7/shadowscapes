import type { Duel, PlayerId } from 'src/game-engine/types'

export type CardEffect = (
  state: Duel,
  playerId: PlayerId,
  cardInstanceId: string,
) => Duel
