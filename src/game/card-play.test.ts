import { describe, expect, it } from 'vitest';
import { createDuel, getPlayableCards, resolveCommand } from './index';
import type { CardDefinitionId, DuelState } from './index';

type Card = readonly [id: string, definition: CardDefinitionId, strength?: number];
interface Table {
  hand?: readonly Card[];
  deck?: readonly Card[];
  board?: readonly Card[];
  discard?: readonly Card[];
  enemyHand?: readonly Card[];
  enemyDeck?: readonly Card[];
  enemyBoard?: readonly Card[];
  enemyDiscard?: readonly Card[];
  coins?: number;
}

function table(config: Table = {}): DuelState {
  const cards = [config.hand, config.deck, config.board, config.discard,
    config.enemyHand, config.enemyDeck, config.enemyBoard, config.enemyDiscard].flatMap((zone) => zone ?? []);
  const duel = createDuel({
    startingCoins: 10, startingPlayer: 0, decks: [[], []],
    cards: Object.fromEntries(cards.map(([id, definition]) => [id, definition])),
  });
  const ids = (zone: readonly Card[] | undefined) => (zone ?? []).map(([id]) => id);
  return {
    ...duel,
    cards: Object.fromEntries(cards.map(([id, , strength]) => [id, {
      ...duel.cards[id]!, ...(strength !== undefined ? { strength } : {}),
    }])),
    players: [
      { coins: config.coins ?? 10, hand: ids(config.hand), deck: ids(config.deck), board: ids(config.board), discard: ids(config.discard) },
      { coins: 10, hand: ids(config.enemyHand), deck: ids(config.enemyDeck), board: ids(config.enemyBoard), discard: ids(config.enemyDiscard) },
    ],
  };
}

