import { useMemo } from "react";
import { useGameState } from "../contexts/GameContext";
import type {
  CardBaseId,
  CardInstance,
  Phase,
  Player,
  PlayerId,
  Stack,
} from "../types";
import { CARD_BASES } from "../constants/cardBases";
import { getPlayer } from "../game-engine/initialization";

/**
 * Hook to get the current duel phase
 */
export function useDuelPhase(): Phase {
  const { phase } = useGameState();

  return phase;
}

/**
 * Hook to get active player
 */
export function useActivePlayer(): Player {
  const duel = useGameState();

  return getPlayer(duel, duel.activePlayerId);
}

/**
 * Hook to get inactive player
 */
export function useInactivePlayer(): Player {
  const duel = useGameState();

  return getPlayer(duel, duel.inactivePlayerId);
}

/**
 * Hook to get cards for a specific player's stack (hand, board, deck, discard)
 * Returns full card data (instance + base)
 */
export function usePlayerCards(
  playerId: PlayerId,
  stack: Stack,
): Array<CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }> {
  const duel = useGameState();

  return useMemo(() => {
    const player = getPlayer(duel, playerId);
    const stackKey = `${stack}Ids` as
      | "handIds"
      | "boardIds"
      | "deckIds"
      | "discardIds";
    const cardIds = player[stackKey];

    return cardIds.map((id) => {
      const instance = duel.cards[id]!;
      const base = CARD_BASES[instance.baseId]!;
      return { ...instance, base };
    });
  }, [duel, playerId, stack]);
}

/**
 * Hook to get active player's hand cards
 */
export function useActivePlayerHand(): Array<
  CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }
> {
  const { activePlayerId } = useGameState();

  return usePlayerCards(activePlayerId, "hand");
}

/**
 * Hook to get active player's board cards
 */
export function useActivePlayerBoard(): Array<
  CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }
> {
  const { activePlayerId } = useGameState();

  return usePlayerCards(activePlayerId, "board");
}

/**
 * Hook to get inactive player's board cards
 */
export function useInactivePlayerBoard(): Array<
  CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }
> {
  const { inactivePlayerId } = useGameState();
  return usePlayerCards(inactivePlayerId, "board");
}

/**
 * Hook to get deck count for a player
 */
export function usePlayerDeckCount(playerId: PlayerId): number {
  const duel = useGameState();
  const { deckIds } = getPlayer(duel, playerId);

  return deckIds.length;
}

/**
 * Hook to get discard count for a player
 */
export function usePlayerDiscardCount(playerId: PlayerId): number {
  const duel = useGameState();
  const { discardIds } = getPlayer(duel, playerId);

  return discardIds.length;
}
