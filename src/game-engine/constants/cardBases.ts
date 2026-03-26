import * as balancing from 'src/game-engine/constants/balancing'
import * as cardText from 'src/game-engine/constants/cardText'
import type { CardBase, CardBaseId } from 'src/game-engine/types'
import { messages } from 'src/i18n'

export const CARD_BASES: Record<CardBaseId, CardBase> = {
  // Chaos --------------------------------------- /
  zombie: {
    id: 'zombie',
    name: messages.cards.zombie.name,
    faction: 'chaos',
    categories: ['Undead'],
    type: 'character',
    rank: 'common',
    attributes: balancing.ZOMBIE_ATTRIBUTES,
    text: cardText.ZOMBIE_TEXT,
  },
  burrick: {
    id: 'burrick',
    name: messages.cards.burrick.name,
    type: 'character',
    categories: ['Beast'],
    faction: 'chaos',
    rank: 'common',
    attributes: balancing.BURRICK_ATTRIBUTES,
    text: cardText.BURRICK_TEXT,
  },
  haunt: {
    id: 'haunt',
    name: messages.cards.haunt.name,
    faction: 'chaos',
    categories: ['Undead', 'Hammerite'],
    type: 'character',
    rank: 'common',
    attributes: balancing.HAUNT_ATTRIBUTES,
    text: cardText.HAUNT_TEXT,
  },
  mysticsSoul: {
    id: 'mysticsSoul',
    name: messages.cards.mysticsSoul.name,
    type: 'instant',
    rank: 'elite',
    categories: ['Artifact'],
    faction: 'chaos',
    attributes: balancing.MYSTICS_SOUL_ATTRIBUTES,
    text: cardText.MYSTICS_SOUL_TEXT,
  },
  bookOfAsh: {
    id: 'bookOfAsh',
    name: messages.cards.bookOfAsh.name,
    faction: 'chaos',
    categories: ['Necromancer', 'Artifact'],
    type: 'instant',
    rank: 'elite',
    attributes: balancing.BOOK_OF_ASH_ATTRIBUTES,
    text: cardText.BOOK_OF_ASH_TEXT,
  },

  // Order --------------------------------------- /

  novice: {
    id: 'novice',
    name: messages.cards.novice.name,
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'common',
    attributes: balancing.NOVICE_ATTRIBUTES,
    text: cardText.NOVICE_TEXT,
  },
  templeGuard: {
    id: 'templeGuard',
    name: messages.cards.templeGuard.name,
    faction: 'order',
    categories: ['Hammerite'],
    type: 'character',
    rank: 'common',
    attributes: balancing.TEMPLE_GUARD_ATTRIBUTES,
    text: cardText.TEMPLE_GUARD_TEXT,
  },
  sachelman: {
    id: 'sachelman',
    name: messages.cards.sachelman.name,
    faction: 'order',
    categories: ['Hammerite', 'Brother'],
    type: 'character',
    rank: 'elite',
    attributes: balancing.SACHELMAN_ATTRIBUTES,
    text: cardText.SACHELMAN_TEXT,
  },
  yoraSkull: {
    id: 'yoraSkull',
    name: messages.cards.yoraSkull.name,
    faction: 'order',
    categories: ['Hammerite', 'Artifact'],
    type: 'instant',
    rank: 'elite',
    attributes: balancing.YORA_SKULL_ATTRIBUTES,
    text: cardText.YORA_SKULL_TEXT,
  },
  markander: {
    id: 'markander',
    name: messages.cards.markander.name,
    type: 'character',
    categories: ['Hammerite', 'High', 'Priest'],
    faction: 'order',
    rank: 'elite',
    attributes: balancing.MARKANDER_ATTRIBUTES,
    text: cardText.MARKANDER_TEXT,
  },

  // Shadow --------------------------------------- /

  downwinder: {
    id: 'downwinder',
    name: messages.cards.downwinder.name,
    faction: 'shadow',
    categories: ['Thief'],
    type: 'character',
    rank: 'common',
    attributes: balancing.DOWNWINDER_ATTRIBUTES,
    text: cardText.DOWNWINDER_TEXT,
  },

  // Neutral --------------------------------------- /

  cook: {
    id: 'cook',
    name: messages.cards.cook.name,
    faction: 'neutral',
    categories: ['Household'],
    type: 'character',
    rank: 'common',
    attributes: balancing.COOK_ATTRIBUTES,
    text: cardText.COOK_TEXT,
  },
  speedPotion: {
    id: 'speedPotion',
    name: messages.cards.speedPotion.name,
    type: 'instant',
    rank: 'common',
    categories: ['Equipment'],
    faction: 'neutral',
    attributes: balancing.SPEED_POTION_ATTRIBUTES,
    text: cardText.SPEED_POTION_TEXT,
  },
  flashBomb: {
    id: 'flashBomb',
    name: messages.cards.flashBomb.name,
    type: 'instant',
    rank: 'common',
    categories: ['Equipment'],
    faction: 'neutral',
    attributes: balancing.FLASH_BOMB_ATTRIBUTES,
    text: cardText.FLASH_BOMB_TEXT,
  },
}
