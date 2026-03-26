import { useGameState } from 'src/contexts/GameContext'
import type {
  CardInstance,
  PendingInstant,
  Phase,
  Player,
  PlayerId,
  Stack,
} from 'src/game-engine/types'
import { useMemo } from 'react'

export const useDuelPhase = (): Phase => useGameState().phase

export const usePlayer = (playerId: PlayerId): Player =>
  useGameState().players[playerId]

export const useActivePlayer = (): Player =>
  usePlayer(useGameState().playerOrder[0])

export const useInactivePlayer = (): Player =>
  usePlayer(useGameState().playerOrder[1])

const usePlayerCards = (playerId: PlayerId, stack: Stack): CardInstance[] => {
  const { cards } = useGameState()
  const player = usePlayer(playerId)

  return useMemo(() => {
    const cardIds = player[stack]
    return cardIds.map((id) => cards[id]!)
  }, [cards, player, stack])
}

export const useActivePlayerHand = (): CardInstance[] =>
  usePlayerCards(useGameState().playerOrder[0], 'hand')

export const useActivePlayerBoard = (): CardInstance[] =>
  usePlayerCards(useGameState().playerOrder[0], 'board')

export const useInactivePlayerHand = (): CardInstance[] =>
  usePlayerCards(useGameState().playerOrder[1], 'hand')

export const useInactivePlayerBoard = (): CardInstance[] =>
  usePlayerCards(useGameState().playerOrder[1], 'board')

export const usePlayerDeckCount = (playerId: PlayerId): number =>
  usePlayer(playerId).deck.length

export const usePlayerDiscardCount = (playerId: PlayerId): number =>
  usePlayer(playerId).discard.length

export const useActivePlayerCoins = (): number => useActivePlayer().coins

export const useLogs = (): string[] => useGameState().logs

export const usePendingInstant = (): PendingInstant | null =>
  useGameState().pendingInstant
