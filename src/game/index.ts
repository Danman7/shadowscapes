import { CARD_DEFINITIONS, freshCard } from './cards';
import type { CardDefinitionId, CardInstance } from './cards';
export { CARD_DEFINITIONS } from './cards';
export type { CardDefinition, CardDefinitionId, CardInstance } from './cards';

export type PlayerIndex = 0 | 1;

export interface PlayerState {
  readonly coins: number;
  readonly deck: readonly string[];
  readonly hand: readonly string[];
  readonly board: readonly string[];
  readonly discard: readonly string[];
}

export interface DuelState {
  readonly cards: Readonly<Record<string, CardInstance>>;
  readonly startingCoins: number;
  readonly activePlayer: PlayerIndex;
  readonly players: readonly [PlayerState, PlayerState];
}

export interface DuelConfig {
  /** Instance ID -> catalog definition ID. Required for each card used in card play. */
  readonly cards?: Readonly<Record<string, CardDefinitionId>>;
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
    cards: Object.fromEntries(
      Object.entries(config.cards ?? {}).map(([id, definition]) => [id, freshCard(definition)]),
    ),
    startingCoins: config.startingCoins,
    activePlayer: config.startingPlayer,
    players: [preparePlayer(0), preparePlayer(1)],
  };
}

export type DuelCommand = { readonly type: 'earn'; readonly player: PlayerIndex } | PlayCommand;

export interface PlayCommand {
  readonly type: 'play';
  readonly player: PlayerIndex;
  readonly cardId: string;
  readonly position?: number;
  /** Flash Bomb enemy, Book discard character, or Haunt's strongest enemy choice. */
  readonly targetId?: string;
  /** Strongest enemy choice when Book copies Haunt. */
  readonly effectTargetId?: string;
}

function strongestTargets(cards: Readonly<Record<string, CardInstance>>, board: readonly string[]): string[] {
  const visible = board.filter((id) => !cards[id]!.hidden);
  const strength = Math.max(...visible.map((id) => cards[id]!.strength!));
  return visible.filter((id) => cards[id]!.strength === strength);
}

function chooseHauntTarget(cards: Readonly<Record<string, CardInstance>>, board: readonly string[], selected?: string): string | undefined {
  const targets = strongestTargets(cards, board);
  if ((selected !== undefined && !targets.includes(selected)) || (selected === undefined && targets.length > 1)) {
    throw new Error('Choose a strongest enemy character.');
  }
  return selected ?? targets[0];
}

export interface PlayableCard {
  readonly cardId: string;
  readonly coinsAfterPayment: number;
  readonly targetIds: readonly string[];
  /** Book discard target ID -> available targets for a copied Haunt's on-play effect. */
  readonly effectTargetIds?: Readonly<Record<string, readonly string[]>>;
}

export function getPlayableCards(state: DuelState, player: PlayerIndex): readonly PlayableCard[] {
  if (player !== state.activePlayer || state.players.some((owner) => owner.coins <= 0)) return [];
  const result: PlayableCard[] = [];
  const owner = state.players[player];
  const enemy = state.players[player === 0 ? 1 : 0];
  for (const cardId of owner.hand) {
    const card = state.cards[cardId];
    if (card === undefined) continue;
    const definition = CARD_DEFINITIONS[card.definitionId];
    if (definition.cost > owner.coins) continue;
    let targetIds: string[] = [];
    if (card.definitionId === 'flash-bomb') targetIds = enemy.board.filter((id) => !state.cards[id]!.hidden);
    if (card.definitionId === 'book-of-ash') targetIds = owner.discard.filter((id) => CARD_DEFINITIONS[state.cards[id]!.definitionId].type === 'character');
    if (card.definitionId === 'haunt') targetIds = strongestTargets(state.cards, enemy.board);
    if ((card.definitionId === 'flash-bomb' || card.definitionId === 'book-of-ash') && targetIds.length === 0) continue;
    const effectTargetIds = card.definitionId === 'book-of-ash'
      ? Object.fromEntries(targetIds.filter((id) => state.cards[id]!.definitionId === 'haunt').map((id) => [id, strongestTargets(state.cards, enemy.board)]))
      : {};
    result.push({
      cardId,
      coinsAfterPayment: owner.coins - definition.cost,
      targetIds,
      ...(Object.keys(effectTargetIds).length > 0 ? { effectTargetIds } : {}),
    });
  }
  return result;
}

