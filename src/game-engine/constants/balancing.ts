import type { CardAttributes } from 'src/game-engine/types'

// Chaos --------------------------------------- /
export const ZOMBIE_ATTRIBUTES: CardAttributes = {
  cost: 1,
  life: 1,
  strength: 1,
}

export const BURRICK_ATTRIBUTES: CardAttributes = {
  cost: 3,
  life: 2,
  strength: 1,
  charges: 1,
}

export const HAUNT_ATTRIBUTES: CardAttributes = {
  cost: 4,
  life: 3,
  strength: 1,
  charges: 1,
}

export const MYSTICS_SOUL_ATTRIBUTES: CardAttributes = {
  cost: 3,
}
export const MYSTICS_SOUL_BONUS_CHARGES = 1

export const BOOK_OF_ASH_ATTRIBUTES: CardAttributes = {
  cost: 5,
}

// Order --------------------------------------- /

export const NOVICE_ATTRIBUTES: CardAttributes = {
  cost: 1,
  life: 1,
  strength: 1,
}

export const TEMPLE_GUARD_ATTRIBUTES: CardAttributes = {
  cost: 4,
  life: 3,
  strength: 1,
}
export const TEMPLE_GUARD_BUFF_ON_LESS_CARDS = 1

export const SACHELMAN_ATTRIBUTES: CardAttributes = {
  cost: 5,
  life: 2,
  strength: 1,
}
export const SACHELMAN_BUFF_ON_PLAY = 1

export const YORA_SKULL_ATTRIBUTES: CardAttributes = {
  cost: 5,
}
export const YORA_SKULL_BUFF_ON_PLAY = 1

export const MARKANDER_ATTRIBUTES: CardAttributes = {
  cost: 5,
  life: 3,
  strength: 1,
  charges: 5,
}

// Shadow --------------------------------------- /

export const DOWNWINDER_ATTRIBUTES: CardAttributes = {
  cost: 2,
  life: 2,
  strength: 1,
}

// Neutral --------------------------------------- /

export const COOK_ATTRIBUTES: CardAttributes = {
  cost: 2,
  life: 1,
  strength: 1,
}

export const SPEED_POTION_ATTRIBUTES: CardAttributes = {
  cost: 1,
}

export const FLASH_BOMB_ATTRIBUTES: CardAttributes = {
  cost: 2,
}
