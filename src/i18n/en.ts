export const en = {
  card: {
    onPlay: 'Play: ',
    onDiscard: 'Discard: ',
    traits: {
      retaliatesTitle: 'Retaliates: ',
      hiddenTitle: 'Hidden: ',
      retaliatesDescription:
        'When attacked, this character deals damage back to the attacker.',
      hiddenDescription:
        'This character cannot be targeted by enemy attacks or abilities. It can attack the opponent directly.',
    },
  },
  user: {
    contextError:
      'User context is not available. Please ensure you are within a UserProvider.',
    loadingUser: 'Loading user data...',
  },
  duel: {
    contextError:
      'Duel context is not available. Please ensure you are within a DuelProvider.',
    deckLabel: 'Deck',
    discardLabel: 'Discard',
    firstPlayer: '{playerName} plays first.',
    redrawPhaseModal: 'Redraw',
    skipRedraw: 'Skip Redraw',
    replaceCard: 'Replace card',
    waitForOpponent: 'Waiting for opponent',
    playerTurn: "{playerName}'s turn",
    logs: {
      logsTitle: 'Duel Logs',
      playerRedrawnCard: '{playerName} has redrawn a card.',
      playerSkippedRedraw: '{playerName} has skipped redraw.',
    },
  },
}
