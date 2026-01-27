import type { CardBase, CardBaseId } from "../types";

export const CARD_BASES: Record<CardBaseId, CardBase> = {
  zombie: {
    id: "zombie",
    name: "Zombie",
    cost: 1,
    description: ["A shambling undead creature.", "Slow but relentless."],
    flavorText:
      "On play, spawn all copies of this card from your discard pile.",
    faction: "chaos",
    categories: ["undead"],
    type: "character",
    strength: 1,
  },
  haunt: {
    id: "haunt",
    name: "Haunt",
    cost: 3,
    description: [
      "Whenever a foe character enters play, attack it immediately.",
    ],
    flavorText:
      "These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus",
    faction: "chaos",
    categories: ["undead", "hammerite"],
    type: "character",
    strength: 3,
  },
  cook: {
    id: "cook",
    name: "Cook",
    cost: 1,
    description: ["On play draw a card."],
    flavorText:
      "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
    faction: "neutral",
    categories: ["servant"],
    type: "character",
    strength: 1,
  },
  novice: {
    id: "novice",
    name: "Novice",
    cost: 1,
    description: [
      "On play, if you control a stronger Hammerite, spawn all copies of this card from your hand or deck.",
    ],
    flavorText:
      "This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.",
    faction: "order",
    categories: ["hammerite"],
    type: "character",
    strength: 1,
  },
  templeGuard: {
    id: "templeGuard",
    name: "Temple Guard",
    cost: 3,
    description: [
      "+1 on play, if you control less cards than your foe.",
      "Retaliates when attacked.",
    ],
    flavorText:
      "Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.",
    faction: "order",
    categories: ["hammerite", "guard"],
    type: "character",
    strength: 3,
  },
  sachelman: {
    id: "sachelman",
    name: "Brother Sachelman",
    cost: 4,
    description: ["+1 all controlled weaker Hammerites on play."],
    flavorText:
      "May the Hammer fall on the unrighteous. Officially, Brother Sachelman",
    faction: "order",
    categories: ["hammerite"],
    type: "character",
  },
  yoraSkull: {
    id: "yoraSkull",
    name: "Saint Yora's Skull",
    cost: 3,
    description: [
      "+1 to all conrolled Hammerites.",
      "+1 to all Hammerites in hand and deck if deck contains only Order cards.",
    ],
    flavorText: "Yora was a builder of vision and devout keeper of the faith.",
    faction: "order",
    categories: ["artifact"],
    type: "instant",
  },
  bookOfAsh: {
    id: "bookOfAsh",
    name: "Book of Ash",
    cost: 4,
    description: ["Create and spawn a copy of Undead from your discard pile."],
    flavorText:
      "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    faction: "chaos",
    categories: ["artifact"],
    type: "instant",
  },
  downwinder: {
    id: "downwinder",
    name: "Downwinder",
    cost: 2,
    strength: 2,
    description: ["Steal a coin on attacking opponent directly."],
    flavorText:
      "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets.",
    faction: "shadow",
    categories: ["thief"],
    type: "character",
  },
};
