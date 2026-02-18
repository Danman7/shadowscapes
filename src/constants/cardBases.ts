import type { CardBase, CardBaseId } from '@/types'

export const CARD_BASES: Record<CardBaseId, CardBase> = {
  // Chaos --------------------------------------- /
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    cost: 1,
    description: [
      'On play, summon all copies of this card from your discard pile.',
    ],
    flavorText:
      "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    faction: 'chaos',
    categories: ['Undead'],
    type: 'character',
    rank: 'common',
    life: 1,
    strength: 1,
  },
  burrick: {
    id: 'burrick',
    name: 'Burrick',
    cost: 2,
    life: 2,
    strength: 1,
    type: 'character',
    description: [
      "This card starts with 1 charge', 'Whenever this card attacks, if it has charges left, it does also attack the target's adjacent cards and loses a charge instead.",
    ],
    flavorText:
      'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
    categories: ['Beast'],
    faction: 'chaos',
    rank: 'common',
    charges: 1,
  },
  haunt: {
    id: 'haunt',
    name: 'Haunt',
    cost: 3,
    description: [
      'This card starts with 1 charge.',
      'Whenever your opponent plays a card, if you have charges left, damage it by 1 and remove a charge.',
    ],
    flavorText:
      'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    faction: 'chaos',
    categories: ['Undead', 'Hammerite'],
    type: 'character',
    rank: 'common',
    life: 3,
    strength: 1,
    charges: 1,
  },
  mysticsSoul: {
    id: 'mysticsSoul',
    name: "Mystic's Soul",
    cost: 5,
    type: 'instant',
    description: ['+1 charges for all alied characters on board.'],
    flavorText:
      "I've decided to take the plunge. If my records are correct, there should be a stash of fire crystals in the lowest oubliette. I'll need them, if I'm going to get the gem called the Mystic's Soul. -- Note found next to Adolpho's corpse",
    rank: 'elite',
    categories: ['Necromancer', 'Artifact'],
    faction: 'chaos',
  },
  bookOfAsh: {
    id: 'bookOfAsh',
    name: 'Book of Ash',
    cost: 4,
    description: [
      'Create and summon a copy of an Undead from your discard pile.',
    ],
    flavorText:
      "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    faction: 'chaos',
    categories: ['Necromancer', 'Artifact'],
    type: 'instant',
    rank: 'elite',
  },

  // Order --------------------------------------- /

  novice: {
    id: 'novice',
    name: 'Novice',
    cost: 1,
    description: [
      'On play, if you control a stronger Hammerite, summon all copies of this card from your hand or deck.',
    ],
    flavorText:
      'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'common',
    life: 1,
    strength: 1,
  },
  templeGuard: {
    id: 'templeGuard',
    name: 'Temple Guard',
    cost: 3,
    description: [
      '+1 on play if you control fewer cards than your foe.',
      'Retaliates when attacked.',
    ],
    flavorText:
      'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    faction: 'order',
    categories: ['Hammerite', 'Guard'],
    type: 'character',
    rank: 'common',
    life: 3,
    strength: 1,
  },
  sachelman: {
    id: 'sachelman',
    name: 'Brother Sachelman',
    cost: 4,
    description: ['On play, give +1 to all weaker Hammerites you control.'],
    flavorText:
      'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'elite',
    life: 3,
    strength: 1,
  },
  yoraSkull: {
    id: 'yoraSkull',
    name: "Saint Yora's Skull",
    cost: 3,
    description: ['+1 to all Hammerites you control.'],
    flavorText: 'Yora was a builder of vision and devout keeper of the faith.',
    faction: 'order',
    categories: ['Hammerite', 'Artifact'],
    type: 'instant',
    rank: 'elite',
  },
  highPriestMarkander: {
    id: 'highPriestMarkander',
    name: 'High Priest Markander',
    cost: 5,
    life: 4,
    strength: 1,
    type: 'character',
    description: [
      'This card starts with 5 charges.',
      'Reduce the charges each time a Hammerite is played.',
      'At 0, summon this card to the board.',
    ],
    flavorText:
      "Our master is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
    categories: ['Hammerite', 'Priest'],
    faction: 'order',
    rank: 'elite',
    charges: 5,
  },

  // Shadow --------------------------------------- /

  downwinder: {
    id: 'downwinder',
    name: 'Downwinder',
    cost: 2,
    life: 2,
    strength: 1,
    description: ['Steal a coin when attacking the enemy player directly.'],
    flavorText:
      "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets.",
    faction: 'shadow',
    categories: ['Thief'],
    type: 'character',
    rank: 'common',
  },

  // Neutral --------------------------------------- /

  cook: {
    id: 'cook',
    name: 'Cook',
    cost: 1,
    description: ['On play, draw a card.'],
    flavorText:
      "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
    faction: 'neutral',
    categories: ['Servant'],
    type: 'character',
    rank: 'common',
    life: 1,
    strength: 1,
  },
}
