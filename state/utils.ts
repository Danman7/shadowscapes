import { CardZone, DuelPlayerId, ZoneKey } from '@/types'

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
