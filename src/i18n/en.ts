export const messages = {
  reducer: {
    deckSummary:
      "{playerName}'s deck: {cardCount} cards / {eliteCount} elites / {totalCost} total cost.",
    bothPlayersDraw: 'Both players draw {count} cards.',
    goesFirst: '{playerName} goes first.',
    switchTurn: "It's {playerName}'s turn.",
    playCard: '{playerName} plays {cardName}.',
    redrawCard: '{playerName} redraws a card.',
    skipRedraw: '{playerName} skips redraw.',
    attackCardDefeated: '{attackerName} defeats {defenderName}.',
    attackCardDamage: '{attackerName} deals {damage} damage to {defenderName}.',
    attackPlayer:
      '{attackerName} attacks {playerName} ({coins} {coins|coin|coins} left).',
    gainsHaste: '{cardName} gains haste.',
    stunned: '{cardName} is stunned.',
  },

  cardEffects: {
    cookDraw: '{playerName} draws another card.',
    zombieResurrect:
      '{count} {count|Zombie|Zombies} {count|is|are} resurrected.',
    noviceSummon:
      '{count} {count|Novice|Novices} {count|is|are} summoned in addition.',
    buffOnBoard:
      '{count} {count|hammerite|hammerites} on board gain {buff} life.',
    templeGuardBuff:
      'Temple Guard gains {buff} life because {opponentName} controls more cards on board.',
    hauntReactDefeats:
      '{count} {count|Haunt|Haunts} {count|reacts|react} and {count|defeats|defeat} {cardName}.',
    hauntReactDamage:
      '{count} {count|Haunt|Haunts} {count|reacts|react} . {cardName} loses {damage} life.',
    burrickSplash:
      '{count} {count|adjacent card|adjacent cards} take {damage} damage.',
    retaliateDefeats:
      '{defenderName} retaliates for {damage} {damage|damage|damage} and defeats {attackerName}.',
    retaliateDamage:
      '{defenderName} retaliates for {damage} {damage|damage|damage}.',
    markanderSummoned: 'High Priest Markander is summoned.',
  },

  ui: {
    logs: 'Logs',
    skipRedraw: 'Skip redraw',
    waitingForOpponent: 'Waiting for opponent...',
    pass: 'Pass',
    endTurn: 'End Turn',
    deck: 'Deck',
    discard: 'Discard',
    ready: 'Ready',
    characterDescription: 'Remains on the board until defeated.',
    instantDescription:
      'Has an immediate effect and then goes to the discard pile.',
    remainingLife: 'Remaining life',
    cost: 'Cost',
    amountOfCoins: '{coins} {coins|coin|coins}',
    strength: 'Strength',
    strengthDescription:
      'The amount of life this character takes away when attacking.',
    charges: 'Charges',
    haste: 'Haste',
    hasteDescription: 'Can act immediately after being played.',
    stunned: 'Stunned',
    stunnedDescription: 'Cannot act this turn.',
    hidden: 'Hidden',
    hiddenDescription: 'Cannot be targeted. Can attack the player directly.',
  },

  cards: {
    zombie: {
      name: 'Zombie',
      description: 'On play, summon all Zombies from your discard pile.',
      flavor:
        "The zombie's antipathy for all living creatures is both it's strength and weakness. -- Journals of Morgan, declared anathema by the Smith-in-Exile.",
    },
    burrick: {
      name: 'Burrick',
      description:
        'During your turn, if this card has charges, it can skip attacking and consume a charge to hit a target and its adjacent cards.',
      flavor:
        'The reinforced walls and steel door have been duly installed about your counting room, but I must warn you that we cannot guarantee them against burrick tunnelling.',
    },
    haunt: {
      name: 'Haunt',
      description:
        'When Haunt defeats a character, gain 1 charge. Spend 1 charge: Haunt gains +1 strength for its next attack.',
      flavor:
        'These haunts who inhabit the bodies of my brethren... they must all be killed. -- The apparition of Brother Murus',
    },
    mysticsSoul: {
      name: "Mystic's Soul",
      description:
        'All allied characters on board gain {charges} {charges|charge|charges}.',
      flavor:
        "I've decided to take the plunge. If my records are correct, there should be a stash of fire crystals in the lowest oubliette. I'll need them, if I'm going to get the gem called the Mystic's Soul. -- Note found next to Adolpho's corpse",
    },
    bookOfAsh: {
      name: 'Book of Ash',
      description:
        'Create and summon a copy of a common undead from your discard pile.',
      flavor:
        "I owe my transcendence to the Book of Ash, that tome of legend I recovered so long ago from the sands of long forgotten kings. Within its pages lie the secrets of life, death...and undeath. -- Azaran the Cruel's last mortal words",
    },
    novice: {
      name: 'Novice',
      description:
        'On play, summon all Novices, not in your discard, if you have a stronger Hammerite on board.',
      flavor:
        'This novice has been instructed in the rules and strictures of the Order and has sworn his warrants to be silent in his vigils.',
    },
    templeGuard: {
      name: 'Temple Guard',
      description:
        'Gain {buff} life on play if you control fewer cards than your foe.',
      flavor:
        'Thy hammer pounds the nail, holds the roof-beam. Thy hammer strikes the iron, shapes the cauldron.',
    },
    sachelman: {
      name: 'Sachelman',
      description:
        'On play, give {buff} life to all Hammerites you control with less life than this card.',
      flavor:
        'May the Hammer fall on the unrighteous. Officially, Brother Sachelman',
    },
    yoraSkull: {
      name: "Saint Yora's Skull",
      description: 'Give {buff} life to all Hammerites you control.',
      flavor: 'Yora was a builder of vision and devout keeper of the faith.',
    },
    markander: {
      name: 'Markander',
      description:
        'Loose a charge each time a Hammerite is played. At 0 charges, summon this card to the board.',

      flavor:
        "Our master is old, and the Master Forgers do jostle each other for precedence. But I spy not on my betters. 'Tis in The Builder's Hands.",
    },
    downwinder: {
      name: 'Downwinder',
      description: 'Steal a coin when attacking the enemy player.',
      flavor:
        "We chose our profession in defiance of the greed of the monarchy. We will not live for the sake of taxes to fatten the noble's pockets.",
    },
    cook: {
      name: 'Cook',
      description: 'On play, draw a card.',
      flavor:
        "I suspect that the lamb was somewhat older than this spring's, and  I am in no way fooled by his practice of warming the salad to disguise wilting. If Cook is incapable of finding adequate ingredients, he can be replaced. -- Lord Bafford",
    },
    speedPotion: {
      name: 'Speed Potion',
      description: 'Chose a card from your hand. It gains haste.',
      flavor:
        'I was at the pub, saw a couple of bluecoats ambush the guy there. He managed to get away, though. Never seen anyone move that fast before. He just vanished into the shadows.',
    },
    flashBomb: {
      name: 'Flash Bomb',
      description: 'Stun target character on board.',
      flavor:
        'Put Spring Wiring and Acidic Mixture through the Fusing Machine. A Flux Spheroid will be manufactured. Put the Flux Spheroid and a Steel Plate through the Fusing Machine. A Flash Bomb will be manufactured. -- Blueprint at Soulforge',
    },
  },
} as const
