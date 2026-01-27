// Card-related types
export type Faction = "chaos" | "order" | "shadow" | "neutral";
export type CardType = "character" | "instant";
export type CardCategory =
  | "undead"
  | "hammerite"
  | "guard"
  | "servant"
  | "artifact"
  | "thief";

export type CardBaseId =
  | "zombie"
  | "haunt"
  | "cook"
  | "novice"
  | "templeGuard"
  | "sachelman"
  | "yoraSkull"
  | "bookOfAsh"
  | "downwinder";

export interface CardBase {
  id: CardBaseId;
  name: string;
  cost: number;
  description: string[];
  flavorText: string;
  faction: Faction;
  categories: CardCategory[];
  type: CardType;
  strength?: number;
}

export interface CardInstance {
  id: number;
  baseId: CardBaseId;
  type: CardType;
  strength?: number;
}

export type PlayerId = "player1" | "player2";
export type Stack = "hand" | "board" | "deck" | "discard";

export interface Player {
  id: PlayerId;
  name: string;
  coins: number;
  deckIds: number[];
  handIds: number[];
  boardIds: number[];
  discardIds: number[];
}

// Game phase
export type Phase = "intro" | "initial-draw" | "redraw" | "player-turn";

// Duel state
export interface Duel {
  cards: Record<number, CardInstance>;
  players: { player1: Player; player2: Player };
  activePlayerId: PlayerId;
  inactivePlayerId: PlayerId;
  phase: Phase;
  startingPlayerId: PlayerId | null;
}

export type DuelAction =
  | {
      type: "START_DUEL";
      payload: {
        player1Name: string;
        player1Deck: CardBaseId[];
        player2Name: string;
        player2Deck: CardBaseId[];
      };
    }
  | { type: "TRANSITION_PHASE"; payload: Phase }
  | {
      type: "PLAY_CARD";
      payload: { playerId: PlayerId; cardInstanceId: number };
    }
  | { type: "SWITCH_TURN" }
  | { type: "DRAW_CARD"; payload: { playerId: PlayerId } }
  | {
      type: "DISCARD_CARD";
      payload: { playerId: PlayerId; cardInstanceId: number };
    };
