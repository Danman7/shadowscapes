import * as balancing from 'src/game-engine/constants/balancing'
import type { CardText } from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

export const ZOMBIE_TEXT: CardText = {
  description: messages.cards.zombie.description.slice(),
  flavor: messages.cards.zombie.flavor,
}

export const BURRICK_TEXT: CardText = {
  description: [
    formatString(messages.cards.burrick.description[0], {
      charges: balancing.BURRICK_ATTRIBUTES.charges!,
    }),
    messages.cards.burrick.description[1],
  ],
  flavor: messages.cards.burrick.flavor,
}

export const HAUNT_TEXT: CardText = {
  description: [
    formatString(messages.cards.haunt.description[0], {
      charges: balancing.HAUNT_ATTRIBUTES.charges!,
    }),
    messages.cards.haunt.description[1],
  ],
  flavor: messages.cards.haunt.flavor,
}

export const MYSTICS_SOUL_TEXT: CardText = {
  description: [
    formatString(messages.cards.mysticsSoul.description[0], {
      charges: balancing.MYSTICS_SOUL_BONUS_CHARGES,
    }),
  ],
  flavor: messages.cards.mysticsSoul.flavor,
}

export const BOOK_OF_ASH_TEXT: CardText = {
  description: messages.cards.bookOfAsh.description.slice(),
  flavor: messages.cards.bookOfAsh.flavor,
}

export const NOVICE_TEXT: CardText = {
  description: messages.cards.novice.description.slice(),
  flavor: messages.cards.novice.flavor,
}

export const TEMPLE_GUARD_TEXT: CardText = {
  description: [
    formatString(messages.cards.templeGuard.description[0], {
      buff: balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS,
    }),
    messages.cards.templeGuard.description[1],
  ],
  flavor: messages.cards.templeGuard.flavor,
}

export const SACHELMAN_TEXT: CardText = {
  description: [
    formatString(messages.cards.sachelman.description[0], {
      buff: balancing.SACHELMAN_BUFF_ON_PLAY,
    }),
  ],
  flavor: messages.cards.sachelman.flavor,
}

export const YORA_SKULL_TEXT: CardText = {
  description: [
    formatString(messages.cards.yoraSkull.description[0], {
      buff: balancing.YORA_SKULL_BUFF_ON_PLAY,
    }),
  ],
  flavor: messages.cards.yoraSkull.flavor,
}

export const MARKANDER_TEXT: CardText = {
  description: [
    formatString(messages.cards.markander.description[0], {
      charges: balancing.MARKANDER_ATTRIBUTES.charges!,
    }),
    messages.cards.markander.description[1],
    messages.cards.markander.description[2],
  ],
  flavor: messages.cards.markander.flavor,
}

export const DOWNWINDER_TEXT: CardText = {
  description: messages.cards.downwinder.description.slice(),
  flavor: messages.cards.downwinder.flavor,
}

export const COOK_TEXT: CardText = {
  description: messages.cards.cook.description.slice(),
  flavor: messages.cards.cook.flavor,
}

export const SPEED_POTION_TEXT: CardText = {
  description: messages.cards.speedPotion.description.slice(),
  flavor: messages.cards.speedPotion.flavor,
}

export const FLASH_BOMB_TEXT: CardText = {
  description: messages.cards.flashBomb.description.slice(),
  flavor: messages.cards.flashBomb.flavor,
}
