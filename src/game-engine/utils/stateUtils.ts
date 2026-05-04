import type {
  CardInstance,
  Duel,
  DuelCards,
  DuelLog,
  DuelPlayers,
  Player,
  PlayerId,
} from 'src/game-engine/types'

export const updatePlayers = (
  players: DuelPlayers,
  playerId: PlayerId,
  updater: (player: Player) => Player,
): DuelPlayers => ({
  ...players,
  [playerId]: updater(players[playerId]),
})

export const updateCard = (
  cards: DuelCards,
  cardId: string,
  updater: (card: CardInstance) => CardInstance,
): DuelCards => ({
  ...cards,
  [cardId]: updater(cards[cardId]),
})

export const drawCards = (player: Player, amount = 1): void => {
  for (let i = 0; i < amount; i += 1) {
    const cardId = player.deck.shift()
    if (cardId) player.hand.push(cardId)
  }
}

export const resetCharacterAttributes = (card: CardInstance): CardInstance => {
  if (card.base.type !== 'Character') return card

  return {
    ...card,
    attributes: { ...card.base.attributes },
  }
}

export const addLog = (state: Duel, log: DuelLog): void => {
  state.logs = [...state.logs, log]
}

export const resetPlayersReady = (state: Duel): void => {
  for (const player of Object.values(state.players)) {
    player.playerReady = false
  }
}
