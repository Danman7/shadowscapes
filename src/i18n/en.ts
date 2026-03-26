export const messages = {
  reducer: {
    deckSummary:
      "{playerName}'s deck: {cardCount} cards / {eliteCount} elites / {totalCost} total cost.",
    bothPlayersDraw: 'Both players draw {count} cards.',
    goesFirst: '{playerName} goes first.',
    switchTurn: "{playerName}'s turn so they draw a card.",
    playCard:
      '{playerName} plays {cardName} for {cost} {cost|coin|coins}. They have {remaining} {remaining|coin|coins} left.',
    redrawCard: '{playerName} redraws a card.',
    skipRedraw: '{playerName} skips redraw.',
    attackCardDefeated: '{attackerName} attacks and defeats {defenderName}.',
    attackCardDamage:
      '{attackerName} attacks {defenderName}, dealing {damage} damage. {defenderName} has {remainingLife} life left.',
    attackPlayer:
      '{attackerName} attacks {playerName}. {playerName} has {coins} {coins|coin|coins} left.',
    gainsHaste: '{cardName} gains haste.',
    stunnedByFlashBomb: '{cardName} is stunned by a flash bomb.',
  },

  cardEffects: {
    cookDraw:
      '{playerName} draw another card because of Cook. They have {handCount} {handCount|card|cards} in hand and {deckCount} {deckCount|card|cards} left in deck.',
    zombieResurrect:
      '{playerName} resurrects another {count} {count|Zombie|Zombies} from their discard.',
    noviceSummon:
      '{playerName} summons {count} {count|Novice|Novices} in addition because they have a stronger Hammerite on board.',
    sachelmanBuff:
      'Brother Sachelman gives {buff} life to {count} {count|hammerite|hammerites} on board.',
    templeGuardBuff:
      'Temple Guard gains {buff} life because {opponentName} controls more cards on board.',
    yoraSkullBuff:
      'Yora Skull gives {buff} life to {count} {count|hammerite|hammerites} on board.',
    hauntReactDefeats:
      '{count} {count|Haunt|Haunts} reacts and defeats {cardName}.',
    hauntReactDamage:
      '{count} {count|Haunt|Haunts} reacts. {cardName} loses {damage} life.',
    burrickSplash:
      '{cardName} splashes {count} {count|adjacent card|adjacent cards} for {damage} {damage|damage|damage} loosing a charge.',
    templeGuardRetaliateDefeats:
      'Temple Guard retaliates for {damage} {damage|damage|damage} and defeats {attackerName}.',
    templeGuardRetaliateDamage:
      'Temple Guard retaliates for {damage} {damage|damage|damage}. {attackerName} has {remainingLife} {remainingLife|life|life} left.',
    markanderSummoned:
      'Enough Hammerites were played for High Priest Markander to be summoned.',
  },

  ui: {
    logs: 'Logs',
    drawCards: 'Draw cards',
    redrawPhase: 'Redraw phase',
    playerTurn: "{playerName}'s Turn",
    skipRedraw: 'Skip redraw',
    waitingForOpponent: 'Waiting for opponent...',
    pass: 'Pass',
    endTurn: 'End Turn',
    deck: 'Deck',
    discard: 'Discard',
    ready: 'Ready',
  },

  cards: {
    zombie: {
      name: 'Zombie',
      description: [
        'On play, summon all copies of this card from your discard pile.',
      ],
      flavor:
        "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    },
    burrick: {
      name: 'Burrick',
      description: [
        'This card starts with {charges} {charges|charge|charges}.',
        "Whenever this card attacks, if it has charges left, it also attacks the target's adjacent cards and loses a charge.",
      ],
      flavor:
        'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
    },
    haunt: {
      name: 'Haunt',
      description: [
        'This card starts with {charges} {charges|charge|charges}.',
        'Whenever your opponent plays a card, if this card is on board, and it has charges left, it attacks the played card.',
      ],
      flavor:
        'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    },
    mysticsSoul: {
      name: "Mystic's Soul",
      description: [
        '+{charges} {charges|charge|charges} for all allied characters on board.',
      ],
      flavor:
        "I've decided to take the plunge. If my records are correct, there should be a stash of fire crystals in the lowest oubliette. I'll need them, if I'm going to get the gem called the Mystic's Soul. -- Note found next to Adolpho's corpse",
    },
    bookOfAsh: {
      name: 'Book of Ash',
      description: [
        'Create and summon a copy of a common undead from your discard pile.',
      ],
      flavor:
        "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    },
    novice: {
      name: 'Novice',
      description: [
        'On play, if you control another hammerite with more life than this card, summon all copies of this card from your hand or deck.',
      ],
      flavor:
        'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    },
    templeGuard: {
      name: 'Temple Guard',
      description: [
        '+{buff} life on play if you control fewer cards than your foe.',
        'Retaliates when attacked.',
      ],
      flavor:
        'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    },
    sachelman: {
      name: 'Sachelman',
      description: [
        'On play, give +{buff} life to all hammerites you control with less life than this card.',
      ],
      flavor:
        'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
    },
    yoraSkull: {
      name: "Saint Yora's Skull",
      description: ['+{buff} life to all hammerites you control.'],
      flavor: 'Yora was a builder of vision and devout keeper of the faith.',
    },
    markander: {
      name: 'Markander',
      description: [
        'This card starts with {charges} {charges|charge|charges}.',
        'Reduce the charges each time a Hammerite is played.',
        'At 0, summon this card to the board.',
      ],
      flavor:
        "Our master is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
    },
    downwinder: {
      name: 'Downwinder',
      description: ['Steal a coin when attacking the enemy player directly.'],
      flavor:
        "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets.",
    },
    cook: {
      name: 'Cook',
      description: ['On play, draw a card.'],
      flavor:
        "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
    },
    speedPotion: {
      name: 'Speed Potion',
      description: ['Chose a card from your hand. It gains haste.'],
      flavor:
        'I was at the pub, saw a couple of bluecoats ambush the guy there. He managed to get away, though. Never seen anyone move that fast before. He just vanished into the shadows.',
    },
    flashBomb: {
      name: 'Flash Bomb',
      description: ['Stun target character.'],
      flavor:
        'Put Spring Wiring and Acidic Mixture through the Fusing Machine. A Flux Spheroid will be manufactured. Put the Flux Spheroid and a Steel Plate through the Fusing Machine. A Flash Bomb will be manufactured. -- Blueprint at Soulforge',
    },
  },
} as const