describe('playing cards', () => {
  it('Book copies Markander with fresh charges and leaves the discarded original in place', () => {
    const initial = table({ hand: [['book', 'book-of-ash']], discard: [['m', 'markander', 0]] });
    const state: DuelState = { ...initial, cards: { ...initial.cards, m: { ...initial.cards.m!, charges: 0, hidden: true, stunnedTurns: 1 } } };
    const result = resolveCommand(state, { type: 'play', player: 0, cardId: 'book', targetId: 'm' });
    const [copyId] = result.nextState.players[0].board;
    expect(copyId).toBeDefined();
    expect(copyId).not.toBe('m');
    expect(result.nextState.cards[copyId!]).toEqual({ definitionId: 'markander', strength: 1, charges: 5 });
    expect(result.nextState.players[0].discard).toEqual(['m', 'book']);
  });

  it.each(['hand', 'discard'] as const)('Markander counts in %s, but never emerges from discard or counts enemy entries', (zone) => {
    const initial = table({
      hand: [['g', 'temple-guard'], ...(zone === 'hand' ? [['m', 'markander'] as const] : [])],
      discard: zone === 'discard' ? [['m', 'markander', 0]] : [],
      enemyDeck: [['enemy-m', 'markander']],
    });
    const state: DuelState = { ...initial, cards: { ...initial.cards, m: { ...initial.cards.m!, charges: 1 } } };
    const { nextState } = resolveCommand(state, { type: 'play', player: 0, cardId: 'g', position: 0 });
    expect(nextState.cards.m?.charges).toBe(0);
    expect(nextState.cards['enemy-m']?.charges).toBe(5);
    expect(nextState.players[0].board).toEqual(zone === 'hand' ? ['g', 'm'] : ['g']);
    expect(nextState.players[0].discard).toEqual(zone === 'discard' ? ['m'] : []);
  });

  it('Markander does not advance his own charges and a stunned Markander still reacts to other Hammerites', () => {
    const state = table({ hand: [['m', 'markander']] });
    const played = resolveCommand(state, { type: 'play', player: 0, cardId: 'm', position: 0 }).nextState;
    expect(played.cards.m?.charges).toBe(5);

    const initial = table({ hand: [['g', 'temple-guard']], board: [['m', 'markander']] });
    const stunned: DuelState = { ...initial, cards: { ...initial.cards, m: { ...initial.cards.m!, stunnedTurns: 1 } } };
    const result = resolveCommand(stunned, { type: 'play', player: 0, cardId: 'g', position: 0 });
    expect(result.nextState.cards.m?.charges).toBe(4);
    expect(result.nextState.cards.m?.stunnedTurns).toBeUndefined();
  });

  it('Book copies Temple Guard at strength 1, then its on-play boost raises it to 2', () => {
    const state = table({ hand: [['book', 'book-of-ash']], discard: [['g', 'temple-guard', -1]], enemyBoard: [['z1', 'zombie'], ['z2', 'zombie']] });
    const { nextState } = resolveCommand(state, { type: 'play', player: 0, cardId: 'book', targetId: 'g' });
    const [copyId] = nextState.players[0].board;
    expect(nextState.cards[copyId!]?.strength).toBe(2);
    expect(nextState.cards.g?.strength).toBe(-1);
    expect(nextState.players[0].discard).toEqual(['g', 'book']);
  });

  it('reports strongest targets for Haunt and the follow-up choices for a Book copy of Haunt', () => {
    const state = table({ hand: [['h', 'haunt'], ['book', 'book-of-ash']], discard: [['dead', 'haunt']], enemyBoard: [['a', 'cook', 2], ['b', 'cook', 2], ['c', 'cook', 1]] });
    expect(getPlayableCards(state, 0)).toEqual([
      { cardId: 'h', coinsAfterPayment: 7, targetIds: ['a', 'b'] },
      { cardId: 'book', coinsAfterPayment: 6, targetIds: ['dead'], effectTargetIds: { dead: ['a', 'b'] } },
    ]);
  });
  it('offers no plays out of turn or after either player has lost', () => {
    const state = table({ hand: [['n', 'novice']], enemyHand: [['z', 'zombie']] });
    expect(getPlayableCards(state, 1)).toEqual([]);
    for (const loser of [0, 1] as const) {
      const players = [...state.players] as [typeof state.players[0], typeof state.players[1]];
      players[loser] = { ...players[loser], coins: 0 };
      expect(getPlayableCards({ ...state, players }, 0)).toEqual([]);
    }
  });
  it('omits required-target instants when no eligible target exists and lists Book’s character targets', () => {
    const state = table({ hand: [['book', 'book-of-ash'], ['bomb', 'flash-bomb']], discard: [['oldBomb', 'flash-bomb']] });
    expect(getPlayableCards(state, 0)).toEqual([]);
    const withTarget = table({ hand: [['book', 'book-of-ash']], discard: [['z', 'zombie', 0], ['oldBomb', 'flash-bomb']] });
    expect(getPlayableCards(withTarget, 0)).toEqual([{ cardId: 'book', coinsAfterPayment: 6, targetIds: ['z'] }]);
  });
  it('reports affordable plays, remaining coins and eligible target choices without changing state', () => {
    const initial = table({
      hand: [['n', 'novice'], ['g', 'temple-guard'], ['m', 'markander'], ['book', 'book-of-ash'], ['bomb', 'flash-bomb']],
      enemyBoard: [['visible', 'zombie'], ['hidden', 'haunt']], coins: 3,
    });
    const state = { ...initial, cards: { ...initial.cards, hidden: { ...initial.cards.hidden!, hidden: true } } };
    const before = structuredClone(state);
    expect(getPlayableCards(state, 0)).toEqual([
      { cardId: 'n', coinsAfterPayment: 2, targetIds: [] },
      { cardId: 'g', coinsAfterPayment: 0, targetIds: [] },
      { cardId: 'bomb', coinsAfterPayment: 1, targetIds: ['visible'] },
    ]);
    expect(state).toEqual(before);
  });
  it.each([undefined, 'ally', 'discarded', 'hidden', 'missing'])('Flash Bomb rejects a missing or ineligible target before payment: %s', (targetId) => {
    const initial = table({ hand: [['bomb', 'flash-bomb']], board: [['ally', 'cook']], enemyBoard: [['hidden', 'haunt']], enemyDiscard: [['discarded', 'zombie']], coins: 2 });
    const state = { ...initial, cards: { ...initial.cards, hidden: { ...initial.cards.hidden!, hidden: true } } };
    const play = { type: 'play' as const, player: 0 as const, cardId: 'bomb', ...(targetId !== undefined ? { targetId } : {}) };
    expect(() => resolveCommand(state, play)).toThrow('Choose a visible enemy character.');
  });
  it('Flash Bomb stuns a visible enemy through its owner’s next turn, then expires', () => {
    const state = table({ hand: [['bomb', 'flash-bomb']], enemyHand: [['c', 'cook']], enemyBoard: [['g', 'temple-guard']] });
    const before = structuredClone(state);
    const result = resolveCommand(state, { type: 'play', player: 0, cardId: 'bomb', targetId: 'g' });
    expect(result.nextState.cards.g?.stunnedTurns).toBe(1);
    expect(result.nextState.players[0].discard).toEqual(['bomb']);
    expect(result.nextState.players[0].board).toEqual([]);
    expect(result.events[2]).toEqual({ type: 'character-stunned', player: 1, cardId: 'g', turns: 1 });
    const following = resolveCommand(result.nextState, { type: 'play', player: 1, cardId: 'c', position: 0 });
    expect(following.nextState.cards.g?.stunnedTurns).toBeUndefined();
    expect(following.events.at(-2)).toEqual({ type: 'stun-expired', player: 1, cardId: 'g' });
    expect(state).toEqual(before);
  });
  it('Book validates a copied Haunt’s tie choice before payment, then resolves its damage', () => {
    const state = table({ hand: [['book', 'book-of-ash']], discard: [['h', 'haunt', 0]], enemyBoard: [['a', 'cook', 2], ['b', 'cook', 2]], coins: 4 });
    const play = { type: 'play' as const, player: 0 as const, cardId: 'book', targetId: 'h' };
    expect(() => resolveCommand(state, play)).toThrow('Choose a strongest enemy character.');
    const surviving = { ...state, players: [{ ...state.players[0], coins: 10 }, state.players[1]] as const };
    const { nextState } = resolveCommand(surviving, { ...play, effectTargetId: 'b' });
    expect(nextState.cards.b?.strength).toBe(1);
    expect(nextState.cards.a?.strength).toBe(2);
    expect(nextState.players[0].discard).toEqual(['h', 'book']);
  });
  it.each([undefined, 'enemy', 'instant', 'live'])('Book requires a selected character in your own discard: %s', (targetId) => {
    const state = table({ hand: [['book', 'book-of-ash']], board: [['live', 'cook']], discard: [['instant', 'flash-bomb']], enemyDiscard: [['enemy', 'zombie']], coins: 4 });
    const before = structuredClone(state);
    const play = { type: 'play' as const, player: 0 as const, cardId: 'book', ...(targetId !== undefined ? { targetId } : {}) };
    expect(() => resolveCommand(state, play)).toThrow('Choose a character in your discard.');
    expect(state).toEqual(before);
  });
  it('Book of Ash summons a fresh strength-1 Zombie copy which revives the originals, then discards', () => {
    const initial = table({ hand: [['book', 'book-of-ash']], board: [['c', 'cook']], discard: [['z1', 'zombie', 0], ['z2', 'zombie', -1]] });
    const state: DuelState = { ...initial, cards: { ...initial.cards, z1: { ...initial.cards.z1!, hidden: true, stunnedTurns: 1 } } };
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'book', targetId: 'z1' });
    const copy = events.find((event) => event.type === 'copy-created');
    expect(copy).toMatchObject({ type: 'copy-created', player: 0, sourceId: 'z1' });
    if (copy?.type !== 'copy-created') throw new Error('Expected a created copy.');
    expect(nextState.players[0].board).toEqual(['c', copy.cardId, 'z1', 'z2']);
    expect(nextState.cards[copy.cardId]).toEqual({ definitionId: 'zombie', strength: 1 });
    expect(nextState.cards.z1).toEqual({ definitionId: 'zombie', strength: 1 });
    expect(nextState.players[0].discard).toEqual(['book']);
    expect(nextState.players[0].coins).toBe(6);
    expect(events.at(-2)).toEqual({ type: 'card-discarded', player: 0, cardId: 'book', reason: 'resolved' });
    expect(state).toEqual(before);
  });
  it.each(['deck', 'hand'] as const)('Markander arrives from %s after the whole Novice summon chain finishes', (zone) => {
    const initial = table({
      hand: [['n', 'novice'], ...(zone === 'hand' ? [['m', 'markander'] as const] : [])],
      deck: [['nd', 'novice'], ...(zone === 'deck' ? [['m', 'markander'] as const] : [])],
      board: [['g', 'temple-guard']],
    });
    const state: DuelState = { ...initial, cards: { ...initial.cards, m: { ...initial.cards.m!, charges: 1 } } };
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'n', position: 1 });
    expect(nextState.players[0].board).toEqual(['g', 'n', 'nd', 'm']);
    expect(nextState.players[0][zone]).not.toContain('m');
    expect(nextState.cards.m?.charges).toBe(0);
    expect(nextState.players[0].coins).toBe(9);
    expect(events.filter((event) => event.type === 'character-summoned').map((event) => event.cardId)).toEqual(['nd', 'm']);
  });
  it('Markander in deck loses a charge for an allied Hammerite entering play', () => {
    const state = table({ hand: [['g', 'temple-guard']], deck: [['m', 'markander']] });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'g', position: 0 });
    expect(nextState.cards.m?.charges).toBe(4);
    expect(events[2]).toEqual({ type: 'charge-removed', player: 0, cardId: 'm', remaining: 4 });
    expect(state).toEqual(before);
  });
  it('Haunt immediately discards a character reduced to zero strength', () => {
    const state = table({ hand: [['h', 'haunt']], enemyBoard: [['z', 'zombie']] });
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'h', position: 0 });
    expect(nextState.players[1].board).toEqual([]);
    expect(nextState.players[1].discard).toEqual(['z']);
    expect(events.slice(2)).toEqual([
      { type: 'damage-dealt', sourceId: 'h', targetId: 'z', amount: 1 },
      { type: 'card-discarded', player: 1, cardId: 'z', reason: 'defeated' },
      { type: 'turn-started', player: 1 },
    ]);
  });
  it('requires Haunt’s owner to choose an eligible strongest enemy when tied', () => {
    const state = table({ hand: [['h', 'haunt']], enemyBoard: [['a', 'cook', 2], ['b', 'cook', 2], ['c', 'cook', 1]] });
    const before = structuredClone(state);
    const play = { type: 'play' as const, player: 0 as const, cardId: 'h', position: 0 };
    expect(() => resolveCommand(state, play)).toThrow('Choose a strongest enemy character.');
    expect(() => resolveCommand(state, { ...play, targetId: 'c' })).toThrow('Choose a strongest enemy character.');
    const { nextState } = resolveCommand(state, { ...play, targetId: 'b' });
    expect([nextState.cards.a?.strength, nextState.cards.b?.strength]).toEqual([2, 1]);
    expect(state).toEqual(before);
  });
  it('Haunt damages the strongest visible enemy using current strength, without retaliation', () => {
    const initial = table({ hand: [['h', 'haunt']], enemyBoard: [['weak', 'temple-guard', 1], ['strong', 'cook', 2], ['hidden', 'markander', 8]] });
    const state: DuelState = { ...initial, cards: { ...initial.cards, hidden: { ...initial.cards.hidden!, hidden: true } } };
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'h', position: 0 });
    expect(nextState.cards.strong?.strength).toBe(1);
    expect(nextState.cards.weak?.strength).toBe(1);
    expect(nextState.cards.hidden?.strength).toBe(8);
    expect(nextState.cards.h?.strength).toBe(3);
    expect(events[2]).toEqual({ type: 'damage-dealt', sourceId: 'h', targetId: 'strong', amount: 1 });
    expect(state).toEqual(before);
  });
  it('Zombie revives all discarded Zombies at printed strength without reviving itself again', () => {
    const state = table({
      hand: [['z', 'zombie']], board: [['c', 'cook']],
      discard: [['z1', 'zombie', 0], ['g', 'temple-guard', -1]],
      deck: [['reserve', 'cook']],
    });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'z', position: 0 });
    expect(nextState.players[0].board).toEqual(['z', 'z1', 'c']);
    expect(nextState.players[0].discard).toEqual(['g']);
    expect(nextState.players[0].deck).toEqual(['reserve']);
    expect(nextState.cards.z1?.strength).toBe(1);
    expect(events.filter((event) => event.type === 'character-summoned')).toHaveLength(1);
    expect(state).toEqual(before);
  });
  it.each([
    { board: [['c', 'cook', 5]], enemyBoard: [] },
    { board: [['g', 'temple-guard', 1]], enemyBoard: [['h', 'haunt', 5]] },
  ] as const)('Novice ignores stronger non-Hammerites, equal allies and enemies: %j', (scenario) => {
    const state = table({ ...scenario, hand: [['n', 'novice'], ['other', 'novice']] });
    const { nextState } = resolveCommand(state, { type: 'play', player: 0, cardId: 'n', position: 0 });
    expect(nextState.players[0].hand).toEqual(['other']);
  });
  it.each(['deck', 'hand'] as const)('Novice summons a %s copy beside itself when a stronger allied Hammerite exists', (zone) => {
    const state = table({
      hand: [['n', 'novice'], ...(zone === 'hand' ? [['other', 'novice'] as const] : [])],
      deck: [...(zone === 'deck' ? [['other', 'novice'] as const] : []), ['c', 'cook']],
      board: [['g', 'temple-guard'], ['tail', 'cook']],
    });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'n', position: 1 });
    expect(nextState.players[0]).toEqual({ coins: 9, hand: [], deck: ['c'], board: ['g', 'n', 'other', 'tail'], discard: [] });
    expect(events.filter((event) => event.type === 'character-summoned')).toEqual([
      { type: 'character-summoned', player: 0, cardId: 'other', from: zone, position: 2 },
    ]);
    expect(state).toEqual(before);
  });
  it('Temple Guard boosts only when the opponent still has more characters after insertion', () => {
    const state = table({ hand: [['g', 'temple-guard']], enemyBoard: [['z1', 'zombie'], ['z2', 'zombie']] });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'g', position: 0 });
    expect(nextState.cards.g?.strength).toBe(4);
    expect(events[2]).toEqual({ type: 'strength-boosted', player: 0, cardId: 'g', amount: 1 });
    expect(state).toEqual(before);

    const tied = table({ hand: [['g', 'temple-guard']], board: [['c', 'cook']], enemyBoard: [['z1', 'zombie'], ['z2', 'zombie']] });
    expect(resolveCommand(tied, { type: 'play', player: 0, cardId: 'g', position: 1 }).nextState.cards.g?.strength).toBe(3);
  });
  it('Cook draws on play before the opponent’s turn begins', () => {
    const state = table({ hand: [['c', 'cook']], deck: [['n', 'novice'], ['g', 'temple-guard']] });
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'c', position: 0 });
    expect(nextState.players[0].hand).toEqual(['n']);
    expect(nextState.players[0].deck).toEqual(['g']);
    expect(events.slice(2)).toEqual([
      { type: 'card-drawn', player: 0, cardId: 'n' },
      { type: 'turn-started', player: 1 },
    ]);
  });
  it('loses immediately on the final coin before the card leaves hand or effects and turns resolve', () => {
    const state = table({ hand: [['c', 'cook']], deck: [['n', 'novice']], enemyDeck: [['z', 'zombie']], coins: 2 });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'c', position: 0 });
    expect(nextState).toEqual({ ...before, players: [{ ...before.players[0], coins: 0 }, before.players[1]] });
    expect(events).toEqual([
      { type: 'coins-paid', player: 0, cardId: 'c', amount: 2 },
      { type: 'duel-ended', loser: 0, winner: 1 },
    ]);
    expect(() => resolveCommand(nextState, { type: 'play', player: 0, cardId: 'c', position: 0 })).toThrow('The duel has ended.');
    expect(state).toEqual(before);
  });
  it.each([undefined, -1, 2, 0.5, NaN])('rejects invalid character insertion position %s', (position) => {
    const state = table({ hand: [['n', 'novice']], board: [['c', 'cook']] });
    const command = { type: 'play' as const, player: 0 as const, cardId: 'n', ...(position !== undefined ? { position } : {}) };
    expect(() => resolveCommand(state, command)).toThrow('Choose a valid board position.');
  });
  it('rejects spending more coins than the player has', () => {
    const state = table({ hand: [['g', 'temple-guard']], coins: 2 });
    expect(() => resolveCommand(state, { type: 'play', player: 0, cardId: 'g', position: 0 })).toThrow('Not enough coins.');
  });
  it('rejects a card outside the active player’s hand before paying', () => {
    const state = table({ enemyHand: [['n', 'novice']] });
    const before = structuredClone(state);
    expect(() => resolveCommand(state, { type: 'play', player: 0, cardId: 'n', position: 0 })).toThrow('Card is not in your hand.');
    expect(state).toEqual(before);
  });
  it('pays for a Novice, inserts it, passes control and draws without changing the input', () => {
    const state = table({ hand: [['n', 'novice']], board: [['c', 'cook']], enemyDeck: [['z', 'zombie']] });
    const before = structuredClone(state);
    const { nextState, events } = resolveCommand(state, { type: 'play', player: 0, cardId: 'n', position: 0 });

    expect(nextState.players[0]).toEqual({ coins: 9, hand: [], deck: [], board: ['n', 'c'], discard: [] });
    expect(nextState.activePlayer).toBe(1);
    expect(nextState.players[1].hand).toEqual(['z']);
    expect(events).toEqual([
      { type: 'coins-paid', player: 0, cardId: 'n', amount: 1 },
      { type: 'card-played', player: 0, cardId: 'n', position: 0 },
      { type: 'turn-started', player: 1 },
      { type: 'card-drawn', player: 1, cardId: 'z' },
    ]);
    expect(state).toEqual(before);
  });
});
