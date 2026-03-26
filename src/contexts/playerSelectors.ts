import { createSelector } from '@reduxjs/toolkit'

import type {
  CardInstance,
  PendingInstant,
  Phase,
  Player,
  PlayerId,
  Stack,
} from 'src/game-engine'
import { useAppSelector } from 'src/hooks'
import type { RootState } from 'src/store'

const selectCards = (state: RootState) => state.duel.cards
const selectPlayers = (state: RootState) => state.duel.players
const selectPlayerOrder = (state: RootState) => state.duel.playerOrder

const selectActivePlayerId = createSelector(
  selectPlayerOrder,
  (order) => order[0],
)

const selectInactivePlayerId = createSelector(
  selectPlayerOrder,
  (order) => order[1],
)

const selectActivePlayer = createSelector(
  selectPlayers,
  selectActivePlayerId,
  (players, id) => players[id],
)

const selectInactivePlayer = createSelector(
  selectPlayers,
  selectInactivePlayerId,
  (players, id) => players[id],
)

const makeSelectPlayerCards = (
  selectPlayerId: (state: RootState) => PlayerId,
  stack: Stack,
) =>
  createSelector(
    selectCards,
    selectPlayers,
    selectPlayerId,
    (cards, players, playerId) => {
      const player = players[playerId]
      return player[stack].map((id: string) => cards[id]!)
    },
  )

const selectActivePlayerHand = makeSelectPlayerCards(
  selectActivePlayerId,
  'hand',
)
const selectActivePlayerBoard = makeSelectPlayerCards(
  selectActivePlayerId,
  'board',
)
const selectInactivePlayerHand = makeSelectPlayerCards(
  selectInactivePlayerId,
  'hand',
)
const selectInactivePlayerBoard = makeSelectPlayerCards(
  selectInactivePlayerId,
  'board',
)

export const useDuelPhase = (): Phase => useAppSelector((s) => s.duel.phase)

export const usePlayer = (playerId: PlayerId): Player =>
  useAppSelector((s) => s.duel.players[playerId])

export const useActivePlayer = (): Player => useAppSelector(selectActivePlayer)

export const useInactivePlayer = (): Player =>
  useAppSelector(selectInactivePlayer)

export const useActivePlayerHand = (): CardInstance[] =>
  useAppSelector(selectActivePlayerHand)

export const useActivePlayerBoard = (): CardInstance[] =>
  useAppSelector(selectActivePlayerBoard)

export const useInactivePlayerHand = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerHand)

export const useInactivePlayerBoard = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerBoard)

export const usePlayerDeckCount = (playerId: PlayerId): number =>
  usePlayer(playerId).deck.length

export const usePlayerDiscardCount = (playerId: PlayerId): number =>
  usePlayer(playerId).discard.length

export const useActivePlayerCoins = (): number => useActivePlayer().coins

export const useLogs = (): string[] => useAppSelector((s) => s.duel.logs)

export const usePendingInstant = (): PendingInstant | null =>
  useAppSelector((s) => s.duel.pendingInstant)
