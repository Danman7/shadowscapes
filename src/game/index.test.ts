import { describe, expect, it } from 'vitest';
import { createDuel, resolveCommand } from './index';
import type { DuelState } from './index';

describe('duel setup', () => {
  it('deals four cards each and draws one more for the starting player', () => {
    const duel = createDuel({
      startingCoins: 10,
      startingPlayer: 0,
      decks: [
        ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
        ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
      ],
    });

    expect(duel).toEqual({
      cards: {},
      startingCoins: 10,
      activePlayer: 0,
      players: [
        {
          coins: 10,
          hand: ['a1', 'a2', 'a3', 'a4', 'a5'],
          deck: ['a6'],
          board: [],
          discard: [],
        },
        {
          coins: 10,
          hand: ['b1', 'b2', 'b3', 'b4'],
          deck: ['b5', 'b6'],
          board: [],
          discard: [],
        },
      ],
    });
  });
});

describe('card setup', () => {
  it('tracks two Novice instances independently and gives Markander five charges even in deck', () => {
    const duel = createDuel({
      startingCoins: 10,
      startingPlayer: 0,
      decks: [['n1', 'n2', 'a', 'b', 'c', 'm'], []],
      cards: { n1: 'novice', n2: 'novice', m: 'markander' },
    });

    expect(duel.cards).toEqual({
      n1: { definitionId: 'novice', strength: 1 },
      n2: { definitionId: 'novice', strength: 1 },
      m: { definitionId: 'markander', strength: 4, charges: 5 },
    });
  });
});

describe('earning a coin', () => {
  function scenario(): DuelState {
    const duel = createDuel({
      startingCoins: 10,
      startingPlayer: 0,
      decks: [[], ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']],
    });

    return {
      ...duel,
      players: [{ ...duel.players[0], coins: 8 }, duel.players[1]],
    };
  }

  it('earns one coin, passes the turn, and draws for the opponent without changing the input', () => {
    const state = scenario();
    const before = structuredClone(state);
    const result = resolveCommand(state, { type: 'earn', player: 0 });

    expect(result.nextState).toEqual({
      ...before,
      activePlayer: 1,
      players: [
        { ...before.players[0], coins: 9 },
        { ...before.players[1], hand: ['b1', 'b2', 'b3', 'b4', 'b5'], deck: ['b6'] },
      ],
    });
    expect(result.events).toEqual([
      { type: 'coin-earned', player: 0, amount: 1 },
      { type: 'turn-started', player: 1 },
      { type: 'card-drawn', player: 1, cardId: 'b5' },
    ]);
    expect(state).toEqual(before);
  });

  it.each([10, 11])('rejects earning at %i coins when the starting amount is 10', (coins) => {
    const state = scenario();
    const capped: DuelState = {
      ...state,
      players: [{ ...state.players[0], coins }, state.players[1]],
    };

    expect(() => resolveCommand(capped, { type: 'earn', player: 0 })).toThrow(
      'Cannot earn at or above starting coins.',
    );
  });

  it('rejects an earn command from the opponent, even below their starting coins', () => {
    const state = scenario();
    const opponentBelowCap: DuelState = {
      ...state,
      players: [state.players[0], { ...state.players[1], coins: 7 }],
    };

    expect(() => resolveCommand(opponentBelowCap, { type: 'earn', player: 1 })).toThrow(
      'Only the active player can act.',
    );
  });

  it.each([0, 1] as const)('prevents further actions when player %i has reached zero coins', (player) => {
    const state = scenario();
    const players: [typeof state.players[0], typeof state.players[1]] = [...state.players];
    players[player] = { ...players[player], coins: 0 };

    expect(() => resolveCommand({ ...state, players }, { type: 'earn', player: 0 })).toThrow(
      'The duel has ended.',
    );
  });
});
