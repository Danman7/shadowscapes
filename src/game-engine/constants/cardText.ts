import type { CardText } from 'src/game-engine/types'
import * as balancing from 'src/game-engine/constants/balancing'

export const ZOMBIE_TEXT: CardText = {
  description: [
    'On play, summon all copies of this card from your discard pile.',
  ],
  flavor:
    "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
}

export const BURRICK_TEXT: CardText = {
  description: [
    `This card starts with ${balancing.BURRICK_ATTRIBUTES.charges} charge`,
    "Whenever this card attacks, if it has charges left, it also attacks the target's adjacent cards and loses a charge.",
  ],
  flavor:
    'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
}

export const HAUNT_TEXT: CardText = {
  description: [
    `This card starts with ${balancing.HAUNT_ATTRIBUTES.charges} charge.`,
    'Whenever your opponent plays a card, if this card is on board, and it has charges left, it attacks the played card.',
  ],
  flavor:
    'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
}

export const MYSTICS_SOUL_TEXT: CardText = {
  description: [
    `+${balancing.MYSTICS_SOUL_BONUS_CHARGES} charge for all allied characters on board.`,
  ],
  flavor:
    "I've decided to take the plunge. If my records are correct, there should be a stash of fire crystals in the lowest oubliette. I'll need them, if I'm going to get the gem called the Mystic's Soul. -- Note found next to Adolpho's corpse",
}

export const BOOK_OF_ASH_TEXT: CardText = {
  description: [
    'Create and summon a copy of a common undead from your discard pile.',
  ],
  flavor:
    "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
}

export const NOVICE_TEXT: CardText = {
  description: [
    'On play, if you control another hammerite with more life than this card, summon all copies of this card from your hand or deck.',
  ],
  flavor:
    'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
}

export const TEMPLE_GUARD_TEXT: CardText = {
  description: [
    `+${balancing.TEMPLE_GUARD_BUFF_ON_LESS_CARDS} life on play if you control fewer cards than your foe.`,
    'Retaliates when attacked.',
  ],
  flavor:
    'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
}

export const SACHELMAN_TEXT: CardText = {
  description: [
    `On play, give +${balancing.SACHELMAN_BUFF_ON_PLAY} life to all hammerites you control with less life than this card.`,
  ],
  flavor:
    'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
}

export const YORA_SKULL_TEXT: CardText = {
  description: [
    `+${balancing.YORA_SKULL_BUFF_ON_PLAY} life to all hammerites you control.`,
  ],
  flavor: 'Yora was a builder of vision and devout keeper of the faith.',
}

export const MARKANDER_TEXT: CardText = {
  description: [
    `This card starts with ${balancing.MARKANDER_ATTRIBUTES.charges} charges.`,
    'Reduce the charges each time a Hammerite is played.',
    'At 0, summon this card to the board.',
  ],
  flavor:
    "Our master is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
}

export const DOWNWINDER_TEXT: CardText = {
  description: ['Steal a coin when attacking the enemy player directly.'],
  flavor:
    "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets.",
}

export const COOK_TEXT: CardText = {
  description: ['On play, draw a card.'],
  flavor:
    "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
}

export const SPEED_POTION_TEXT: CardText = {
  description: ['Chose a card from your hand. It gains haste.'],
  flavor:
    'I was at the pub, saw a couple of bluecoats ambush the guy there. He managed to get away, though. Never seen anyone move that fast before. He just vanished into the shadows.',
}

export const FLASH_BOMB_TEXT: CardText = {
  description: ['Stun target character.'],
  flavor:
    'Put Spring Wiring and Acidic Mixture through the Fusing Machine. A Flux Spheroid will be manufactured. Put the Flux Spheroid and a Steel Plate through the Fusing Machine. A Flash Bomb will be manufactured. -- Blueprint at Soulforge',
}
