import { DuelBuilder } from '@/state/duelBuilder'
import { CardZone, DuelPlayerId, DuelReadyUser, ZoneKey } from '@/types'

export const generateRandomId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

export const getZoneKey = (playerId: DuelPlayerId, zone: CardZone): ZoneKey => {
  return `${playerId}:${zone}`
}

export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const flipCoinForFirstPlayer = (): DuelPlayerId =>
  Math.random() < 0.5 ? 'Player1' : 'Player2'

export const setInitialPlayersFromUserDecks = (
  players: [DuelReadyUser, DuelReadyUser],
) => {
  const [player1, player2] = players

  return new DuelBuilder()
    .updatePlayer('Player1', {
      name: player1.name,
      userId: player1.id,
    })
    .updatePlayer('Player2', {
      name: player2.name,
      userId: player2.id,
    })
    .putCardsInZone(
      'Player1',
      'Deck',
      player1.deck.map((definitionId) => ({ definitionId })),
    )
    .putCardsInZone(
      'Player2',
      'Deck',
      player2.deck.map((definitionId) => ({ definitionId })),
    )
    .build()
}
