import * as balancing from 'src/game-engine/constants/balancing'
import type { CardText } from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

export const ZOMBIE_TEXT: CardText = {
  description: messages.cards.zombie.description,
  flavor: messages.cards.zombie.flavor,
}

export const BURRICK_TEXT: CardText = {
  description: formatString(messages.cards.burrick.description, {
    charges: balancing.BURRICK_ATTRIBUTES.charges!,
  }),

  flavor: messages.cards.burrick.flavor,
}

export const GUARDIAN_STATUE_TEXT: CardText = {
  description: messages.cards.guardianStatue.description,
  flavor: messages.cards.guardianStatue.flavor,
}

export const MINES_GUARDIAN_TEXT: CardText = {
  description: '',
  flavor: messages.cards.minesGuardian.flavor,
}

export const HAUNT_TEXT: CardText = {
  description: messages.cards.haunt.description,
  flavor: messages.cards.haunt.flavor,
}

export const MYSTICS_SOUL_TEXT: CardText = {
  description: formatString(messages.cards.mysticsSoul.description, {
    charges: balancing.MYSTICS_SOUL_BONUS_CHARGES,
  }),
  flavor: messages.cards.mysticsSoul.flavor,
}

export const BOOK_OF_ASH_TEXT: CardText = {
  description: messages.cards.bookOfAsh.description,
  flavor: messages.cards.bookOfAsh.flavor,
}

export const NOVICE_TEXT: CardText = {
  description: messages.cards.novice.description,
  flavor: messages.cards.novice.flavor,
}

export const ELEVATED_ACOLYTE_TEXT: CardText = {
  description: messages.cards.elevatedAcolyte.description,
  flavor: messages.cards.elevatedAcolyte.flavor,
}

export const TEMPLE_GUARD_TEXT: CardText = {
  description: formatString(messages.cards.templeGuard.description, {
    buff: balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS,
  }),
  flavor: messages.cards.templeGuard.flavor,
}

export const SACHELMAN_TEXT: CardText = {
  description: formatString(messages.cards.sachelman.description, {
    buff: balancing.SACHELMAN_BUFF_ON_PLAY,
  }),
  flavor: messages.cards.sachelman.flavor,
}

export const YORA_SKULL_TEXT: CardText = {
  description: formatString(messages.cards.yoraSkull.description, {
    buff: balancing.YORA_SKULL_BUFF_ON_PLAY,
  }),
  flavor: messages.cards.yoraSkull.flavor,
}

export const MARKANDER_TEXT: CardText = {
  description: messages.cards.markander.description,
  flavor: messages.cards.markander.flavor,
}

export const DOWNWINDER_TEXT: CardText = {
  description: messages.cards.downwinder.description,
  flavor: messages.cards.downwinder.flavor,
}

export const COOK_TEXT: CardText = {
  description: messages.cards.cook.description,
  flavor: messages.cards.cook.flavor,
}

export const SPEED_POTION_TEXT: CardText = {
  description: messages.cards.speedPotion.description,
  flavor: messages.cards.speedPotion.flavor,
}

export const FLASH_BOMB_TEXT: CardText = {
  description: messages.cards.flashBomb.description,
  flavor: messages.cards.flashBomb.flavor,
}
