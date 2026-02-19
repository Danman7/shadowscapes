import type { CardBase, CardBaseId } from '@/types'
import * as balancing from '@/constants/balancing'

export const CARD_BASES: Record<CardBaseId, CardBase> = {
  // Chaos --------------------------------------- /
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    cost: balancing.ZOMBIE_COST,
    life: balancing.ZOMBIE_LIFE,
    strength: balancing.ZOMBIE_STRENGTH,
    description: [
      'On play, summon all copies of this card from your discard pile.',
    ],
    flavorText:
      "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    faction: 'chaos',
    categories: ['Undead'],
    type: 'character',
    rank: 'common',
  },
  burrick: {
    id: 'burrick',
    name: 'Burrick',
    cost: balancing.BURRICK_COST,
    life: balancing.BURRICK_LIFE,
    strength: balancing.BURRICK_STRENGTH,
    charges: balancing.BURRICK_CHARGES,
    type: 'character',
    description: [
      `This card starts with ${balancing.BURRICK_CHARGES} charge`,
      "Whenever this card attacks, if it has charges left, it also attacks the target's adjacent cards and loses a charge.",
    ],
    flavorText:
      'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
    categories: ['Beast'],
    faction: 'chaos',
    rank: 'common',
  },
  haunt: {
    id: 'haunt',
    name: 'Haunt',
    cost: balancing.HAUNT_COST,
    life: balancing.HAUNT_LIFE,
    strength: balancing.HAUNT_STRENGTH,
    charges: balancing.HAUNT_CHARGES,
    description: [
      `This card starts with ${balancing.HAUNT_CHARGES} charge.`,
      'Whenever your opponent plays a card, if this card is on board, and it has charges left, it attacks the played card.',
    ],
    flavorText:
      'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    faction: 'chaos',
    categories: ['Undead', 'Hammerite'],
    type: 'character',
    rank: 'common',
  },
  mysticsSoul: {
    id: 'mysticsSoul',
    name: "Mystic's Soul",
    cost: balancing.MYSTICS_SOUL_COST,
    type: 'instant',
    description: [
      `+${balancing.MYSTICS_SOUL_BONUS_CHARGES} charge for all allied characters on board.`,
    ],
    flavorText:
      "I've decided to take the plunge. If my records are correct, there should be a stash of fire crystals in the lowest oubliette. I'll need them, if I'm going to get the gem called the Mystic's Soul. -- Note found next to Adolpho's corpse",
    rank: 'elite',
    categories: ['Necromancer', 'Artifact'],
    faction: 'chaos',
  },
  bookOfAsh: {
    id: 'bookOfAsh',
    name: 'Book of Ash',
    cost: balancing.BOOK_OF_ASH_COST,
    description: [
      'Create and summon a copy of a common undead from your discard pile.',
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
    cost: balancing.NOVICE_COST,
    life: balancing.NOVICE_LIFE,
    strength: balancing.NOVICE_STRENGTH,
    description: [
      'On play, if you control another hammerite with more life than this card, summon all copies of this card from your hand or deck.',
    ],
    flavorText:
      'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'common',
  },
  priest: {
    id: 'priest',
    name: 'Priest',
    cost: balancing.PRIEST_COST,
    life: balancing.PRIEST_LIFE,
    strength: balancing.PRIEST_STRENGTH,
    type: 'character',
    description: [
      `While this card is in play, whenever an alied character is defeated, gain ${balancing.PRIEST_COINS_GAINED} coin.`,
    ],
    flavorText:
      'Temple Priests will be issued keys to most areas, and are allowed in restricted rooms when authorized by the High Priest. They are also, of course, allowed in their own ',
    faction: 'order',
    categories: ['Hammerite', 'Priest'],
    rank: 'common',
  },
  templeGuard: {
    id: 'templeGuard',
    name: 'Temple Guard',
    cost: balancing.TEMPLE_GUARD_COST,
    life: balancing.TEMPLE_GUARD_LIFE,
    strength: balancing.TEMPLE_GUARD_STRENGTH,
    description: [
      `+${balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS} life on play if you control fewer cards than your foe.`,
      'Retaliates when attacked.',
    ],
    flavorText:
      'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    faction: 'order',
    categories: ['Hammerite', 'Guard'],
    type: 'character',
    rank: 'common',
  },
  sachelman: {
    id: 'sachelman',
    name: 'Brother Sachelman',
    cost: balancing.SACHELMAN_COST,
    life: balancing.SACHELMAN_LIFE,
    strength: balancing.SACHELMAN_STRENGTH,
    description: [
      `On play, give +${balancing.SACHELMAN_BUFF_ON_PLAY} life to all hammerites you control with less life than this card.`,
    ],
    flavorText:
      'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'elite',
  },
  yoraSkull: {
    id: 'yoraSkull',
    name: "Saint Yora's Skull",
    cost: balancing.YORA_SKULL_COST,
    description: [
      `+${balancing.YORA_SKULL_BUFF_ON_PLAY} life to all hammerites you control.`,
    ],
    flavorText: 'Yora was a builder of vision and devout keeper of the faith.',
    faction: 'order',
    categories: ['Hammerite', 'Artifact'],
    type: 'instant',
    rank: 'elite',
  },
  highPriestMarkander: {
    id: 'highPriestMarkander',
    name: 'High Priest Markander',
    cost: balancing.HIGH_PRIEST_MARKANDER_COST,
    life: balancing.HIGH_PRIEST_MARKANDER_LIFE,
    strength: balancing.HIGH_PRIEST_MARKANDER_STRENGTH,
    charges: balancing.HIGH_PRIEST_MARKANDER_CHARGES,
    type: 'character',
    description: [
      `This card starts with ${balancing.HIGH_PRIEST_MARKANDER_CHARGES} charges.`,
      'Reduce the charges each time a Hammerite is played.',
      'At 0, summon this card to the board.',
    ],
    flavorText:
      "Our master is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
    categories: ['Hammerite', 'Priest'],
    faction: 'order',
    rank: 'elite',
  },

  // Shadow --------------------------------------- /

  downwinder: {
    id: 'downwinder',
    name: 'Downwinder',
    cost: balancing.DOWNWINDER_COST,
    life: balancing.DOWNWINDER_LIFE,
    strength: balancing.DOWNWINDER_STRENGTH,
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
    cost: balancing.COOK_COST,
    life: balancing.COOK_LIFE,
    strength: balancing.COOK_STRENGTH,
    description: ['On play, draw a card.'],
    flavorText:
      "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
    faction: 'neutral',
    categories: ['Servant'],
    type: 'character',
    rank: 'common',
  },
}
