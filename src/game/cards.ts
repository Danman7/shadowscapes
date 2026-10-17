export type CardDefinitionId =
  | 'novice' | 'temple-guard' | 'markander' | 'zombie'
  | 'haunt' | 'book-of-ash' | 'cook' | 'flash-bomb';

export interface CardDefinition {
  readonly name: string;
  readonly faction: 'Order' | 'Chaos' | 'Neutral';
  readonly categories: readonly string[];
  readonly classification: 'common' | 'elite';
  readonly type: 'character' | 'instant';
  readonly cost: number;
  readonly strength?: number;
  readonly startingCharges?: number;
  readonly description: string;
}

export const CARD_DEFINITIONS: Readonly<Record<CardDefinitionId, CardDefinition>> = {
  novice: {
    name: 'Novice', faction: 'Order', categories: ['Hammerite'], classification: 'common',
    type: 'character', cost: 1, strength: 1,
    description: 'On play, if a stronger allied Hammerite is on board, summon all Novices from your deck and hand.',
  },
  'temple-guard': {
    name: 'Temple Guard', faction: 'Order', categories: ['Hammerite'], classification: 'common',
    type: 'character', cost: 3, strength: 3,
    description: 'On play, gain 1 strength if your opponent has more characters on board.',
  },
  markander: {
    name: 'Markander', faction: 'Order', categories: ['Hammerite', 'Priest'], classification: 'elite',
    type: 'character', cost: 5, strength: 4, startingCharges: 5,
    description: 'Starts with 5 charges. Each other allied Hammerite entering play removes 1 charge. At zero, summon from deck or hand.',
  },
  zombie: {
    name: 'Zombie', faction: 'Chaos', categories: ['Undead'], classification: 'common',
    type: 'character', cost: 1, strength: 1,
    description: 'On play, summon all Zombies from your discard.',
  },
  haunt: {
    name: 'Haunt', faction: 'Chaos', categories: ['Undead', 'Hammerite'], classification: 'common',
    type: 'character', cost: 3, strength: 3,
    description: 'On play, deal 1 damage without retaliation to the strongest eligible enemy character. Choose among ties.',
  },
  'book-of-ash': {
    name: 'Book of Ash', faction: 'Chaos', categories: ['Necromancer', 'Artifact'], classification: 'elite',
    type: 'instant', cost: 4,
    description: 'Summon a fresh 1-strength copy of a character in your discard. Its on-play effect triggers.',
  },
  cook: {
    name: 'Cook', faction: 'Neutral', categories: ['Servant'], classification: 'common',
    type: 'character', cost: 2, strength: 1,
    description: 'On play, draw a card.',
  },
  'flash-bomb': {
    name: 'Flash Bomb', faction: 'Neutral', categories: ['Equipment'], classification: 'common',
    type: 'instant', cost: 2,
    description: 'Stun a selected enemy character through the end of its owner’s next turn.',
  },
};

export interface CardInstance {
  readonly definitionId: CardDefinitionId;
  readonly strength?: number;
  readonly charges?: number;
  readonly hidden?: boolean;
  readonly stunnedTurns?: number;
}

export function freshCard(definitionId: CardDefinitionId): CardInstance {
  const definition = CARD_DEFINITIONS[definitionId];
  return {
    definitionId,
    ...(definition.strength !== undefined ? { strength: definition.strength } : {}),
    ...(definition.startingCharges !== undefined ? { charges: definition.startingCharges } : {}),
  };
}