export type DuelEvent =
  | { readonly type: 'character-stunned'; readonly player: PlayerIndex; readonly cardId: string; readonly turns: number }
  | { readonly type: 'stun-expired'; readonly player: PlayerIndex; readonly cardId: string }
  | { readonly type: 'copy-created'; readonly player: PlayerIndex; readonly sourceId: string; readonly cardId: string }
  | { readonly type: 'charge-removed'; readonly player: PlayerIndex; readonly cardId: string; readonly remaining: number }
  | { readonly type: 'card-discarded'; readonly player: PlayerIndex; readonly cardId: string; readonly reason: 'defeated' | 'resolved' }
  | { readonly type: 'damage-dealt'; readonly sourceId: string; readonly targetId: string; readonly amount: number }
  | { readonly type: 'character-summoned'; readonly player: PlayerIndex; readonly cardId: string; readonly from: 'deck' | 'hand' | 'discard' | 'copy'; readonly position: number }
  | { readonly type: 'strength-boosted'; readonly player: PlayerIndex; readonly cardId: string; readonly amount: number }
  | { readonly type: 'duel-ended'; readonly loser: PlayerIndex; readonly winner: PlayerIndex }
  | { readonly type: 'coins-paid'; readonly player: PlayerIndex; readonly cardId: string; readonly amount: number }
  | { readonly type: 'card-played'; readonly player: PlayerIndex; readonly cardId: string; readonly position?: number }
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

  if (command.type === 'earn' && state.players[command.player].coins >= state.startingCoins) {
    throw new Error('Cannot earn at or above starting coins.');
  }

  const nextPlayer: PlayerIndex = command.player === 0 ? 1 : 0;
  const players: [PlayerState, PlayerState] = [...state.players];
  const cards = { ...state.cards };
  const events: DuelEvent[] = [];

  function draw(player: PlayerIndex): void {
    const [cardId, ...deck] = players[player].deck;
    if (cardId === undefined) return;
    players[player] = { ...players[player], deck, hand: [...players[player].hand, cardId] };
    events.push({ type: 'card-drawn', player, cardId });
  }

  function summon(cardId: string, from: 'deck' | 'hand' | 'discard', position: number): void {
    const player = players[command.player];
    if (!player[from].includes(cardId)) return;
    const board = [...player.board];
    board.splice(position, 0, cardId);
    players[command.player] = { ...player, [from]: player[from].filter((id) => id !== cardId), board };
    const card = cards[cardId]!;
    cards[cardId] = { ...freshCard(card.definitionId), ...(card.charges !== undefined ? { charges: card.charges } : {}) };
    events.push({ type: 'character-summoned', player: command.player, cardId, from, position });
    onPlay(cardId);
  }

  function onPlay(cardId: string, selectedTarget?: string): void {
    const card = cards[cardId]!;
    if (card.definitionId === 'flash-bomb') {
      const targetId = selectedTarget!;
      cards[targetId] = { ...cards[targetId]!, stunnedTurns: 1 };
      events.push({ type: 'character-stunned', player: nextPlayer, cardId: targetId, turns: 1 });
    }
    if (card.definitionId === 'book-of-ash' && command.type === 'play') {
      const sourceId = command.targetId!;
      let serial = 1;
      while (cards[`${cardId}:copy:${serial}`] !== undefined) serial++;
      const copyId = `${cardId}:copy:${serial}`;
      cards[copyId] = { ...freshCard(cards[sourceId]!.definitionId), strength: 1 };
      const owner = players[command.player];
      const position = owner.board.length;
      players[command.player] = { ...owner, board: [...owner.board, copyId] };
      events.push(
        { type: 'copy-created', player: command.player, sourceId, cardId: copyId },
        { type: 'character-summoned', player: command.player, cardId: copyId, from: 'copy', position },
      );
      onPlay(copyId, command.effectTargetId);
    }
    if (card.definitionId === 'haunt') {
      const targetId = chooseHauntTarget(cards, players[nextPlayer].board, selectedTarget);
      if (targetId !== undefined) {
        cards[targetId] = { ...cards[targetId]!, strength: cards[targetId]!.strength! - 1 };
        events.push({ type: 'damage-dealt', sourceId: cardId, targetId, amount: 1 });
        if (cards[targetId]!.strength! <= 0) {
          const enemy = players[nextPlayer];
          players[nextPlayer] = { ...enemy, board: enemy.board.filter((id) => id !== targetId), discard: [...enemy.discard, targetId] };
          events.push({ type: 'card-discarded', player: nextPlayer, cardId: targetId, reason: 'defeated' });
        }
      }
    }
    if (card.definitionId === 'zombie') {
      for (const id of players[command.player].discard) {
        if (cards[id]?.definitionId === 'zombie') summon(id, 'discard', players[command.player].board.indexOf(cardId) + 1);
      }
    }
    if (card.definitionId === 'cook') draw(command.player);
    if (card.definitionId === 'temple-guard' && players[nextPlayer].board.length > players[command.player].board.length) {
      cards[cardId] = { ...card, strength: card.strength! + 1 };
      events.push({ type: 'strength-boosted', player: command.player, cardId, amount: 1 });
    }
    if (card.definitionId === 'novice' && players[command.player].board.some((id) =>
      id !== cardId && CARD_DEFINITIONS[cards[id]!.definitionId].categories.includes('Hammerite') && cards[id]!.strength! > card.strength!,
    )) {
      for (const zone of ['deck', 'hand'] as const) {
        for (const id of players[command.player][zone]) {
          if (cards[id]?.definitionId === 'novice') summon(id, zone, players[command.player].board.indexOf(cardId) + 1);
        }
      }
    }
    if (CARD_DEFINITIONS[card.definitionId].categories.includes('Hammerite')) {
      const owner = players[command.player];
      for (const id of [...owner.deck, ...owner.hand, ...owner.board, ...owner.discard]) {
        const marker = cards[id];
        if (id !== cardId && marker?.definitionId === 'markander' && marker.charges! > 0) {
          const remaining = marker.charges! - 1;
          cards[id] = { ...marker, charges: remaining };
          events.push({ type: 'charge-removed', player: command.player, cardId: id, remaining });
        }
      }
    }
  }
  if (command.type === 'earn') {
    players[command.player] = { ...players[command.player], coins: players[command.player].coins + 1 };
    events.push({ type: 'coin-earned', player: command.player, amount: 1 });
  } else {
    if (!players[command.player].hand.includes(command.cardId)) {
      throw new Error('Card is not in your hand.');
    }
    const card = cards[command.cardId]!;
    const definition = CARD_DEFINITIONS[card.definitionId];
    const player = players[command.player];
    if (player.coins < definition.cost) throw new Error('Not enough coins.');
    if (definition.type === 'character' && (command.position === undefined || !Number.isInteger(command.position) || command.position < 0 || command.position > player.board.length)) {
      throw new Error('Choose a valid board position.');
    }
    if (card.definitionId === 'haunt') chooseHauntTarget(cards, players[nextPlayer].board, command.targetId);
    if (card.definitionId === 'flash-bomb' &&
      (command.targetId === undefined || !players[nextPlayer].board.includes(command.targetId) || cards[command.targetId]!.hidden)) {
      throw new Error('Choose a visible enemy character.');
    }
    if (card.definitionId === 'book-of-ash' &&
      (command.targetId === undefined || !player.discard.includes(command.targetId) || CARD_DEFINITIONS[cards[command.targetId]!.definitionId].type !== 'character')) {
      throw new Error('Choose a character in your discard.');
    }
    if (card.definitionId === 'book-of-ash' && cards[command.targetId!]?.definitionId === 'haunt') {
      chooseHauntTarget(cards, players[nextPlayer].board, command.effectTargetId);
    }
    players[command.player] = { ...player, coins: player.coins - definition.cost };
    events.push({ type: 'coins-paid', player: command.player, cardId: command.cardId, amount: definition.cost });
    if (players[command.player].coins === 0) {
      events.push({ type: 'duel-ended', loser: command.player, winner: nextPlayer });
      return { nextState: { ...state, players }, events };
    }
    const board = [...player.board];
    if (definition.type === 'character') board.splice(command.position!, 0, command.cardId);
    players[command.player] = {
      ...players[command.player],
      hand: player.hand.filter((id) => id !== command.cardId), board,
    };
    events.push({ type: 'card-played', player: command.player, cardId: command.cardId, ...(definition.type === 'character' ? { position: command.position! } : {}) });
    onPlay(command.cardId, command.targetId);
    // Automatic arrivals wait until the entire on-play chain, including deaths, has resolved.
    for (const zone of ['deck', 'hand'] as const) {
      let ready: string | undefined;
      while ((ready = players[command.player][zone].find((id) => cards[id]?.definitionId === 'markander' && cards[id]!.charges === 0)) !== undefined) {
        summon(ready, zone, players[command.player].board.length);
      }
    }
    if (definition.type === 'instant') {
      const owner = players[command.player];
      players[command.player] = { ...owner, discard: [...owner.discard, command.cardId] };
      events.push({ type: 'card-discarded', player: command.player, cardId: command.cardId, reason: 'resolved' });
    }
  }
  for (const id of players[command.player].board) {
    const card = cards[id]!;
    if (card.stunnedTurns === 1) {
      const { stunnedTurns: _expired, ...rest } = card;
      cards[id] = rest;
      events.push({ type: 'stun-expired', player: command.player, cardId: id });
    }
  }
  events.push({ type: 'turn-started', player: nextPlayer });
  draw(nextPlayer);

  return {
    nextState: { ...state, activePlayer: nextPlayer, players, cards },
    events,
  };
}
