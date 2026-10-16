export type PlayerIndex = 0 | 1;

export interface PlayerState {
  readonly coins: number;
  readonly deck: readonly string[];
  readonly hand: readonly string[];
  readonly board: readonly string[];
  readonly discard: readonly string[];
}

export interface DuelState {
  readonly startingCoins: number;
  readonly activePlayer: PlayerIndex;
  readonly players: readonly [PlayerState, PlayerState];
}

export interface DuelConfig {
  readonly startingCoins: number;
  readonly startingPlayer: PlayerIndex;
  /** Ordered card-instance IDs; index zero is the top of the deck. */
  readonly decks: readonly [readonly string[], readonly string[]];
}

export function createDuel(config: DuelConfig): DuelState {
  function preparePlayer(player: PlayerIndex): PlayerState {
    const drawCount = player === config.startingPlayer ? 5 : 4;

    return {
      coins: config.startingCoins,
      hand: config.decks[player].slice(0, drawCount),
      deck: config.decks[player].slice(drawCount),
      board: [],
      discard: [],
    };
  }

  return {
    startingCoins: config.startingCoins,
    activePlayer: config.startingPlayer,
    players: [preparePlayer(0), preparePlayer(1)],
  };
}

export interface DuelCommand {
  readonly type: 'earn';
  readonly player: PlayerIndex;
}

export type DuelEvent =
  | { readonly type: 'coin-earned'; readonly player: PlayerIndex; readonly amount: number }
  | { readonly type: 'turn-started'; readonly player: PlayerIndex }
  | { readonly type: 'card-drawn'; readonly player: PlayerIndex; readonly cardId: string };

export function resolveCommand(
  state: DuelState,
  command: DuelCommand,
): { nextState: DuelState; events: readonly DuelEvent[] } {
  if (state.players.some((player) => player.coins <= 0)) {
    throw new Error('The duel has ended.');
  }

  if (command.player !== state.activePlayer) {
    throw new Error('Only the active player can act.');
  }

  if (state.players[command.player].coins >= state.startingCoins) {
    throw new Error('Cannot earn at or above starting coins.');
  }

  const nextPlayer: PlayerIndex = command.player === 0 ? 1 : 0;
  const players: [PlayerState, PlayerState] = [...state.players];
  players[command.player] = {
    ...players[command.player],
    coins: players[command.player].coins + 1,
  };

  const events: DuelEvent[] = [
    { type: 'coin-earned', player: command.player, amount: 1 },
    { type: 'turn-started', player: nextPlayer },
  ];
  const [cardId, ...remainingDeck] = players[nextPlayer].deck;

  if (cardId !== undefined) {
    players[nextPlayer] = {
      ...players[nextPlayer],
      hand: [...players[nextPlayer].hand, cardId],
      deck: remainingDeck,
    };
    events.push({ type: 'card-drawn', player: nextPlayer, cardId });
  }

  return {
    nextState: { ...state, activePlayer: nextPlayer, players },
    events,
  };
}
