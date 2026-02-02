import { useGameState } from '@/contexts/GameContext'
import type { CardInstance, Phase, Player, PlayerId, Stack } from '@/types'
import { useMemo } from 'react'

export const useDuelPhase = (): Phase => useGameState().phase

export const usePlayer = (playerId: PlayerId): Player =>
  useGameState().players[playerId]

export const useActivePlayer = (): Player =>
  usePlayer(useGameState().activePlayerId)

export const useInactivePlayer = (): Player =>
  usePlayer(useGameState().inactivePlayerId)

export const usePlayerCards = (
  playerId: PlayerId,
  stack: Stack,
): CardInstance[] => {
  const { cards } = useGameState()

  return useMemo(() => {
    const player = usePlayer(playerId)
    const cardIds = player[stack]

    return cardIds.map((id) => cards[id]!)
  }, [playerId, stack])
}

export const useActivePlayerHand = (): CardInstance[] =>
  usePlayerCards(useGameState().activePlayerId, 'hand')

export const useActivePlayerBoard = (): CardInstance[] =>
  usePlayerCards(useGameState().activePlayerId, 'board')

export const useInactivePlayerBoard = (): CardInstance[] =>
  usePlayerCards(useGameState().inactivePlayerId, 'board')

export const usePlayerDeckCount = (playerId: PlayerId): number =>
  usePlayer(playerId).deck.length

export const usePlayerDiscardCount = (playerId: PlayerId): number =>
  usePlayer(playerId).discard.length
