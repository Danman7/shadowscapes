import { createSelector } from '@reduxjs/toolkit'

import type {
  CardInstance,
  PendingCharacterAbility,
  PendingInstant,
  Phase,
  Player,
  PlayerId,
  Stack,
} from 'src/game-engine'
import { useAppSelector } from 'src/store'
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

const selectPlayer = (state: RootState, playerId: PlayerId): Player =>
  state.duel.players[playerId]

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
      return player[stack].flatMap((id: string) => {
        const card = cards[id]

        return card === undefined ? [] : [card]
      })
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
const selectActivePlayerDiscard = makeSelectPlayerCards(
  selectActivePlayerId,
  'discard',
)
const selectInactivePlayerHand = makeSelectPlayerCards(
  selectInactivePlayerId,
  'hand',
)
const selectInactivePlayerBoard = makeSelectPlayerCards(
  selectInactivePlayerId,
  'board',
)
const selectActivePlayerDeck = makeSelectPlayerCards(
  selectActivePlayerId,
  'deck',
)
const selectInactivePlayerDeck = makeSelectPlayerCards(
  selectInactivePlayerId,
  'deck',
)
const selectInactivePlayerDiscard = makeSelectPlayerCards(
  selectInactivePlayerId,
  'discard',
)

export const useDuelPhase = (): Phase =>
  useAppSelector((state) => state.duel.phase)

export const usePlayer = (playerId: PlayerId): Player =>
  useAppSelector((state) => selectPlayer(state, playerId))

export const useActivePlayer = (): Player => useAppSelector(selectActivePlayer)

export const useInactivePlayer = (): Player =>
  useAppSelector(selectInactivePlayer)

export const useActivePlayerHand = (): CardInstance[] =>
  useAppSelector(selectActivePlayerHand)

export const useActivePlayerBoard = (): CardInstance[] =>
  useAppSelector(selectActivePlayerBoard)

export const useActivePlayerDiscard = (): CardInstance[] =>
  useAppSelector(selectActivePlayerDiscard)

export const useInactivePlayerHand = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerHand)

export const useInactivePlayerBoard = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerBoard)

export const useActivePlayerDeck = (): CardInstance[] =>
  useAppSelector(selectActivePlayerDeck)

export const useInactivePlayerDeck = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerDeck)

export const useInactivePlayerDiscard = (): CardInstance[] =>
  useAppSelector(selectInactivePlayerDiscard)

export const usePlayerStackCards = (
  playerId: PlayerId,
  stack: Stack,
): CardInstance[] =>
  useAppSelector((state) => {
    const player = state.duel.players[playerId]

    return player[stack].flatMap((id) => {
      const card = state.duel.cards[id]

      return card === undefined ? [] : [card]
    })
  })

export const usePlayerDeckCount = (playerId: PlayerId): number =>
  usePlayer(playerId).deck.length

export const usePlayerDiscardCount = (playerId: PlayerId): number =>
  usePlayer(playerId).discard.length

export const useActivePlayerCoins = (): number => useActivePlayer().coins

export const useLogs = (): string[] =>
  useAppSelector((state) => state.duel.logs)

export const usePendingInstant = (): PendingInstant | null =>
  useAppSelector((state) => state.duel.pendingInstant)

export const usePendingCharacterAbility = (): PendingCharacterAbility | null =>
  useAppSelector((state) => state.duel.pendingCharacterAbility)
